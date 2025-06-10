import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ChatBubble from "./ChatBubble";

const ChatBot = () => {
  const [messages, setMessages] = useState([{ text: "Halo! Mau tanya apa soal crypto hari ini? 🚀", sender: "bot" }]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", { message: input });
      const botMessage = { text: res.data.reply, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: "Maaf, ada error 😢", sender: "bot" }]);
    }

    setInput("");
  };

  return (
    <div className="p-4 max-w-xl mx-auto mt-10 shadow-lg rounded-xl bg-white">
      <div className="h-96 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="border flex-1 p-2 rounded"
          placeholder="Tulis pertanyaanmu..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={sendMessage}>
          Kirim
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
