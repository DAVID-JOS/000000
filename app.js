let totalDC = 0;
let sessionDC = 0;
const miningRate = 10;
const davCoinValueUSD = 10000;
let usdToNGN = 460;

const backendURL = "http://localhost:5000"; // Change to Render URL after deploy
let username = localStorage.getItem("username") || "";

// Login handler
document.getElementById("login-btn")?.addEventListener("click", async () => {
  const input = document.getElementById("username-input").value.trim();
  if (!input) return alert("Enter a username");
  username = input;
  localStorage.setItem("username", username);
  await fetchUser();
  alert(`Logged in as ${username}`);
});

async function fetchUser() {
  if (!username) return;
  try {
    const res = await fetch(`${backendURL}/user/${username}`);
    if (!res.ok) return;
    const data = await res.json();
    totalDC = data.balanceDC || 0;
    usdToNGN = data.usdToNGN || usdToNGN;
    updateDashboard();
  } catch {}
}

function updateDashboard() {
  document.getElementById("total-dc")?.innerText = totalDC;
  document.getElementById("mining-rate")?.innerText = miningRate;
  document.getElementById("session-dc")?.innerText = sessionDC;
  document.getElementById("balance-dc")?.innerText = totalDC;
  document.getElementById("balance-usd")?.innerText = (totalDC * davCoinValueUSD).toLocaleString();
  document.getElementById("balance-ngn")?.innerText = (totalDC * davCoinValueUSD * usdToNGN).toLocaleString();
}

document.getElementById("mine-btn")?.addEventListener("click", async () => {
  if (!username) return alert("Login first");
  totalDC += miningRate;
  sessionDC += miningRate;
  updateDashboard();
  fetch(`${backendURL}/mine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, amount: miningRate })
  }).catch(()=>{});
});

document.getElementById("convert-btn")?.addEventListener("click", () => {
  alert("Conversion handled via Moniepoint backend");
});

document.getElementById("withdraw-btn")?.addEventListener("click", async () => {
  if (!username) return alert("Login first");
  const recipient = document.getElementById("recipient-account").value || "";
  const amountUSD = totalDC * davCoinValueUSD;
  const amountNGN = Math.round(amountUSD * usdToNGN);
  try {
    const res = await fetch(`${backendURL}/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, amountNGN, recipientAccount: recipient })
    });
    const data = await res.json();
    alert(JSON.stringify(data));
    await fetchUser();
  } catch (e) {
    alert("Withdraw failed: " + e.message);
  }
});

setInterval(updateDashboard, 1000);
fetchUser();
