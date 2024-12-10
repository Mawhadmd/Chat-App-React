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
  getRandomColor:any;
}

const Message = ({
  data,
  i,
  uuid,
  UserMessageMap,
  setUserMessageMap,
  getRandomColor
}: Message) => {
  const { Currentopenchatid, setCurrentopenchatid, setOtheruserid } =
    useContext(ChatContext);

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
      color: getRandomColor(
        data.Sender == uuid
          ? getComputedStyle(document.documentElement).getPropertyValue(
             "--MainBlue"
            )
          : getComputedStyle(document.documentElement).getPropertyValue(
               "--MainBlackfr"
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
      console.log(error);
    }
  }

  useEffect(() => {
    if (
      Currentopenchatid == "Global" &&
      UserMessageMap.get(data.Sender) == null
    ) {
      setnewuserinmessage();
    }
  }, []);

  return (
    <div key={i}>
      <div
        style={{ color: UserMessageMap.get(data.Sender)?.color! }}
        className={`p-1 pl-2 text-xl flex break-words flex-col w-fit h-fit max-w-[50vw]  ${
          String(data.Sender) != String(uuid)
            ? " bg-MainBlackfr m-2 ml-auto  rounded-t-lg rounded-bl-lg"
            : "bg-MainBlue  m-2  rounded-e-lg rounded-t-lg  "
        }`}
      >
        {Currentopenchatid == "Global" ? (
          <span
            onClick={() =>
              getChatId(data.Sender, uuid, setOtheruserid, setCurrentopenchatid)
            }
            className={`cursor-pointer hover:!text-MainBlue  text-sm w-full font-bold  `}
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
