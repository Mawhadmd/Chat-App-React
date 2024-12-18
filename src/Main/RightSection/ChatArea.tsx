import { useContext, useEffect, useRef } from "react";
import { supabase } from "../Supabase";
import { ChatContext, SettingContext } from "../App";
import audio from "../../assets/WhatsappMessage.mp3";
import Message from "./Message";
import BGimage from "../../assets/blackbackground.png";
import { Usermapscontext } from "./RightSection";
import { getuserbyid } from "../util/getuserbyid";
interface UserMessage {
  name: string;
  id: string;
  color: string | null;
}
const ChatArea = ({
  messages,
  setmessages,
}: {
  messages: any;
  setmessages: any;
}) => {
  const context = useContext(ChatContext);
  const { Currentopenchatid, uuid, setcontent } = context;
  const { UserMessageMap, setUserMessageMap } = useContext(Usermapscontext);
  const ChatArea = useRef<HTMLDivElement>(null);
  const { lightmode } = useContext(SettingContext);

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

  useEffect(() => {
    if (Currentopenchatid == "Global") {
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
            setcontent(payload.new);
            (() => new Audio(audio).play())();
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
  async function getmessages() {
    var data, error, query;
    let isglobal = Currentopenchatid == "Global";
    if (isglobal) {
      query = await supabase
        .from("Messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
    } else {
      query = await supabase
        .from("PrivateMessages")
        .select("*")
        .eq("chatId", Currentopenchatid)
        .limit(30)
        .order("created_at", { ascending: false });
    }
    data = query.data;
    error = query.error;
    return { data, error };
  }

  async function getData() {
    if (Currentopenchatid != undefined) {
      const { data, error } = await getmessages();
      console.log(data, error);
      Setdatatomap(data, error);
    }
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
  function getRandomColor(bgcolor: string) {
    var color = null;
    let contrast = -1;
    var colorarray;
    let bgcolorarray = bgcolor.split(",").map((e) => Number(e));
    while (contrast <= 6) {
      let letters = "0123456789ABCDEF";
      color = "#";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }

      let colorshex = color.slice(1).split("");
      colorarray = [
        Number(`0x${colorshex[0]}${colorshex[1]}`),
        Number(`0x${colorshex[2]}${colorshex[3]}`),
        Number(`0x${colorshex[4]}${colorshex[5]}`),
      ];

      contrast = calculateContrastRatio(bgcolorarray, colorarray);
    }

    return color;
  }
  function calculateContrastRatio(
    color1: Array<Number>,
    color2: Array<Number>
  ) {
    // Calculate relative luminance
    function getLuminance(color: Array<Number>) {
      let [r, g, b] = color.map((c: any) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    // Calculate luminance for both colors
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);

    // Determine lighter and darker luminance
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    // Calculate contrast ratio
    const contrastRatio = (lighter + 0.05) / (darker + 0.05);
    return Number(contrastRatio.toFixed(2));
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
          messages?.map((data: any, i: any) => (
            <Message
              key={data.id} //maybe get the database key
              uuid={uuid}
              i={i}
              data={data}
              UserMessageMap={UserMessageMap}
              setUserMessageMap={setUserMessageMap}
              getRandomColor={getRandomColor}
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
