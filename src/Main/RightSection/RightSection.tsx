import CurrentChat from "./CurrentChat";
import ChatInput from "./ChatInput";
import ChatArea from "./ChatArea";
import { ChatContext } from "../App";
import { useContext, useState,createContext } from "react";

export const Usermapscontext = createContext<any>(null)
const RightSection = () => {
  const [UserMessageMap, setUserMessageMap] = useState(new Map());
  const context = useContext(ChatContext);
  const { logged, Currentopenchatid} = context;
  return (
    logged && !!Currentopenchatid? 
      (    
        <section id="RightSection" className="flex flex-col h-dvh w-full max-h-dvh" >
          <Usermapscontext.Provider value={{UserMessageMap, setUserMessageMap}} >
        <CurrentChat></CurrentChat>
        <ChatArea></ChatArea>
        </Usermapscontext.Provider>
        <ChatInput></ChatInput>     
       </section>
      ):
      (
        <section id="RightSection" className="bg-Main flex flex-col items-center justify-center w-full h-dvh max-h-dvh" >
         <span className=" font-bold text-6xl text-MainText text-center p-5 bg-Secondary w-fit max-w-[500px] rounded-lg h-fit">{!logged? "Login to Add Friends and Private message": "Select a chat"}</span>
       </section>
  )

  );
};

export default RightSection;
