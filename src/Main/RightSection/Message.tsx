import { useContext, useEffect } from "react";
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
}: Message) => {
  const { Currentopenchatid, setCurrentopenchatid, setOtheruserid } =
    useContext(ChatContext);


  useEffect(() => {
    data.Content = 'fuck'
  }, []);

  return (
    <div key={i}>
      {!!UserMessageMap.get(data.Sender) && 
      <div
       
      className={`p-1 pl-2 text-xl text-MainText flex break-words flex-col w-fit h-fit max-w-[50vw]  ${
        String(data.Sender) != String(uuid)
          ? " bg-actionColor border-MainText  border-solid border-b-[1px] text-black m-2 ml-auto  rounded-t-lg rounded-bl-lg"
          : "bg-Secondary border-actionColor  border-solid border-b-[1px] text-white m-2  rounded-e-lg rounded-t-lg  "
      }`}
    >
      {Currentopenchatid == "Global" ? (
        <span
          onClick={() =>
            getChatId(data.Sender, uuid, setOtheruserid, setCurrentopenchatid)
          }
          className={`cursor-pointer  text-sm w-full font-bold  ${
        String(data.Sender) != String(uuid)
          ? " hover:!text-black"
          : "hover:!text-MainText "
      }`}
          style={{ color: UserMessageMap.get(data.Sender)?.color! }}
        >
          {UserMessageMap.get(data.Sender)!.name}
        </span>
      ) : null}
      <span className="p-2  w-full">{data.Content}</span>
      <span className="text-sm   ml-auto w-full">
        {convertTime(data.created_at)}
      </span>
    </div>
      }
    </div>
  );
};

export default Message;
