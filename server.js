const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// load environment variables first
dotenv.config();

const config = require("./config");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "data.json");

let store = {
  users: {},
  usdToNGN: config.usdToNGN,
  davCoinValueUSD: config.davCoinValueUSD
};

// Load balances
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw);
      store = { ...store, ...parsed };
      console.log("Loaded data.json");
    }
  } catch {}
}

function persistData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch {}
}

loadData();

function ensureUser(username) {
  if (!store.users[username]) {
    store.users[username] = { balanceDC: 0 };
    persistData();
  }
  return store.users[username];
}

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Mine app is live ✅");
});

// ✅ Fetch user info
app.get("/user/:username", (req, res) => {
  const u = ensureUser(req.params.username);
  res.json({
    username: req.params.username,
    balanceDC: u.balanceDC,
    usdToNGN: store.usdToNGN,
    davCoinValueUSD: store.davCoinValueUSD
  });
});

// ✅ Mining route
app.post("/mine", (req, res) => {
  const { username, amount } = req.body;
  if (!username || typeof amount !== "number")
    return res.status(400).json({ error: "Invalid payload" });

  const user = ensureUser(username);
  user.balanceDC += amount;
  persistData();
  res.json({ message: "DavCoins mined", balanceDC: user.balanceDC });
});

// ✅ Withdraw route
app.post("/withdraw", async (req, res) => {
  const { username, amountNGN, recipientAccount } = req.body;
  if (!username || !recipientAccount || typeof amountNGN !== "number")
    return res.status(400).json({ error: "Invalid payload" });

  const user = store.users[username];
  if (!user) return res.status(404).json({ error: "User not found" });

  const availableNGN = Math.round(
    user.balanceDC * store.davCoinValueUSD * store.usdToNGN
  );
  if (availableNGN < amountNGN)
    return res.status(400).json({ error: "Insufficient funds" });

  const dcToDeduct = amountNGN / (store.davCoinValueUSD * store.usdToNGN);
  user.balanceDC = Math.max(0, user.balanceDC - dcToDeduct);

  try {
    const response = await axios.post(
      "https://sandbox.moniepoint.com/api/v1/transfer",
      {
        amount: amountNGN,
        recipient: recipientAccount
      },
      {
        headers: {
          Authorization: `Bearer ${config.moniepointAPIKey}`,
          "Secret-Key": config.moniepointSecret,
          "Content-Type": "application/json"
        }
      }
    );
    persistData();
    res.json({ message: "Withdrawal successful", transaction: response.data });
  } catch (err) {
    user.balanceDC += dcToDeduct; // rollback
    persistData();
    res.status(500).json({
      error: "Moniepoint transfer failed",
      details: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
