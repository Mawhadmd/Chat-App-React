import { useState, useEffect } from "react";
import { supabase } from "../Supabase";
import globe from "../../assets/global-communication_9512332.png";
import convertTime from "../util/convertTime";
import { getname } from "../util/getnamebyid";
const GlobalChat = ({ setCurrentopenchatid }: any) => {
  const [name, setname] = useState<string>("");
  const [ValuesOfLatestMessage, setValuesOfLatestMessage] = useState<any | undefined>();

useEffect(() => {
  const channels = supabase
  .channel("Changes-in-GlobalChat")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "Messages" },
    (payload) => {
      setValuesOfLatestMessage(payload.new);
    }
  )
  .subscribe();
  return () => {
    channels.unsubscribe()
  };
}, []); //listens to database changes and sets the latest message
 
  useEffect(() => { // initialize the latest message
    async function fetchlatestmessage() {
      let { data,error } = await supabase
        .from("Messages")
        .select("Content, Sender, created_at")
        .order("created_at", { ascending: false })
        .limit(1)

      if (data && data?.length>0) {
        getname(data[0].Sender).then((name)=>setname(name)).catch((e)=>{console.log('couldn\'t get name ' + e)});
        setValuesOfLatestMessage({ Content: data[0].Content, created_at: data[0].created_at });
      }else{
        setValuesOfLatestMessage({})
      }
    }
    fetchlatestmessage();
  }, []);

  return (
    !!ValuesOfLatestMessage && <div
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
            ValuesOfLatestMessage.Content?.length > 30
              ? ValuesOfLatestMessage.Content?.slice(0, 30) + "..."
              : ValuesOfLatestMessage.Content
          }`}</span>
          <span className=" text-sm text-MainText text-nowrap">
            At {convertTime(ValuesOfLatestMessage.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalChat;
