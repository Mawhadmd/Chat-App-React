import { useContext } from "react";
import { ChatContext } from "../App";
import convertTime from "../util/convertTime";
import getChatId from "../util/getChatId";

const Message = ({ data, i, uuid, namesmap }: any) => {
  const { Currentopenchatid, setCurrentopenchatid,
    setOtheruserid } = useContext(ChatContext);
    function getRandomColor() { //maybe get current unique people in the chat and add them to a map after a set?
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
  return (
    <div key={i}>
      <div
        className={`p-1 pl-2 text-xl flex break-words flex-col w-fit h-fit max-w-[50vw]  ${
          String(data.Sender) != String(uuid)
            ? "bg-MainBlue m-2 ml-auto rounded-t-lg rounded-bl-lg"
            : "bg-Mainpink m-2  rounded-e-lg rounded-t-lg  "
        }`}
      >
        {Currentopenchatid == "Global" ? (
          <span onClick={()=>getChatId(data.Sender,uuid, setOtheruserid, setCurrentopenchatid)} className={`cursor-pointer hover:text-MainPinkishWhite  text-sm w-full font-bold  `} style={{color: getRandomColor()}}>{namesmap.get(data.Sender)}</span>
        ) : null}
        <span className="p-2 w-full">{data.Content.toLocaleString()}</span>
        <span className="text-sm ml-auto w-full">
          {convertTime(data.created_at)}
        </span>
      </div>
    </div>
  );
};

export default Message;
