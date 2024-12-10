import { useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext, SettingContext,  } from "../App";
import audio from "../../assets/WhatsappMessage.mp3"
import Message from "./Message";
import BGimage from "../../assets/blackbackground.png";

const ChatArea = () => {
  
  const [messages, setmessages] = useState<any[] | null>(null);
  const context = useContext(ChatContext);
  const { Currentopenchatid, uuid, setcontent } = context;
  const [UserMessageMap, setUserMessageMap] = useState(new Map());
  const ChatArea = useRef<HTMLDivElement>(null);
  const { lightmode } = useContext(SettingContext);
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
              payload.new,
              ...(PreviousMessages || []),
            ]);
            setcontent(payload.new);
            (()=>new Audio(audio).play())()
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
                ? [payload.new, ...prevMessages]
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
  }, [Currentopenchatid]); 

  useEffect(() => {
    setmessages(null)
    getData(); //gets messages in the current chat area
  }, [Currentopenchatid]); 

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

      let UserMessageMap = new Map();
      if (!!data) {
        for (let i = 0; i < data?.length; i++) {
          if (!UserMessageMap.has(data[i].Sender)) {
            var { data: payload } =await fetch('http://localhost:8080/getuserbyid', {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({id: data[i].Sender})
            }).then(res => res.json())

            UserMessageMap.set(data[i].Sender, {
              name: payload.user?.user_metadata.name,
              id: payload.user?.id,
              color: null,
            });
          }
        }
        setUserMessageMap(UserMessageMap);
        setmessages(data);
      }
      console.log(data, error, "data, error for Getdata");
    }
  }

useEffect(() => {
  setUserMessageMap((prevMap) => {
    const newMap = new Map(prevMap);
    newMap.forEach((value, key) => {
      newMap.set(key, { ...value, color: 'update' });
    });
    return newMap;
  });
},[lightmode]);

console.log(UserMessageMap)
  return (
    <div
      id="ChatArea"
      ref={ChatArea}
      style={{backgroundImage: `url(${BGimage})`}}
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
              key={i + UserMessageMap.get(data.Sender).color}
              uuid={uuid}
              i={i}
              data={data}
              UserMessageMap={UserMessageMap}
              setUserMessageMap={setUserMessageMap}
            />
          ))
        )
      ) : (
        <div className="text-white h-full w-full text-2xl flex justify-center items-center">
          Loading Message...
        </div>
      )}{" "}
    </div>
  );
};

export default ChatArea;
