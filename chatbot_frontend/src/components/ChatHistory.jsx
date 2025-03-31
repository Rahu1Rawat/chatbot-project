import chatSvg from "../assets/chat.svg";

const ChatHistory = () => {
  return (
    <div className="bg-[#FAFAFA] w-60 rounded-lg flex flex-col p-3 h-full">
      <div className="flex justify-between items-center border-b">
        <div className="font-semibold">Chats</div>
        <div>
          <img src={chatSvg} alt="Chat icon" className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
