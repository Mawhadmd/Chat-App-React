import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useId,
} from "react";
import pfp from "../../assets/grayuserpfp.png";
import { supabase } from "../Supabase";
import { ChatContext } from "../App";
import convertTime from "../util/convertTime";

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
}

const Contacts: React.FC<ContactsProps> = ({ user, issearch = false }) => {
  const [latestMessage, setLatestMessage] = useState<string | undefined>();
  const [latestMessagetime, setLatestMessagetime] = useState<string | undefined>();
  const { setCurrentopenchatid, Currentopenchatid, uuid, setOtheruserid } =
    useContext(ChatContext);
  const {
    id: userId,
    user_metadata: { name, avatar_url: customPfp },
  } = user;

  const sortLatestMessage = useCallback(
    (data: any) => {
      var time = convertTime(data[0].created_at)
      setLatestMessagetime(time)
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

  const getLatestMessage = useCallback(async () => {
    const { data: chatid, error: err } = await supabase
      .from("Contacts")
      .select("chatId")
      .or(
        `and(User1.eq.${uuid},User2.eq.${userId}),and(User2.eq.${uuid},User1.eq.${userId})`
      )
      .order("created_at", { ascending: false });

    console.log(chatid, "For my guy", userId);

    if (err) {
      console.log(err, "While getting user chatid");
    }
    if (chatid) {
      const { data, error } = await supabase
        .from("PrivateMessages")
        .select("Content, Sender, created_at")
        .eq("chatId", chatid[0].chatId)
        .order("created_at", { ascending: false })
        .limit(1);

      console.log(data, error, "data, error, latest messages");
      sortLatestMessage(data);
    }
  }, [Currentopenchatid]);

  useEffect(() => {
    if (!issearch) {
      getLatestMessage();
    }
  }, []);

  useEffect(() => {
    if (!issearch) {
      const channel = supabase
        .channel(`Receive-Pvt-Chat-changes-at-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "PrivateMessages",
            filter: `chatId=eq.${Currentopenchatid}`,
          },
          (payload: any) => {
            console.log("Change received in contacts!");
            sortLatestMessage([
              { Content: payload.new.Content, Sender: payload.new.Sender },
            ]);
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [Currentopenchatid, issearch, userId]);

  const getChatId = async () => {
    try {
      const { data, error } = await supabase
        .from("Contacts")
        .select("chatId")
        .or(`User1.eq.${userId},User2.eq.${userId}`)
        .limit(1);

      if (error) throw error;
      setOtheruserid(userId);
      if (data && data[0] && data.length != 0)
        setCurrentopenchatid(data[0].chatId);
      else setCurrentopenchatid(-1);
    } catch (error) {
      console.error("Error getting chat ID:", error);
      alert(
        "Couldn't get the chat. Please try again later or contact support."
      );
    }
  };

  return (
    <div
      onClick={getChatId}
      className="text-MainPinkishWhite items-center border-collapse w-full mx-auto h-20 bg-MainBlack border-MainBlue/15 border-spacing-2 border-[1px] mb-[-1px] flex gap-3 border-solid cursor-pointer hover:bg-white/20 transition-all "
    >
      <div className="w-16 h-16 ml-1">
        <img
          src={customPfp || pfp}
          alt="Profile Picture"
          className="w-20 rounded-full"
        />
      </div>
      <div className="flex flex-col h-[80%] justify-between w-full mx-1">
        <span className="text-xl ">{`${name} #${userId.slice(0, 5)}`}</span>
        {latestMessage && (
          <div className="flex justify-between">
            <span className="text-sm opacity-70">{latestMessage}</span>
            <span className="text-sm text-MainPinkishWhite">At {latestMessagetime}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
