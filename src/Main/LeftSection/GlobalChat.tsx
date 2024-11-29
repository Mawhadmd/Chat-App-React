import { useState, useEffect, useContext } from "react";
import { supabase } from "../Supabase";
import globe from "../../assets/global-communication_9512332.png";
import { ChatContext } from "../App";
import convertTime from "../util/convertTime";
 const GlobalChat = ({ setCurrentopenchatid }: any) => {
    const [name, setname] = useState<string>('');
    const [latestMessagetime, setlatestmessagetime] = useState<string>('');
    var {Content:newmessage,setcontent} = useContext(ChatContext)

    async function getname(id: string) {
        let name = await (await (supabase.auth.admin.getUserById(id))).data.user?.user_metadata.name
        setname(name)
    }

    async function fetchlatestmessage() {
      let { data, error } = await supabase
        .from("Messages")
        .select("Content, Sender, created_at")
        .order("created_at", { ascending: false })
        .limit(1);

        if (data) {
        await getname(data[0].Sender)
        console.log(data[0].created_at)
        setlatestmessagetime(data[0].created_at)
        setcontent({Content: data[0].Content})
      console.log(data, error, "data,error for messages latest in global chat");
    }
}
useEffect(() => {
  fetchlatestmessage();
}, []);
useEffect(()=>{
  if(newmessage.created_at)
  setlatestmessagetime(newmessage.created_at)
},[newmessage])
  
    return (
      <div
        onClick={() => {
          setCurrentopenchatid("Global");
          console.log("Set");
        }}
        className=" h-24 gap-2 flex items-center pl-5 text-MainPinkishWhite hover:bg-white/20 cursor-pointer border-MainBlue/20 border-[1px]"
      >
        <img src={globe} className="h-10 invert" alt="Globe" />
        <div className="flex flex-col gap-2 w-full mx-1">
          <span className="font-bold">Global Chat</span>
          <div className="flex justify-between">
          <span className=" text-sm text-MainPinkishWhite/60">{`${name}: ${newmessage?.Content?.length>30? newmessage?.Content?.slice(0,30) + '...': newmessage?.Content}`}</span>
          <span className=" text-sm text-MainPinkishWhite text-nowrap">At {convertTime(latestMessagetime)}</span>
          </div>
        </div>
      </div>
    );
  };
 
  export default GlobalChat