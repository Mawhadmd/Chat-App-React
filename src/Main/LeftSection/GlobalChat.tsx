import { useState, useEffect, useContext } from "react";
import { supabase } from "../Supabase";
import globe from "../../assets/global-communication_9512332.png";
import { ChatContext } from "../App";
import convertTime from "../util/convertTime";
import { getname } from "../util/getnamebyid";
const GlobalChat = ({ setCurrentopenchatid }: any) => {
  const [name, setname] = useState<string>("");
  const [latestMessagetime, setlatestmessagetime] = useState<string>("");
  var { Content: newmessage, setcontent } = useContext(ChatContext);



  async function fetchlatestmessage() {
    let { data, error } = await supabase
      .from("Messages")
      .select("Content, Sender, created_at")
      .order("created_at", { ascending: false })
      .limit(1);

    if (data) {
      getname(data[0].Sender).then((name)=>setname(name)).catch((e)=>{console.log('couldn\'t get name ' + e)});
      setlatestmessagetime(data[0].created_at);
      setcontent({ Content: data[0].Content });
 
    }
  }
  useEffect(() => {
    fetchlatestmessage();
  }, []);
  useEffect(() => {
    if (newmessage.created_at) setlatestmessagetime(newmessage.created_at);
  }, [newmessage]);

  return (
    <div
      onClick={() => {
        setCurrentopenchatid("Global");
      }}
      className=" h-24 gap-2 flex items-center pl-5 text-MainText hover:bg-white/20 cursor-pointer border-Secondary/20 border-[1px]"
    >
      <img src={globe} className="h-10 invert" alt="Globe" />
      <div className="flex flex-col gap-2 w-full mx-1">
        <span className="font-bold">Global Chat</span>
        <div className="flex justify-between">
          <span className=" text-sm text-MainText/60">{`${name}: ${
            newmessage?.Content?.length > 30
              ? newmessage?.Content?.slice(0, 30) + "..."
              : newmessage?.Content
          }`}</span>
          <span className=" text-sm text-MainText text-nowrap">
            At {convertTime(latestMessagetime)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalChat;
