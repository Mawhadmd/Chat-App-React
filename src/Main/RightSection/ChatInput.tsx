import { useContext, useEffect, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext, ReloadContactsCtxt } from "../App";

const ChatArea = () => {
  const context = useContext(ChatContext);
  const {
    setCurrentopenchatid,
    setquery,
    Currentopenchatid,
    Otheruserid,
    uuid,
  } = context;
  const { setReloadcontact } = useContext(ReloadContactsCtxt);
  const [content, setinputcontent] = useState<
    string | readonly string[] | undefined
  >("");
  const [contentisfull, setcontentisfull] = useState<boolean>(false);

  async function SetData() {
    if (!contentisfull) {
      let contentval = content;
      setinputcontent("");
      if (contentval != "") {
        if (Currentopenchatid != "Global" && !!Currentopenchatid) {
          var chatid = null;
          if (Currentopenchatid == -1) {
            var { data: data2, error: error2 } = await supabase
              .from("Contacts")
              .insert([
                {
                  User1: uuid,
                  User2: Otheruserid,
                },
              ])
              .select();
            console.log(data2, error2, "Inserting contact");
            setCurrentopenchatid(data2?.[0].chatId);
            chatid = data2?.[0].chatId;
            setquery("");
            setReloadcontact((previous: boolean) => !previous);
          }
          var { data, error } = await supabase // get users messages if exist
            .from("PrivateMessages")
            .insert([
              {
                Content: contentval,
                chatId: Currentopenchatid < 1 ? chatid : Currentopenchatid,
                Receiver: Otheruserid,
              },
            ])
            .select();
        } else {
          var { data, error } = await supabase
            .from("Messages")
            .insert([
              {
                //sender id automatically in
                Content: contentval,
              },
            ])
            .select();
        }

        console.log(data, error, "data,error for SetData");
      } else alert("Write something");
    }
  }

  useEffect(() => {
    if (!!content || content == "")
      if (content.length > 300) {
        setcontentisfull(true);
      } else setcontentisfull(false);
  }, [content]);
  return (
    <div
      id="ChatInput"
      className="relative gap-3 transition-all  bg-MainBlack flex items-center  h-[10%]  w-full content-center px-5 "
    >
      {contentisfull && (
        <div className=" absolute w-32 pointer-events-none bg-MainBlack text-MainBlue text-center p-1 rounded-lg  top-[-120%] right-6 z-20">
          You can't have over 300 characters in here
        </div>
      )}
      <input
        onKeyDown={({ key }) => {
          if (String(key) == "Enter") SetData();
        }}
        onChange={(e) => {
          setinputcontent(e.target.value);
        }}
        value={content}
        type="text"
        placeholder="Text Here"
        className={`w-[95%] shadow-[-5px_5px_15px_1px_rgba(0,0,0,0.589)] transition-all rounded-3xl p-4 focus:!ring-4 focus:p-3 bg-black/60 text-Mainpink ${
          !contentisfull ? "focus:ring-MainBlue" : "focus:ring-red-500"
        } focus:outline-none`}
      />
      <button
        onClick={() => {
          SetData();
        }}
        className={`w-[5%] min-w-fit hover:bg-MainPinkishWhite transition-all duration-500 bg-Mainpink rounded-full p-4`}
      >
        Send
      </button>
    </div>
  );
};

export default ChatArea;
