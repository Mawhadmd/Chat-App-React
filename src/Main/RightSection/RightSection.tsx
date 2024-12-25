import CurrentHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import PrivateChatArea from "./PrivateChatArea";
import GlobalChatArea from "./GlobalChatArea";
import { ChatContext, SettingContext } from "../App";
import { createContext, useContext, useState } from "react";
import { motion } from "motion/react";




export const ChatMessagesContext = createContext<any>(null);
const RightSection = () => {
  const context = useContext(ChatContext);
  const { logged, Currentopenchatid } = context;
  const [messages, setmessages] = useState<any[] | null>(null);

  const { MobileMode } = useContext(SettingContext);
  return logged && Currentopenchatid  ? (
    <section
      id="RightSection"
      className={` h-dvh w-full max-h-dvh flex flex-col`}
    >
      <CurrentHeader></CurrentHeader>
      {Currentopenchatid == "Global" ? (
        <GlobalChatArea
          messages={messages}
          setmessages={setmessages}
        ></GlobalChatArea>
      ) : (
        <PrivateChatArea
          messages={messages}
          setmessages={setmessages}
        ></PrivateChatArea>
      )}
      <ChatInput setmessages={setmessages}></ChatInput>
    </section>
  ) : (
    <motion.section
      id="RightSection"
      className={` ${MobileMode ?'!translate-x-[100%]': "translate-x-0 "} transition-all bg-Main flex flex-col items-center justify-center w-full h-dvh max-h-dvh`}
    >
      <span className=" font-bold text-6xl text-MainText text-center p-5 bg-Secondary w-fit max-w-[500px] rounded-lg h-fit">
        {!logged ? "Login to Add Friends and Private message" : "Select a chat"}
      </span>
    </motion.section>
  );
};

export default RightSection;
