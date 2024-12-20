import { useCallback, useContext, useEffect, useRef } from "react";
import { supabase } from "../Supabase";
import { ChatContext } from "../App";
import BGimage from "../../assets/blackbackground.png";
import convertTime from "../util/convertTime";
interface Message {
  data: any;
  uuid: string;
}

const Message = ({ data, uuid }: Message) => {
  return (
    <div
      className={`p-1 pl-2 text-xl text-MainText flex break-words flex-col w-fit h-fit max-w-[50vw]  ${
        String(data.Sender) != String(uuid)
          ? " bg-actionColor border-MainText  border-solid border-b-[1px] text-black m-2 ml-auto  rounded-t-lg rounded-bl-lg"
          : "bg-Secondary border-actionColor  border-solid border-b-[1px] text-white m-2  rounded-e-lg rounded-t-lg  "
      }`}
    >
      <span className="p-2  w-full">{data.Content}</span>
      <span className="text-sm   ml-auto w-full">
        {convertTime(data.created_at)}
      </span>
    </div>
  );
};
const ChatArea = ({
  messages,
  setmessages,
}: {
  messages: any;
  setmessages: any;
}) => {
  const { Currentopenchatid, uuid } = useContext(ChatContext);
  const ChatArea = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (Currentopenchatid != -1) {
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
            if (payload.new.Sender != uuid)
              setmessages((prevMessages: any) =>
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
  }, [Currentopenchatid]); //listen to new messages
  useEffect(() => {
    if (Currentopenchatid != -1) {
      setmessages(null);
      getData(); //gets messages in the current chat area
    } else {
      setmessages([]);
    }
  }, [Currentopenchatid]);
  async function getData() {
    if (Currentopenchatid && Currentopenchatid != -1) {
      const { data, error } = await supabase
        .from("PrivateMessages")
        .select("*")
        .eq("chatId", Currentopenchatid)
        .limit(30)
        .order("id", { ascending: false });
      console.log(data, error);
      setmessages(data);
    }
  }

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
              />

              {messages[i + 1] ? (
                getdate(i) != getdate(i + 1) && (
                  <p className="text-center bg-MainText/10 ">{getdate(i)}</p>
                )
              ) : (
                <p className="text-center bg-MainText/10">{getdate(i)}</p>
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

export default ChatArea;
