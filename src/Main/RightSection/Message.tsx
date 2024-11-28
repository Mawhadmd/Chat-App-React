import { useContext } from "react";
import { ChatContext } from "../App";

const Message = ({ data, i, uuid, namesmap }: any) => {
  const {Currentopenchatid} = useContext(ChatContext)
  function calculate24to12(time: string) {
    let isAm: boolean;
    Number(time.slice(11, 13)) > 12 ? (isAm = false) : (isAm = true);
    let timeconverted =
      Number(time.slice(11, 13)) > 12
        ? Number(time.slice(11, 13)) - 12
        : Number(time.slice(11, 13));

    return timeconverted + time.slice(13, 19) + (isAm ? " am" : " pm");
  }

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
          {calculate24to12(data.created_at)}
        </span>
      </div>
    </div>
  );
};

export default Message;
