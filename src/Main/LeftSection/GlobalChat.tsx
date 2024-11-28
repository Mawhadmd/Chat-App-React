import { useState, useEffect, useContext } from "react";
import { supabase } from "../Supabase";
import globe from "../../assets/global-communication_9512332.png";
import { ChatContext } from "../App";
 const GlobalChat = ({ setCurrentopenchatid }: any) => {
    const [name, setname] = useState<string>('');
    var {Content,setcontent} = useContext(ChatContext)

    async function getname(id: string) {
        let name = await (await (supabase.auth.admin.getUserById(id))).data.user?.user_metadata.name
        setname(name)
    }

    async function fetchlatestmessage() {
      let { data, error } = await supabase
        .from("Messages")
        .select("Content, Sender")
        .order("created_at", { ascending: false })
        .limit(1);

        if (data) {
        await getname(data[0].Sender)
        setcontent(data[0].Content)
      console.log(data, error, "data,error for messages latest in global chat");
    }
}
  
    useEffect(() => {
      console.log('how tf')
      fetchlatestmessage();
    }, []);
  
    return (
      <div
        onClick={() => {
          setCurrentopenchatid("Global");
          console.log("Set");
        }}
        className="h-24 gap-2 flex items-center pl-5 text-MainPinkishWhite hover:bg-white/20 cursor-pointer border-MainBlue/15 border-[1px]"
      >
        <img src={globe} className="h-10 invert" alt="Globe" />
        <div className="flex flex-col gap-2">
          <span>Global Chat</span>
          <span className="text-sm text-MainPinkishWhite/60">{`${name}: ${Content}`}</span>
        </div>
      </div>
    );
  };
 
  export default GlobalChat