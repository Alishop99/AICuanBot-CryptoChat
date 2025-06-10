const axios = require("axios");

const getCryptoPrice = async (coin) => {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd&include_24hr_change=true`;
    const response = await axios.get(url);
    const data = response.data[coin];

    if (!data) return null;

    const price = data.usd;
    const change = data.usd_24h_change;

    // Analisis sederhana: jika naik >3% beli mungkin berisiko, jika turun >3% bisa peluang beli
    let advice = "ℹ️ Stabil.";
    if (change > 3) advice = "📈 Harga naik tajam, hati-hati FOMO!";
    else if (change < -3) advice = "📉 Turun signifikan, mungkin peluang beli.";

    return `💰 ${coin.toUpperCase()} saat ini: $${price.toLocaleString()} (24 jam: ${change.toFixed(2)}%)\n${advice}`;
  } catch (err) {
    console.error("❌ CoinGecko Error:", err.message);
    return null;
  }
};

module.exports = { getCryptoPrice };
