import logo from "../assets/CB_Logo.png";
import profileSvg from "../assets/profile.svg";
const Header = () => {
  return (
    <div className="flex justify-between items-center bg-[#FAFAFA] p-2 rounded-lg">
      <div className="flex gap-2 items-center">
        <div>
          <img src={logo} alt="App Logo" className="h-6" />
        </div>
        <div className="text-[#39594D] text-xl">Chatbot</div>
      </div>
      <div>
      <img src={profileSvg} alt="Profile Logo" className="h-6" />
      </div>
    </div>
  );
};

export default Header;
