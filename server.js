const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const { askOpenAI } = require("./utils/openai");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  // Simple keyword check
  if (message.toLowerCase().includes("harga") || message.toLowerCase().includes("bitcoin")) {
    try {
      const { data } = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd");
      const btc = data.bitcoin.usd;
      const eth = data.ethereum.usd;
      return res.json({
        reply: `💰 Harga saat ini:\n🟠 BTC: $${btc}\n🔵 ETH: $${eth}`
      });
    } catch (error) {
      return res.json({ reply: "Gagal mengambil data harga 😢" });
    }
  }

  // Otherwise, use AI
  try {
    const aiReply = await askOpenAI(message);
    res.json({ reply: aiReply });
  } catch (err) {
    res.json({ reply: "Gagal menjawab 😓" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
