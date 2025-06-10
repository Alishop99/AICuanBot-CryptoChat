import React from "react";
import ChatBot from "./components/ChatBot";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-center font-bold text-2xl pt-6">🪙 CuanBot - Crypto Chat</h1>
      <ChatBot />
    </div>
  );
}

export default App;
