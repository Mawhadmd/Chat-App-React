import React, {
  useContext,
  useEffect,
  useState,
  useCallback,

} from "react";
import pfp from "../../assets/grayuserpfp.png";
import { supabase } from "../Supabase";
import { ChatContext } from "../App";
import convertTime from "../util/convertTime";
import getChatId from "../util/getChatId";

interface User {
  id: string;
  user_metadata: {
    name: string;
    avatar_url?: string;
  };
}

interface ContactsProps {
  user: User;
  issearch?: boolean;
  chatId?: string;
}
//make a new component called searchcontacts
const Contacts: React.FC<ContactsProps> = ({
  user,
  chatId,
  issearch = false,
}) => {
  const [latestMessage, setLatestMessage] = useState<string | undefined>();
  const [latestMessagetime, setLatestMessagetime] = useState<
    string | undefined
  >();
  const [inyourcontacts, setinyourcontacts] = useState<boolean>(false);
  const { setCurrentopenchatid, Currentopenchatid, uuid, setOtheruserid } =
    useContext(ChatContext);
  const userId = user.id;
  const name = user.user_metadata.name;
  const customPfp = user.user_metadata.avatar_url;
  console.log(chatId, "chatid for", userId, uuid);

  const sortLatestMessage = useCallback(
    (data: any) => {
      let time = convertTime(data[0].created_at);
      setLatestMessagetime(time);
      if (data && data[0]) {
        const message =
          data[0].Sender === uuid
            ? `You: ${data[0].Content}`
            : `${name}: ${data[0].Content}`;
        setLatestMessage(message);
      }
    },
    [uuid, name]
  );
  useEffect(() => {
    if (issearch && chatId != "-1") {
      setinyourcontacts(true);
    }
  }, []);
  //all this functions run only if its not search
  const getLatestMessage = useCallback(async () => {
    if (chatId != "-1") {
      const { data, error } = await supabase
        .from("PrivateMessages")
        .select("Content, Sender, created_at")
        .eq("chatId", chatId)
        .order("created_at", { ascending: false })
        .limit(1);

      console.log(data, error, "data, error, latest messages");
      sortLatestMessage(data);
    }
  }, [Currentopenchatid]);

  useEffect(() => {
    if (chatId != "-1") {
      //-1 means the user is not in your contacts
      getLatestMessage();
    }
  }, []);

  useEffect(() => {
    if (!issearch && userId && Currentopenchatid) {
      const channel = supabase
        .channel(`Receive-Pvt-Chat-changes-${chatId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT", // or use "*" if you want all events
            schema: "public",
            table: "PrivateMessages",
            filter: `chatId=eq.${chatId}`,
          },
          (payload) => {
            console.log("Change received in contacts!", payload.new);
            if (chatId == payload.new.chatId) {
              sortLatestMessage([
                {
                  Content: payload.new.Content,
                  Sender: payload.new.Sender,
                  created_at: payload.new.created_at,
                },
              ]);
            }
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [Currentopenchatid, userId, issearch]);

  //to here

  return (
    <div
      onClick={() => {
        getChatId(userId, uuid, setOtheruserid, setCurrentopenchatid);
      }}
      className="text-MainText items-center  w-full mx-auto h-20 bg-Main border-Secondary/20 border-spacing-2 border-[1px]
border-solid mb-[-1px] flex gap-3 cursor-pointer hover:bg-white/20 transition-all "
    >
      <div className="w-16 h-16 ml-1">
        <img
          src={customPfp || pfp}
          alt="Profile Picture"
          className="w-20 rounded-full"
        />
      </div>
      <div className="flex flex-col h-[80%] justify-between w-full mx-1">
        <span className="text-xl font-bold whitespace-nowrap">
          {`${name}`}{" "}
          <span className="text-xs">{`#${userId.slice(0, 5)}`}</span>
        </span>
        {latestMessage && (
          <div className="flex justify-between">
            <span className="text-sm opacity-70">{`${
              latestMessage.length > 38
                ? latestMessage.slice(0, 38) + "..."
                : latestMessage
            }`}</span>
            <span className="text-sm text-MainText text-nowrap">
              At {latestMessagetime}
            </span>
          </div>
        )}
      </div>
      {inyourcontacts && (
        <div className="bg-green-600 flex items-center text-center justify-center rounded-xl w-fit h-fit p-1 text-sm">
          This guy is in your contacts
        </div>
      )}
    </div>
  );
};

export default Contacts;
