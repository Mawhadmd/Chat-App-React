import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext, SettingContext } from "../App";
import audio from "../../assets/WhatsappMessage.mp3";
import BGimage from "../../assets/blackbackground.png";
import { getuserbyid } from "../util/getuserbyid";
import { getRandomColor } from "../util/getRandomColor";
import Message from "./Messages";


export interface UserMessage {
  name: string;
  id: string;
  color: string | null;
}
const GlobalChatArea = ({
  messages,
  setmessages,
}: {
  messages: any[] | null;
  setmessages: any;
}) => {
  const { uuid } = useContext(ChatContext);
  const [UserMessageMap, setUserMessageMap] = useState(new Map());
  const { lightmode } = useContext(SettingContext);

  useEffect(() => {
    async function setnewuserinmessage(senderid: string) {
      console.log("setting new user");
      var { data: payload, error } = await getuserbyid(senderid);
      let newmap = new Map();
      newmap.set(senderid, {
        name: payload.user?.user_metadata.name,
        id: payload.user?.id,
        color: getRandomColor(
          senderid == uuid
            ? getComputedStyle(document.documentElement).getPropertyValue(
                "--Secondary"
              )
            : getComputedStyle(document.documentElement).getPropertyValue(
                "--actionColor"
              )
        ),
      });
      if (payload)
        setUserMessageMap((prev: Map<string, UserMessage>) => {
          const newMap = new Map(prev);
          newmap.forEach((value, key) => newMap.set(key, value));
          return newMap;
        });
      if (error) {
        console.log(
          error,
          "error while processing (getting id of) new user in the message"
        );
      }
    }
    const channels = supabase
      .channel("Changes-in-chatArea-Global")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Messages" },
        (payload: any) => {
          if (!UserMessageMap.get(payload.new.Sender))
            setnewuserinmessage(payload.new.Sender);
          if (payload.new.Sender != uuid) {
            // doesn't fetch the message for this user

            setmessages((PreviousMessages: any) => [
              payload.new,
              ...(PreviousMessages || []),
            ]);
            (() => new Audio(audio).play())();
          } else {
            setmessages((messages: any[]) =>
              messages.map((value) => {
                if (
                  value.Content + value.created_at ==
                    payload.new.Content + payload.new.created_at &&
                  value.Pending
                ) {
 
                  return payload.new;
                } else {
      
                  return value;
                }
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      channels.unsubscribe();
    };
  }, [UserMessageMap]); //listen to new messages

  useEffect(() => {
    setmessages(null);
    Setdatatomap(); //gets messages in the current chat area
  }, []);

  async function Setdatatomap() {
    const { data, error } = await supabase
      .from("Messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    let UserMessageMap = new Map();
    if (!!data) {
      let UsersSet = new Set();
      for (let i = 0; i < data?.length; i++) {
        UsersSet.add(data[i]);
      }

      let UsersSetarr: any[] = Array.from(UsersSet);
      for (let i = 0; i < UsersSetarr.length; i++) {
        var { data: payload } = await getuserbyid(UsersSetarr[i].Sender);
        UserMessageMap.set(UsersSetarr[i].Sender, {
          name: payload.user?.user_metadata.name,
          id: payload.user?.id,
          color: getRandomColor(
            UsersSetarr[i].Sender == uuid
              ? getComputedStyle(document.documentElement).getPropertyValue(
                  "--Secondary"
                )
              : getComputedStyle(document.documentElement).getPropertyValue(
                  "--actionColor"
                )
          ),
        });
      }
      setUserMessageMap(UserMessageMap);
      setmessages(data);
    } else {
      alert("Error setting map messages,check console");
      console.log(error);
    }
  }

  useEffect(() => {
    setUserMessageMap((prevMap: Map<string, UserMessage>) => {
      const newMap = new Map(prevMap);
      if (newMap.size == 0)
        newMap.forEach((value, key) => {
          newMap.set(key, {
            ...value,
            color: getRandomColor(
              key == uuid
                ? getComputedStyle(document.documentElement).getPropertyValue(
                    "--Secondary"
                  )
                : getComputedStyle(document.documentElement).getPropertyValue(
                    "--actionColor"
                  )
            ),
          });
        });
      return newMap;
    });
  }, [lightmode]); //changes color on lightmode change

  const getdate = useCallback(
    (i: number) => {
      if (messages && messages[i])
        return new Date(messages[i].created_at)
          .toLocaleDateString("en-US", {
            weekday: "short",
            month: "2-digit",
            day: "numeric",
            year: "numeric",
          })
          .replace(",", "");
    },
    [messages]
  ); //get date
  return (
    <div
      id="ChatArea"
      style={{ backgroundImage: `url(${BGimage})` }}
      className="overflow-scroll overflow-x-hidden bg-center bg-no-repeat bg-cover h-[80%] w-full bg-ChatAreaBG  flex flex-col-reverse "
    >
      {messages ? (
        messages?.length == 0 ? (
          <div className="text-MainText h-full w-full text-2xl flex justify-center items-center">
            Start Messaging!
          </div>
        ) : (
          messages?.map((data: any, i: number) => (
             <Fragment key={data.Sender + data.created_at} >
              <Message
                uuid={uuid}
                data={data}
                UserMessageMap={UserMessageMap}
              />

              {messages && messages[i + 1] ? (
                getdate(i) != getdate(i + 1) && (
                  <p
                    className="text-center bg-MainText/10 font-bold "
                  >
                    {getdate(i)}
                  </p>
                )
              ) : (
                <p
                  className="text-center bg-MainText/10 font-bold"
                >
                  {getdate(i)}
                </p>
              )}
          </Fragment>
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

export default GlobalChatArea;
