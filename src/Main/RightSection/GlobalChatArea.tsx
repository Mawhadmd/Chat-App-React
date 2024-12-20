import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext, SettingContext } from "../App";
import audio from "../../assets/WhatsappMessage.mp3";
import convertTime from "../util/convertTime";
import getChatId from "../util/getChatId";
import BGimage from "../../assets/blackbackground.png";
import { getuserbyid } from "../util/getuserbyid";
import { getRandomColor } from "../util/getRandomColor";
interface UserMessage {
  name: string;
  id: string;
  color: string | null;
}
interface Message {
  data: any;
  uuid: string;
  UserMessageMap: Map<string, UserMessage>;
}
interface UserMessage {
  name: string;
  id: string;
  color: string | null;
}
const Message = ({ data, uuid, UserMessageMap }: Message) => {
  const { Currentopenchatid, setCurrentopenchatid, setOtheruserid } =
    useContext(ChatContext);

  return (
    <div>
      {!!UserMessageMap.get(data.Sender) && (
        <div
          className={`p-1 pl-2 text-xl text-MainText flex break-words flex-col w-fit h-fit max-w-[50vw]  ${
            String(data.Sender) != String(uuid)
              ? " bg-actionColor border-MainText  border-solid border-b-[1px] text-black m-2 ml-auto  rounded-t-lg rounded-bl-lg"
              : "bg-Secondary border-actionColor  border-solid border-b-[1px] text-white m-2  rounded-e-lg rounded-t-lg  "
          }`}
        >
          {Currentopenchatid == "Global" ? (
            <span
              onClick={() =>
                getChatId(
                  data.Sender,
                  uuid,
                  setOtheruserid,
                  setCurrentopenchatid
                )
              }
              className={`cursor-pointer  text-sm w-full font-bold  ${
                String(data.Sender) != String(uuid)
                  ? " hover:!text-black"
                  : "hover:!text-MainText "
              }`}
              style={{ color: UserMessageMap.get(data.Sender)?.color! }}
            >
              {UserMessageMap.get(data.Sender)!.name}
            </span>
          ) : null}
          <span className="p-2  w-full">{data.Content}</span>
          <span className="text-sm   ml-auto w-full">
            {convertTime(data.created_at)}
          </span>
        </div>
      )}
    </div>
  );
};
const GlobalChatArea = ({
  messages,
  setmessages,
}: {
  messages: any;
  setmessages: any;
}) => {
  const { uuid } = useContext(ChatContext);
  const [UserMessageMap, setUserMessageMap] = useState(new Map());
  const ChatArea = useRef<HTMLDivElement>(null);
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
          if (payload.new.Sender != uuid)
            // doesn't fetch the message for this user
            setmessages((PreviousMessages: any) => [
              payload.new,
              ...(PreviousMessages || []),
            ]);

          (() => new Audio(audio).play())();
        }
      )
      .subscribe();

    return () => {
      channels.unsubscribe();
    };
  }, []); //listen to new messages

  useEffect(() => {
    setmessages(null);
    getData(); //gets messages in the current chat area
  }, []);

  async function getData() {
    const { data, error } = await supabase
      .from("Messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    console.log(data, error);
    Setdatatomap(data, error);
  }
  async function Setdatatomap(data: any[] | null, error: any) {
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
  }, [lightmode]);
const getdate = useCallback(
    (i: number) => {
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
  );
  return (
    <div
      id="ChatArea"
      ref={ChatArea}
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
            <>
              <Message
                key={data.id} //maybe get the database key
                uuid={uuid}
                data={data}
                UserMessageMap={UserMessageMap}
              />

{messages[i + 1] ? (
                getdate(i) != getdate(i + 1) && (
                  <p className="text-center bg-MainText/10 ">{getdate(i)}</p>
                )
              ) : (
                <p className="text-center bg-MainText/30">{getdate(i)}</p>
              )}
            </>
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
