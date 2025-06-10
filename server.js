require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { askOpenAI } = require("./utils/openai");
const { getCryptoPrice } = require("./utils/crypto");

const app = express();
app.use(cors());
app.use(express.json());

// Simpan riwayat percakapan sementara (opsional, bisa diganti dengan database)
const conversationHistory = {};

const detectCoinRequest = (message) => {
  const coins = ["bitcoin", "btc", "ethereum", "eth", "solana", "sol", "bnb", "dogecoin", "doge", "xrp", "gabu"];
  return coins.find((c) => message.toLowerCase().includes(c));
};

const GABU_ADDRESS = "aqkm3s3zdxvkab2vmk8czpjmco3zsq8xqamakaeoueih";

const fetchGabuPrice = async (mintAddress) => {
  const apiKey = process.env.BIRDEYE_API_KEY;
  const url = `https://public-api.birdeye.so/public/price?address=${mintAddress}`;

  try {
    const res = await axios.get(url, {
      headers: { "X-API-KEY": apiKey },
    });
    const price = res.data.data.value;
    return `💰 Harga GABU saat ini: $${price.toFixed(6)} (via Birdeye 🔍)`;
  } catch (err) {
    console.error("❌ Gagal mengambil harga GABU dari Birdeye:", err.message);
    return null;
  }
};

app.post("/api/chat", async (req, res) => {
  const { message, userId } = req.body;
  console.log("📩 Pesan diterima:", message);

  if (!message) {
    return res.status(400).json({ answer: "Pesan tidak boleh kosong." });
  }

  // Cek apakah permintaan harga crypto
  const coin = detectCoinRequest(message);
  if (coin) {
    console.log("💱 Deteksi permintaan harga untuk:", coin);
    const coinMap = {
      btc: "bitcoin",
      eth: "ethereum",
      sol: "solana",
      bnb: "binancecoin",
      doge: "dogecoin",
      xrp: "ripple",
      gabu: "gabu",
    };

    const coinKey = coin.toLowerCase();
    const coinId = coinMap[coinKey] || coinKey;

    if (coinId === "gabu") {
      const gabuInfo = await fetchGabuPrice(GABU_ADDRESS);
      if (gabuInfo) {
        if (userId) {
          conversationHistory[userId] = conversationHistory[userId] || [];
          conversationHistory[userId].push(
            { role: "user", content: message },
            { role: "assistant", content: gabuInfo }
          );
        }
        return res.json({ answer: gabuInfo });
      }
      return res.json({ answer: "Maaf, tidak bisa mengambil harga GABU." });
    }

    try {
      const priceInfo = await getCryptoPrice(coinId);
      console.log(`📈 Hasil harga untuk ${coinId}:`, priceInfo);
      if (priceInfo) {
        if (userId) {
          conversationHistory[userId] = conversationHistory[userId] || [];
          conversationHistory[userId].push(
            { role: "user", content: message },
            { role: "assistant", content: priceInfo }
          );
        }
        return res.json({ answer: priceInfo });
      }
      return res.json({ answer: `Maaf, tidak bisa mengambil harga untuk ${coinKey.toUpperCase()}.` });
    } catch (err) {
      console.error(`❌ Gagal mengambil harga untuk ${coinId}:`, err.message);
      return res.json({ answer: `Maaf, tidak bisa mengambil harga untuk ${coinKey.toUpperCase()}.` });
    }
  }

  // Tangani pertanyaan umum atau analisis dengan OpenAI
  try {
    const isAnalysisRequest = message.toLowerCase().includes("analisis") || message.toLowerCase().includes("analyze");
    const history = userId && conversationHistory[userId] ? conversationHistory[userId] : [];

    const response = await askOpenAI(message, isAnalysisRequest, history);
    if (response) {
      if (userId) {
        conversationHistory[userId] = conversationHistory[userId] || [];
        conversationHistory[userId].push(
          { role: "user", content: message },
          { role: "assistant", content: response }
        );
        if (conversationHistory[userId].length > 10) {
          conversationHistory[userId] = conversationHistory[userId].slice(-10);
        }
      }
      return res.json({ answer: response });
    }
    return res.status(500).json({ answer: "Gagal menjawab karena masalah dengan layanan AI. Silakan coba lagi nanti." });
  } catch (err) {
    console.error("❌ Gagal memproses permintaan OpenAI:", err.message);
    return res.status(500).json({ answer: "Gagal menjawab karena masalah dengan layanan AI. Silakan coba lagi nanti." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
