import { Fragment, useCallback, useContext, useEffect } from "react";
import { supabase } from "../Supabase";
import { ChatContext, SettingContext } from "../App";
import BKBGimage from "../../assets/blackbackground.png";
import WhBGimage from "../../assets/whitebackground.jpg";
import Message from "./Messages";



const PrivateChatArea = ({
  messages,
  setmessages,
}: {
  messages: any[] | null;
  setmessages: any;
}) => {
  const { Currentopenchatid, uuid } = useContext(ChatContext);
  const { lightmode } = useContext(SettingContext);
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
            if (payload.new.Sender != uuid) {
              setmessages((prevMessages: any) =>
                Array.isArray(prevMessages)
                  ? [payload.new, ...prevMessages]
                  : [payload.new]
              );``
            } else {
              setmessages((messages: any[]) =>
                messages.map((value) => {
        
                    if (
                    String(value.Content ?? "") + String(value.created_at) + String(value.chatId) ==
                      String(payload.new.Content) +
                      String(payload.new.created_at) +
                      String(payload.new.chatId) &&
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
      if (messages)
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
      style={{ backgroundImage: `${!lightmode? `url(${BKBGimage})`: `url(${WhBGimage})`}` }}
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
              <Message uuid={uuid} data={data} UserMessageMap={null} />
              {messages && messages[i + 1] ? ( //Date of messages
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
      )}
    </div>
  );
};

export default PrivateChatArea;
