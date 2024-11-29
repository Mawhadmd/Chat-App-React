import CurrentChat from "./CurrentChat";
import ChatInput from "./ChatInput";
import ChatArea from "./ChatArea";
import { ChatContext } from "../App";
import { useContext } from "react";

const RightSection = () => {
  const context = useContext(ChatContext);
  const { logged, Currentopenchatid} = context;
  return (
    logged && !!Currentopenchatid? 
      (    
        <section id="RightSection" className="flex flex-col h-dvh w-full max-h-dvh" >
        <CurrentChat></CurrentChat>
        <ChatArea></ChatArea>
        <ChatInput></ChatInput>     
       </section>
      ):
      (
        <section id="RightSection" className="bg-MainPinkishWhite flex flex-col items-center justify-center w-full h-dvh max-h-dvh" >
         <span className="text-MainBlack font-bold text-6xl text-center p-5 bg-Mainpink w-fit max-w-[500px] rounded-lg h-fit">{!logged? "Login to Add Friends and Private message": "Select a chat"}</span>
       </section>
  )

  );
};

export default RightSection;
