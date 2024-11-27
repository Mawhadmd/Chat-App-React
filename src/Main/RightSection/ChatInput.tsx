import { useContext, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext } from "../App";

const ChatArea = () => {
  const context = useContext(ChatContext);
  const { Currentopenchatid, uuid } = context;
  const [content, setinputcontent] = useState<
    string | number | readonly string[] | undefined
  >("");

  async function SetData() {
    let contentval = content;
    setinputcontent("");
    if (contentval != "") {
      if (Currentopenchatid != "Global" && !!Currentopenchatid) {


        var { data:datacheck, error:errorcheck } = await supabase
          .from("PrivateMessages")
          .select("id").match({Sender: uuid, Receiver: Currentopenchatid,}).limit(1);

        var { data, error } = await supabase
          .from("PrivateMessages")
          .insert([
            {
              Content: contentval,
              Sender: uuid,
              Receiver: Currentopenchatid,
            },
          ])
          .select();
          
          console.log(errorcheck,datacheck, 'error,data,check if user has ever sent a message')
          if(datacheck == null){
          var { data:data2, error:error2 } = await supabase
          .from("Contacts")
          .insert([
            {
              Userid: uuid,
              Contactid: Currentopenchatid,
            },
          ])
          .select();
          var { data:data3, error:error3 } = await supabase
          .from("Contacts")
          .insert([
            { 
              Userid: Currentopenchatid,
              Contactid: uuid,
            },
          ])
          .select();
        
          console.log(data2,error2, 'Inserting contact')
          console.log(data3,error3, 'Inserting contact the other way')
        }
      } else {
        var { data, error } = await supabase
          .from("Messages")
          .insert([
            {
              Content: contentval,
            },
          ])
          .select();
      }

      console.log(data, error, "data,error for SetData");
    } else alert("Write something");
  }

  return (
    <div
      id="ChatInput"
      className=" gap-3 transition-all  bg-MainBlack flex items-center  h-[10%]  w-full content-center px-5 "
    >
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
        className="w-[95%] shadow-[-5px_5px_15px_1px_rgba(0,0,0,0.589)]  transition-all rounded-3xl p-4 focus:!ring-4 focus:p-3 bg-black/60 text-Mainpink focus:ring-MainSky focus:outline-none"
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
