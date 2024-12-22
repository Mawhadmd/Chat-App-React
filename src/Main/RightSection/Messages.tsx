import { useContext } from "react";
import convertTime from "../util/convertTime";
import getChatId from "../util/getChatId";
import { ChatContext } from "../App";
import { UserMessage } from "./GlobalChatArea";
import clock from "../../assets/clock_18625172.png";
import CorretMark from "../../assets/tick_8564026.png";
import Ximage from "../../assets/letter-x_16083478.png";
export interface Message {
  data: any;
  uuid: string;
  UserMessageMap: Map<string, UserMessage> | null; //null for private messages
}
const Message = ({ data, uuid, UserMessageMap }: Message) => {
  const { setCurrentopenchatid, setOtheruserid } = useContext(ChatContext);

  return (
    <>
      <div>
        {/* Global */}
        {UserMessageMap && !!UserMessageMap.get(data.Sender) && (
          <div
            className={`p-1 pl-2 text-xl text-MainText flex break-words flex-col w-fit h-fit max-w-[50vw] ${
              String(data.Sender) != String(uuid)
                ? " bg-actionColor border-MainText  border-solid border-b-[1px] text-black m-2 ml-auto  rounded-t-lg rounded-bl-lg"
                : "bg-Secondary border-actionColor  border-solid border-b-[1px] text-white m-2  rounded-e-lg rounded-t-lg  "
            }`}
          >
            <span
              onClick={() =>
                getChatId(
                  data.Sender,
                  uuid,
                  setOtheruserid,
                  setCurrentopenchatid
                )
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
            <span className="p-2  w-full">{data.Content}</span>
            <div className="flex items-center gap-1">
              {String(data.Sender) == String(uuid) && data && (
                <img
                src={data.Error? Ximage:data.Pending ? clock : CorretMark}
                alt={`${data.Error? 'Error':data.Pending ? "Sending" : "Sent"}`}
                  className="content-end w-4 h-4 invert right-0"
                />
              )}
              <span className="text-sm   ml-auto w-full">
                {convertTime(data.created_at)}
              </span>
            </div>

          </div>
        )}
        {!UserMessageMap && ( //Private
          <div
            className={`p-1 pl-2 text-xl text-MainText flex break-words flex-col w-fit h-fit max-w-[50vw] ${
              String(data.Sender) != String(uuid)
                ? " bg-actionColor border-MainText  border-solid border-b-[1px] text-black m-2 ml-auto  rounded-t-lg rounded-bl-lg"
                : "bg-Secondary border-actionColor  border-solid border-b-[1px] text-white m-2  rounded-e-lg rounded-t-lg  "
            }`}
          >
            <span className="p-2  w-full">{!!data.FileURL?<><img className="max-h-80 " src={`${data.FileURL}`} alt={'img'}/>{data.Content}</>: data.Content}</span>
            <div className="flex items-center gap-1">
              {String(data.Sender) == String(uuid) && data && (
                <img
                  src={data.Error? Ximage : data.Pending ? clock : CorretMark}
                  className={` content-end w-4 h-4 ${data.Error? "invert-0":"invert"} right-0`}
                />
              )}
              <span className="text-sm   ml-auto w-full">
                {convertTime(data.created_at)}
              </span>
            </div>

          </div>
        )}
      </div>
    </>
  );
};

export default Message;
