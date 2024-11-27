import { useContext, useEffect, useState } from "react";
import pfp from "../../assets/grayuserpfp.png";
import { supabase } from "../Supabase";
import { ChatContext } from "../App";
const Contacts = ({name , id }:any) => {
  const [latestmessage, setlatestmessage] = useState<{Content:string,Sender:string}[]>([])
  let {setCurrentopenchatid, uuid} = useContext(ChatContext)
  // useEffect(() => {
  //   getlatestmessage()
  // },[])
  async function getlatestmessage() {
    let { data, error } = await supabase
    .from("PrivateMessages")
    .select("Content, Sender")
    .match({ 
      Sender: uuid, 
      Receiver: id 
    })
    .order('created_at', { ascending: false }).limit(1);
  
  if (error) {
    console.log("Error fetching messages:", error);
  } else {
    console.log(data, 'latest messages');
  }
  if(data)
  setlatestmessage([data[0].Content,data[0].Sender])
  }

  return (
    <>
      <div
      onClick={()=>{setCurrentopenchatid(id)}}
        className="text-MainPinkishWhite   border-collapse 
w-full hover:z-10 mx-auto h-20 bg-MainBlack border-MainBlue/15
      border-spacing-2 border-[1px]  mb-[-1px] flex
      border-solid cursor-pointer hover:bg-white/20 transition-all items-start"
      >
        <div className="w-20 h-20">
          <img src={pfp} alt="Profile Picture" className="w-20 rounded-full" />
        </div>
        <div className="flex flex-col my-2 ">
          <span>{name.get(id) + " #" + id.slice(0,5)}</span>
          {latestmessage && latestmessage[0] && <span className="text-xs opacity-70">you: {latestmessage[0].Content}</span>}
        </div>
      </div>
    </>
  );
};

export default Contacts;
