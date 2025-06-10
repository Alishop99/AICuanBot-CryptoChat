const ChatBubble = ({ message }) => {
  const { sender, text } = message;
  const isBot = sender === "bot";
  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
      <div className={`rounded-xl px-3 py-2 max-w-xs ${isBot ? "bg-gray-200 text-left" : "bg-blue-500 text-white"}`}>
        {text}
      </div>
    </div>
  );
};

export default ChatBubble;
