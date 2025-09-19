const API_BASE = "http://localhost:5000";

// --- Mining ---
document.getElementById("startMining")?.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  if (!username) return alert("Enter username");

  const res = await fetch(`${API_BASE}/mine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, amount: 1 })
  });

  const data = await res.json();
  document.getElementById("balance").textContent = `${data.balanceDC} DC`;
});

// --- Wallet balance ---
document.getElementById("checkBalance")?.addEventListener("click", async () => {
  const username = document.getElementById("walletUsername").value.trim();
  if (!username) return alert("Enter username");

  const res = await fetch(`${API_BASE}/user/${username}`);
  const data = await res.json();

  document.getElementById("walletBalance").textContent = `${data.balanceDC} DC`;

  const ngnValue = Math.round(data.balanceDC * data.davCoinValueUSD * data.usdToNGN);
  document.getElementById("balanceNGN").textContent = `₦${ngnValue}`;
});

// --- Withdraw ---
document.getElementById("withdraw")?.addEventListener("click", async () => {
  const username = document.getElementById("walletUsername").value.trim();
  const recipient = document.getElementById("recipient").value.trim();
  const amountNGN = Number(document.getElementById("amountNGN").value);

  if (!username || !recipient || !amountNGN) return alert("Fill all fields");

  const res = await fetch(`${API_BASE}/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, recipientAccount: recipient, amountNGN })
  });

  const data = await res.json();
  if (data.error) {
    alert("❌ " + data.error);
  } else {
    alert("✅ Withdrawal successful");
  }
});
