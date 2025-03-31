import ChatBox from "../components/ChatBox";
import ChatHistory from "../components/ChatHistory";
import Header from "../components/Header";

const HomePage = () => {
  return (
    <div className="bg-[#E9E6DE] min-h-screen w-full flex flex-col">
      <div className="p-3">
        <Header />
      </div>
      <div className="flex flex-grow pl-3 pr-3 pb-3">
        <div className="pr-3">
          <ChatHistory />
        </div>
        <div className="w-full flex-grow">
          <ChatBox />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
