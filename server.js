require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { askOpenAI } = require("./utils/openai");
const { getCryptoPrice } = require("./utils/crypto");

const app = express();
app.use(cors());
app.use(express.json());

const detectCoinRequest = (message) => {
  const coins = ["bitcoin", "btc", "ethereum", "eth", "solana", "sol", "bnb", "dogecoin", "doge"];
  return coins.find((c) => message.toLowerCase().includes(c));
};

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  // Cek apakah permintaan harga crypto
  const coin = detectCoinRequest(message);
  if (coin) {
    const coinMap = {
      btc: "bitcoin",
      eth: "ethereum",
      sol: "solana",
      bnb: "binancecoin",
      doge: "dogecoin"
    };

    const coinId = coinMap[coin] || coin;
    const priceInfo = await getCryptoPrice(coinId);
    if (priceInfo) return res.json({ answer: priceInfo });
  }

  // Fallback ke OpenAI jika bukan soal harga
  const response = await askOpenAI(message);
  if (response) {
    res.json({ answer: response });
  } else {
    res.status(500).json({ answer: "Gagal menjawab 😓" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

