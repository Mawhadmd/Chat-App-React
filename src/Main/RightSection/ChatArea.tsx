import { useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext } from "../App";

const ChatArea = () => {
  const [messages, setmessages] = useState<any[] | null>([]);
  const context = useContext(ChatContext);
  const { Currentopenchatid } = context;
  const [uuid, setuuid] = useState<string | undefined>()
  const ChatArea = useRef<HTMLDivElement>(null)
  async function getuuid(){
    let user = await supabase.auth.getUser()
    let uuid = user.data.user?.id
    setuuid(uuid)
  }
  useEffect(() => {
    
      const channels = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Messages' },
        (payload) => {
          console.log('Change received!',messages, payload)
          setmessages((PreviousMessages)=>[...(PreviousMessages || []), payload.new])
        }
      )
      .subscribe()

    return () => {
      channels.unsubscribe()
    };
  }, []);

  useEffect(() => {
    getuuid()
    getData();
    }
  , [Currentopenchatid]);
  
  async function getData() {
    let isglobal = Currentopenchatid == "Global";
    if (isglobal) {
      var { data, error } = await supabase
        .from("Messages")
        .select("*")
        .eq("Global", true)  .order('id', {ascending: true}).
        limit(30);
    } else {
      var { data, error } = await supabase
      .from("Messages")
      .select("*")
      .eq("Receiver", Currentopenchatid)
      .limit(30);
    }
    console.log(data, error, "data, error for Getdata");
    setmessages(data);
  }
  useEffect(()=>{
    ChatArea.current?.scrollTo(0,ChatArea.current.scrollHeight);
  },[messages])

  return (
    
    <div 
      id="ChatArea"
      ref={ChatArea}
      className="scroll-smooth overflow-scroll overflow-x-hidden bg-center bg-no-repeat bg-cover h-[80%] w-full bg-ChatAreaBG "
    > 
    
      {messages?.map((data,i) => (
     
        <div key={i} className={`p-4 text-2xl w-fit h-fit ${String(data.Sender) != String(uuid)? 'bg-MainBlue m-2 ml-auto rounded-t-lg rounded-bl-lg': 'bg-Mainpink m-2  rounded-e-lg rounded-t-lg  '}`}>
          {data.Content}
        </div>
      ))}
    </div>
  );
};

export default ChatArea;
