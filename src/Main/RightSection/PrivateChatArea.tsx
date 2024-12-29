import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "../Supabase";
import { ChatContext } from "../App";
import Message from "./Messages";
import { getuserbyid } from "../util/getuserbyid";

const PrivateChatArea = ({
  messages,
  setmessages,
}: {
  messages: any[] | null;
  setmessages: any;
}) => {
  const { Currentopenchatid, uuid } = useContext(ChatContext);
  const chatref = useRef<HTMLDivElement>(null);
  const [amount, setamount] = useState(30);
  useEffect(() => {
    chatref.current?.addEventListener("scroll", (f) => {
      const e = f.target as HTMLDivElement;
      if (e.scrollHeight - e.clientHeight + e.scrollTop < 1) {
        setamount((prev) => prev + 10);
        console.log(
          "User has scrolled to the top!",
          e.scrollHeight - e.clientHeight + e.scrollTop
        );
      }
    });
    return () => {
      chatref.current?.removeEventListener("scroll", (f) => {
        const e = f.target as HTMLDivElement;
        if (e.scrollHeight - e.clientHeight + e.scrollTop < 1) {
          setamount((prev) => prev + (10 * prev) / 100);
          console.log(
            "User has scrolled to the top!",
            e.scrollHeight - e.clientHeight + e.scrollTop
          );
        }
      });
    };
  }, []);
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
          async (payload: any) => {
            let userdata = (await getuserbyid(payload.new.Sender)).data.user
              .user_metadata;
            new Notification(userdata.name, {
              body: payload.new.Content,
              icon: userdata.avatar_url,
            });
            console.log(payload);
            if (payload.eventType == "INSERT") {
              if (payload.new.Sender != uuid) {
                fetch(
                  "https://chat-app-react-server-qizz.onrender.com/messageisread",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      id: [payload.new.id],
                      accessToken: (await supabase.auth.getSession()).data
                        .session?.access_token,
                    }),
                  }
                );
                setmessages((prevMessages: any) =>
                  Array.isArray(prevMessages)
                    ? [payload.new, ...prevMessages]
                    : [payload.new]
                );
                ``;
              } else {
                setmessages((messages: any[]) =>
                  messages.map((value) => {
                    if (
                      String(value.Content ?? "") +
                        String(value.created_at) +
                        String(value.chatId) ==
                        String(payload.new.Content ?? "") +
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
            } else if (payload.eventType == "UPDATE") {
              console.log("update");
              setmessages((messages: any[]) =>
                messages.map((value) => {
                  if (
                    String(value.Content ? value.Content : "") +
                      String(value.created_at) +
                      String(value.chatId) ==
                      String(payload.new.Content ? payload.new.Content : "") +
                        String(payload.new.created_at) +
                        String(payload.new.chatId) &&
                    value.ReadAt == null
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
  useEffect(() => {
    getData();
  }, [amount]);
  async function getData() {
    if (Currentopenchatid && Currentopenchatid != -1) {
      const { data, error } = await supabase
        .from("PrivateMessages")
        .select("*")
        .eq("chatId", Currentopenchatid)
        .limit(amount)
        .order("id", { ascending: false });
      // Fetch end point from express server and send a post request with data.id array
      let idsarray = data
        ?.filter((value) => {
          return uuid != value.Sender && value.ReadAt == null;
        })
        .map((value) => value.id);
      if (idsarray && idsarray.length > 0)
        fetch("https://chat-app-react-server-qizz.onrender.com/messageisread", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: idsarray,
            accessToken: (await supabase.auth.getSession()).data.session
              ?.access_token,
          }),
        });

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
      ref={chatref}
      id="ChatArea"
      className="overflow-scroll overflow-x-hidden bg-center bg-no-repeat bg-cover h-[80%] w-full bg-ChatAreaBG  flex flex-col-reverse "
    >
      {messages ? (
        messages?.length == 0 ? (
          <div className="text-MainText h-full w-full text-2xl flex justify-center items-center">
            Start Messaging!
          </div>
        ) : (
          messages?.map((data: any, i: number) => (
            <Fragment key={data.Sender + data.created_at}>
              <Message uuid={uuid} data={data} UserMessageMap={null} />
              {messages && messages[i + 1] ? ( //Date of messages
                getdate(i) != getdate(i + 1) && (
                  <p className="text-center bg-MainText/10 font-bold ">
                    {getdate(i)}
                  </p>
                )
              ) : (
                <p className="text-center bg-MainText/10 font-bold">
                  {getdate(i)}
                </p>
              )}
            </Fragment>
          ))
        )
      ) : (
        <div className="text-MainText h-full w-full text-2xl flex justify-center items-center">
          Loading Message...
        </div>
      )}
    </div>
  );
};

export default PrivateChatArea;
