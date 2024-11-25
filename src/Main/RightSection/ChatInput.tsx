import { useContext, useEffect, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext } from "../App";

const ChatArea = () => {
  const context = useContext(ChatContext);
  const { Currentopenchatid } = context;
  const [content, setinputcontent] = useState<string | number | readonly string[] | undefined>("");


  async function SetData() {
    let contentval = content;
    setinputcontent("");
    if (contentval != "") {
      console.log(Currentopenchatid);
      const { data, error } = await supabase
        .from("Messages")
        .insert([
          {
            Global: Currentopenchatid === "Global" || Currentopenchatid,
            Content: contentval,
          },
        ])
        .select();

      console.log(data, error);
    } else alert("Write something");
  }

  return (
    <div
      id="ChatInput"
      className=" gap-3 transition-all  bg-MainBlack flex items-center  h-[10%]  w-full content-center px-5 "
    >
      <input
        onChange={(e) => {
          setinputcontent(e.target.value);
        }}
        value={content}
        type="text"
        placeholder="Text Here"
        className="w-[95%] shadow-[-5px_5px_15px_1px_rgba(0,0,0,0.589)]  transition-all rounded-3xl p-4 focus:!ring-4 focus:p-3 bg-black/60 text-Mainpink focus:ring-MainSky focus:outline-none"
      />
      <button
        onClick={() => {
			SetData();
        }}
        className={`w-[5%] hover:bg-MainPinkishWhite transition-all duration-500 bg-Mainpink rounded-full p-4`}
      >
        Send
      </button>
    </div>
  );
};

export default ChatArea;
