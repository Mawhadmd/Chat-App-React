import { useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext } from "../App";
import Message from "./Message";

const ChatArea = () => {
  const [messages, setmessages] = useState<any[] | null>([]);
  const context = useContext(ChatContext);
  const { Currentopenchatid, uuid, setcontent } = context;
  const [namesmap, setnamesmap] = useState(new Map());
  const ChatArea = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const channels = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Messages" },
        (payload:any) => {
          console.log("Change received!", messages, payload);
          setmessages((PreviousMessages) => [
            ...(PreviousMessages || []),
            payload.new,
          ]);
          setcontent(payload.new.Content)
        }
      )
      .subscribe();

    return () => {
      channels.unsubscribe();
    };
  }, []); //realtime listener websocket

  useEffect(() => {
    getData(); //gets messages in the current chat area
  }, [Currentopenchatid]); //runs whenever chat changes

  async function getData() {
    let isglobal = Currentopenchatid == "Global";
    if (Currentopenchatid != undefined) {
      if (isglobal) {
        var { data, error } = await supabase
          .from("Messages")
          .select("*")
          .order("id", { ascending: true })
          .limit(30);
      } else {
        
        
        var { data, error } = await supabase
          .from("PrivateMessages")
          .select("*")
          .match({Receiver: Currentopenchatid, Sender:uuid})
          .limit(30);
      }

      {
        let namesmap = new Map();
        if (!!data)
          for (let i = 0; i < data?.length; i++) {
            if (!namesmap.has(data[i].Sender)) {
              var { data: payload } = await supabase.auth.admin.getUserById(
                data[i].Sender
              );

              namesmap.set(data[i].Sender, payload.user?.user_metadata.name);
            }
          }
        setnamesmap(namesmap);
        setmessages(data);
        console.log(data, error, "data, error for Getdata");
      }
    }
  }

  useEffect(() => {
    ChatArea.current?.scrollTo(0, ChatArea.current.scrollHeight);
  }, [messages]); //scrolls down

  return (
    <div
      id="ChatArea"
      ref={ChatArea}
      className="scroll-smooth overflow-scroll overflow-x-hidden bg-center bg-no-repeat bg-cover h-[80%] w-full bg-ChatAreaBG "
    >
      {messages?.map((data, i) => (
        <Message key={i} uuid={uuid} i={i} data={data} namesmap={namesmap} />
      ))}
    </div>
  );
};

export default ChatArea;
