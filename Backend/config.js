require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  usdToNGN: 1600,
  davCoinValueUSD: 1,
  moniepointAPIKey: process.env.MONIEPOINT_API_KEY || "your_api_key",
  moniepointSecret: process.env.MONIEPOINT_SECRET || "your_secret"
};
