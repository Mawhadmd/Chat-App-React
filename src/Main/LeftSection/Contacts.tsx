import React, { useContext, useEffect, useState } from "react";
import pfp from "../../assets/grayuserpfp.png";
import { supabase } from "../Supabase";
import { ChatContext, Onlineusersctxt } from "../App";
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
  const { onlineusers }: { onlineusers: any[] } = useContext(Onlineusersctxt);
  const userId = user.id;
  const name = user.user_metadata.name;
  const customPfp = user.user_metadata.avatar_url;

  const sortLatestMessage = (data: any) => {
    if (data && data[0]) {
      let time = convertTime(data[0].created_at);
      setLatestMessagetime(time);
      const message =
        data[0].Sender === uuid
          ? `You: ${data[0].Content}`
          : `${name}: ${data[0].Content}`;
      setLatestMessage(message);
    }
  };

  useEffect(() => {
    if (issearch && chatId != "-1") {
      setinyourcontacts(true);
    }
  }, []);

  //all this functions run only if its not search
  const getLatestMessage = async () => {
    if (chatId != "-1") {
      //
      var data;
      var tries = 0;
      while (!data) {
        ({ data } = await supabase
          .from("PrivateMessages")
          .select("Content, Sender, created_at")
          .eq("chatId", chatId)
          .order("created_at", { ascending: false })
          .limit(1));
        tries++;
        if (tries == 5) break;
      }
      sortLatestMessage(data);
    }
  };

  useEffect(() => {
    if (chatId != "-1") {
      //-1 means the user is not in your contacts
      getLatestMessage();
    }
  }, [chatId]);

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

  //to here]

  return (
    <div
      onClick={() => {
        getChatId(userId, uuid, setOtheruserid, setCurrentopenchatid);
      }}
      className="text-MainText items-center  w-full mx-auto h-20 border-Secondary/20 border-spacing-2 border-[1px]
border-solid mb-[-1px] flex gap-3 cursor-pointer hover:bg-white/20 transition-all "
    >
      <div className="relative justify-center items-center flex w-16 h-16 ml-1">
        <img
          src={customPfp || pfp}
          alt="Profile Picture"
          className="w-20 rounded-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement; // Cast to HTMLImageElement
            target.onerror = null; // Prevent infinite loop
            target.src = pfp; // Fallback to 'pfp'
          }}
        />

        {onlineusers &&
          onlineusers.some((u: any) => u.user === userId) &&
          (onlineusers[onlineusers.findIndex((obj) => obj.user == userId)]
            .status == "Online" ? (
            <span className="absolute w-4 h-4 right-0 top-[60%] rounded-full bg-green-500"></span>
          ) : (
            <span className="absolute w-4 h-4 right-0 top-[60%] rounded-full bg-yellow-500"></span>
          ))}
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
        <div className="bg-green-600 flex items-center text-center justify-center rounded-xl h-full p-1 text-sm w-28">
          This guy is in your contacts
        </div>
      )}
    </div>
  );
};

export default Contacts;
