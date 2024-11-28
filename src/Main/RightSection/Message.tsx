import { useContext } from "react";
import { ChatContext } from "../App";
import convertTime from "../util/convertTime";

const Message = ({ data, i, uuid, namesmap }: any) => {
  const {Currentopenchatid} = useContext(ChatContext)

  return (
    <div key={i}>
      <div
        className={`p-1 pl-2 text-2xl flex flex-col w-fit h-fit ${
          String(data.Sender) != String(uuid)
            ? "bg-MainBlue m-2 ml-auto rounded-t-lg rounded-bl-lg"
            : "bg-Mainpink m-2  rounded-e-lg rounded-t-lg  "
        }`}
      >
        {Currentopenchatid == "Global"? <span className="text-sm w-full">{namesmap.get(data.Sender)}</span>: null}
        <span className="p-2 w-full">{data.Content.toLocaleString()}</span>
        <span className="text-sm ml-auto w-full">
          {convertTime(data.created_at)}
        </span>
      </div>
    </div>
  );
};

export default Message;
