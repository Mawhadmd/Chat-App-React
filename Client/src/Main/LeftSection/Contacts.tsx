import React, { useContext, useEffect, useState } from "react";
import pfp from "../../assets/grayuserpfp.png";
import { supabase } from "../Supabase";
import { ChatContext, Onlineusersctxt } from "../App";
import convertTime from "../util/convertTime";
import getChatId from "../util/getChatId";
import { motion } from "motion/react";
import { getuserbyid } from "../util/getuserbyid";

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
  i: number;
}
//make a new component called searchcontacts
const Contacts: React.FC<ContactsProps> = ({
  user,
  chatId,
  issearch = false,
  i = 0,
}) => {
  const [missedmessage, setmissedmessages] = useState<number | undefined>();
  const [latestMessage, setLatestMessage] = useState<string | undefined>();
  const [latestMessagetime, setLatestMessagetime] = useState<
    string | undefined
  >();
  const [inyourcontacts, setinyourcontacts] = useState<boolean>(false);
  const [ischosen, setischosen] = useState<boolean>(false);
  const { setCurrentopenchatid, Currentopenchatid, uuid, setOtheruserid } =
    useContext(ChatContext);
  const { onlineusers }: { onlineusers: any[] } = useContext(Onlineusersctxt);
  const userId = user.id;
  const name = user.user_metadata.name;
  const customPfp = user.user_metadata.avatar_url;

  const sortLatestMessage = (data: any[]) => {
    if (data && data[0]) {
      let time = convertTime(data[0].created_at);
      setLatestMessagetime(time);
      console.log(data[0]);
      const message =
        (data[0].Sender === uuid
          ? `You: ${data[0].Content}`
          : `${name}: ${data[0].Content}`) +
        (data[0].AudioFile ? "Audio" : "") +
        (data[0].FileURL ? "IMAGE" : "");
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
          .select("Content, Sender, created_at, FileURL, AudioFile")
          .eq("chatId", chatId)
          .order("created_at", { ascending: false })
          .limit(1));
        tries++;
        if (tries == 5) break;
      }
      if (data) {
        sortLatestMessage(data);
      }
    }
  };

  useEffect(() => {
    if (chatId != "-1") {
      //is  in your contacts
      getLatestMessage();
    }
  }, [chatId]);

  useEffect(() => {
    if (!issearch && userId && chatId) {
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
            console.log(payload.new);
            if (chatId == payload.new.chatId) {
              sortLatestMessage([payload.new]);
            }
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    } else {
      console.log(issearch, userId, Currentopenchatid);
    }
  }, [Currentopenchatid, userId, issearch, chatId]); //this useeffect listens to new messages

  //to here]

  useEffect(() => {
    if (issearch) return;
    const listentomissedmessages = supabase
      .channel("listentomissedmessages" + chatId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "PrivateMessages",
          filter: `chatId=eq.${chatId}`,
        },
        async (payload) => {
          if (payload.new.Sender != uuid) {
            let userdata = (await getuserbyid(payload.new.Sender)).data.user
              .user_metadata;
            new Notification(userdata.name, {
              body: payload.new.Content,
              icon: userdata.avatar_url,
            });
          }
          console.log("New message inserted:", payload.new);
          if (payload.new.Sender != uuid)
            setmissedmessages((prev) => (prev || 0) + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "PrivateMessages",
          filter: `chatId=eq.${chatId}`,
        },
        (payload) => {
          console.log("Message updated:", payload.new, payload.old);
          if (payload.new.Sender != uuid)
            if (payload.new.ReadAt && !payload.old.ReadAt) {
              setmissedmessages((prev) => (prev || 1) - 1);
            }
        }
      )
      .subscribe();
    const getmissedmessagescount = async () => {
      const { data, error } = await supabase
        .from("PrivateMessages")
        .select("ReadAt")
        .eq("chatId", chatId)
        .neq("Sender", uuid)
        .is("ReadAt", null);
      if (error) {
        alert("error while check missed messages" + JSON.stringify(error));
        setmissedmessages(undefined);
      }
      setmissedmessages(data?.length || undefined);
    };
    getmissedmessagescount();
    return () => {
      listentomissedmessages.unsubscribe();
    };
  }, []);
  useEffect(() => {
    setischosen(Currentopenchatid == chatId);
  }, [Currentopenchatid]);
  return (
    <motion.div
      animate={{ opacity: [0, 1] }}
      transition={{ delay: 0.1 * i, duration: 1 }}
      onClick={() => {
        getChatId(userId, uuid, setOtheruserid, setCurrentopenchatid);
      }}
      className={`${
        ischosen ? "bg-Secondary/50" : ""
      } text-MainText items-center  w-full mx-auto h-20 border-Secondary/20 border-spacing-2 border-[1px]
  border-solid mb-[-1px] flex gap-3 cursor-pointer hover:bg-MainText/20 transition-all `}
    >
      <div className=" relative justify-center aspect-square items-center flex w-1/6 ml-1">
        <img
          className="rounded-full w-full h-full"
          src={customPfp || pfp}
          alt="Profile Picture"
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
      <div className="flex flex-col h-[80%] justify-between w-5/6 mx-1">
        <div className="flex justify-between">
          <span className="text-xl font-bold whitespace-nowrap">
            {`${name}`}{" "}
            <span className="text-[8px]">{`#${userId.slice(0, 5)}`}</span>
          </span>

          {!!missedmessage && (
            <div className="flex text-xs justify-center items-center whitespace-nowrap h-5 w-5 p-2 bg-green-600 rounded-full mr-1">
              {missedmessage}
            </div>
          )}
        </div>
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
    </motion.div>
  );
};

export default Contacts;
