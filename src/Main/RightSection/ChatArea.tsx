import { useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext } from "../App";
import Message from "./Message";

const ChatArea = () => {
  const [messages, setmessages] = useState<any[] | null>(null);
  const context = useContext(ChatContext);
  const { Currentopenchatid, uuid, setcontent } = context;
  const [namesmap, setnamesmap] = useState(new Map());
  const ChatArea = useRef<HTMLDivElement>(null);
  console.log("chatid", Currentopenchatid);
  useEffect(() => {
    if (Currentopenchatid == "Global") {
      const channels = supabase
        .channel("Changes-in-chatArea-Global")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "Messages" },
          (payload: any) => {
            console.log("Change received!", messages, payload);
            setmessages((PreviousMessages) => [
              payload.new, ...(PreviousMessages || []),
             
            ]);
            setcontent(payload.new);
          }
        )
        .subscribe();

      return () => {
        channels.unsubscribe();
      };
    } else if (Currentopenchatid != -1) {
      const channels = supabase
        .channel("Changes-in-chatArea-Private")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "PrivateMessages",
            filter: `chatId=eq.${Currentopenchatid}`,
          },
          (payload: any) => {
            console.log("Change received in chatarea!", messages, payload);
            setmessages((prevMessages) =>
              Array.isArray(prevMessages)
                ? [payload.new,...prevMessages]
                : [payload.new]
            );
          }
        )
        .subscribe();

      return () => {
        channels.unsubscribe();
      };
    } else {
      setmessages([]);
    }
  }, [Currentopenchatid]); //realtime listener websocket

  useEffect(() => {
    getData(); //gets messages in the current chat area
  }, [Currentopenchatid]); //runs whenever chat changes

  async function getData() {
    var data, error;
    let isglobal = Currentopenchatid == "Global";
    if (Currentopenchatid != undefined) {
      if (isglobal) {
        let query = await supabase
          .from("Messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(30);
        data = query.data;
        error = query.error;
      } else {
        let { data: dt, error: err } = await supabase
          .from("PrivateMessages")
          .select("*")
          .eq("chatId", Currentopenchatid)
          .limit(30)
          .order("created_at", { ascending: false });

        if (dt) data = dt;
        if (err) error = err;
      }

      let namesmap = new Map();
      if (!!data) {
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
      }
      console.log(data, error, "data, error for Getdata");
    }
  }

  useEffect(() => {
    ChatArea.current?.scrollTo(0, ChatArea.current.scrollHeight);
  }, [messages]); //scrolls down

  return (
    <div
      id="ChatArea"
      ref={ChatArea}
      className=" scroll-smooth overflow-scroll overflow-x-hidden bg-center bg-no-repeat bg-cover h-[80%] w-full bg-ChatAreaBG  flex flex-col-reverse "
    >
      {messages ? (
        messages?.length == 0 ? (
          <div className="text-MainPinkishWhite h-full w-full text-2xl flex justify-center items-center">
            Start Messaging!
          </div>
        ) : (
          messages?.map((data, i) => (
            <Message
              key={i}
              uuid={uuid}
              i={i}
              data={data}
              namesmap={namesmap}
            />
          ))
        )
      ) : (
        <div className="text-MainPinkishWhite h-full w-full text-2xl flex justify-center items-center">
          Loading Message...
        </div>
      )}{" "}
    </div>
  );
};

export default ChatArea;
