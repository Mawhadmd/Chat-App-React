import { useContext, useEffect, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext } from "../App";
const ChatArea = () => {
  const [messages, setmessages] = useState<{ Content: any }[] | null>();
  // Get messages from database for the specific chat
  // put them in an iterable
  const context = useContext(ChatContext);
  const { Currentopenchatid } = context;

  useEffect(() => {
    addEventListener('keypress',({code})=>{
       if(code=="Enter")
        setTimeout(() => {
          getdate();
        }, 100);
    })
    getdate();
  }, [Currentopenchatid]);
  
  async function getdate() {
    console.log(Currentopenchatid)
    let isglobal = Currentopenchatid == "Global";
    if (isglobal) {
      var { data, error } = await supabase
        .from("Messages")
        .select("Content")
        .eq("Global", true)  .order('id', {ascending: true}).
        limit(30);
    } else {
      var { data, error } = await supabase
      .from("Messages")
      .select("Content")
      .eq("Receiver", Currentopenchatid)
      .limit(10);
    }
    console.log(data, error);
    setmessages(data);
  }

  return (
    <div
      id="ChatArea"
      className="overflow-scroll overflow-x-hidden bg-center bg-no-repeat bg-cover h-[80%] w-full bg-ChatAreaBG "
    >
      {messages?.map((data) => (
        <div className="p-2 m-2 w-fit h-fit max-w-[50%] rounded-e-lg rounded-t-lg bg-MainBlue ">
          {data.Content}
        </div>
      ))}
    </div>
  );
};

export default ChatArea;
