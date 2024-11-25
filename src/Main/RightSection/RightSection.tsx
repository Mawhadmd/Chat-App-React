import CurrentChat from "./CurrentChat";
import ChatInput from "./ChatInput";
import ChatArea from "./ChatArea";
import { ChatContext } from "../App";
import { useContext } from "react";

const RightSection = () => {
  const context = useContext(ChatContext);
  const { logged, Currentopenchatid} = context;
  console.log(Currentopenchatid)
  return (
    logged || !!Currentopenchatid? 
      (    
        <section className="flex flex-col w-full max-h-dvh" >
        <CurrentChat></CurrentChat>
        <ChatArea></ChatArea>
        <ChatInput></ChatInput>     
       </section>
      ):
      (
        <section className="bg-MainPinkishWhite flex flex-col items-center justify-center w-full max-h-dvh" >
         <span className="text-MainBlue font-bold text-7xl">{!!Currentopenchatid? "Login to Add Friends and Private message": "Select a chat"}</span>
       </section>
  )

  );
};

export default RightSection;
