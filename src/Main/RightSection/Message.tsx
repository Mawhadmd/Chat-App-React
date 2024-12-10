import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../App";
import convertTime from "../util/convertTime";
import getChatId from "../util/getChatId";

interface UserMessage {
  name: string;
  id: string;
  color: string | null;
}

interface Message {
  data: any;
  i: number;
  uuid: string;
  UserMessageMap: Map<string, UserMessage>;
  setUserMessageMap: any;
}

const Message = ({
  data,
  i,
  uuid,
  UserMessageMap,
  setUserMessageMap,
}: Message) => {


  const [messagenamecolor, setmessagecolorname] = useState<
    string | undefined
  >();

  const { Currentopenchatid, setCurrentopenchatid, setOtheruserid } =
    useContext(ChatContext);


  function getRandomColor(bgcolor: string) {
    if (UserMessageMap.get(data.Sender)?.color != null  )
      return UserMessageMap.get(data.Sender)!.color;

    var color = null;
    let contrast = -1;
    var colorarray;
    let bgcolorarray = bgcolor.split(",").map((e) => Number(e));
    console.log(bgcolorarray, bgcolor, "bgcolorarray");
    while (contrast < 7) {
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
    UserMessageMap.set(data.Sender, {
      color: color,
      name: UserMessageMap.get(data.Sender)!.name,
      id: UserMessageMap.get(data.Sender)!.id,
    });

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
    console.log("between", color1, color2, l1, l2, lighter, darker);
    return Number(contrastRatio.toFixed(2));
  }

  async function setnewuserinmessage() {
    var { data: payload, error } = await fetch(
      "http://localhost:8080/getuserbyid",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.Sender }),
      }
    ).then((res) => res.json());
    let newmap = new Map();
    newmap.set(data.Sender, {
      name: payload.user?.user_metadata.name,
      id: payload.user?.id,
      color: null,
    });
    if (payload)
      setUserMessageMap((prev: Map<string, UserMessage>) => {
        const newMap = new Map(prev);
        newmap.forEach((value, key) => newMap.set(key, value));
        return newMap;
      });

    setmessagecolorname(
      getRandomColor(
        data.Sender == uuid
          ? getComputedStyle(document.documentElement).getPropertyValue(
              "--MainBlackfr"
            )
          : getComputedStyle(document.documentElement).getPropertyValue(
              "--MainPinkishWhite"
            )
      )!
    );
    if (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (
      Currentopenchatid == "Global" &&
      UserMessageMap.get(data.Sender) == null
    ) {
      setnewuserinmessage();
    } else { 
      setmessagecolorname(
        getRandomColor(
          data.Sender == uuid
            ? getComputedStyle(document.documentElement).getPropertyValue(
                "--MainBlackfr"
              )
            : getComputedStyle(document.documentElement).getPropertyValue(
                "--MainPinkishWhite"
              )
        )!
      );
    }
  }, []);


  return (
    <div key={i}>
      <div
        className={`p-1 pl-2 text-xl flex break-words flex-col w-fit h-fit max-w-[50vw]  ${
          String(data.Sender) != String(uuid)
            ? "bg-MainSky m-2 ml-auto text-MainBlack  rounded-t-lg rounded-bl-lg"
            : "bg-MainBlackfr m-2 text-MainPinkishWhite  rounded-e-lg rounded-t-lg  "
        }`}
      >
        {Currentopenchatid == "Global" ? (
          <span
            onClick={() =>
              getChatId(data.Sender, uuid, setOtheruserid, setCurrentopenchatid)
            }
            className={`cursor-pointer hover:!text-MainBlue  text-sm w-full font-bold  `}
            style={{ color: messagenamecolor }}
          >
            {UserMessageMap.get(data.Sender)!.name}
          </span>
        ) : null}
        <span className="p-2  w-full">{data.Content.toLocaleString()}</span>
        <span className="text-sm   ml-auto w-full">
          {convertTime(data.created_at)}
        </span>
      </div>
    </div>
  );
};

export default Message;
