import Header from "./components/Header";
import SidePanel from "./components/SidePanel";
import ChatArea from "./components/ChatArea";
import InputBar from "./components/InputBar";

const App = () => {
  return (
    <div className="flex flex-col h-dvh bg-cream-50">
      <SidePanel />
      <Header />
      <ChatArea />
      <InputBar />
    </div>
  );
};

export default App;
