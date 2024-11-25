import CurrentChat from "./CurrentChat";
import ChatInput from "./ChatInput";
import ChatArea from "./ChatArea";

const RightSection = () => {
  
  return (
    <section className="flex flex-col w-full max-h-dvh">
      <CurrentChat></CurrentChat>
      <ChatArea></ChatArea>
      <ChatInput></ChatInput>
    
    </section>
  );
};

export default RightSection;
