import { useContext, useRef, useState } from "react";
import convertTime from "../util/convertTime";
import getChatId from "../util/getChatId";
import { ChatContext, SettingContext } from "../App";
import { UserMessage } from "./GlobalChatArea";
import clock from "../../assets/clock_18625172.png";
import CorretMark from "../../assets/tick_8564026.png";
import Ximage from "../../assets/letter-x_16083478.png";
import { useWavesurfer } from "@wavesurfer/react";
import playImage from "../../assets/play_6942846.png";
import dbcheck from "../../assets/double-check_8144363.png";
import pauseImage from "../../assets/pause_717217.png";
import { getuserbyid } from "../util/getuserbyid";
export interface Message {
  data: any;
  uuid: string;
  UserMessageMap: Map<string, UserMessage> | null; //null for private messages
}
const Message = ({ data, uuid, UserMessageMap }: Message) => {
  const { setCurrentopenchatid, setOtheruserid } = useContext(ChatContext);
  const [avatar_url, setavatar_url] = useState<string | undefined>();

  if (data.AudioFile) {
    getuserbyid(data.Sender).then((e) =>
      setavatar_url(e.data.user.user_metadata.avatar_url)
    );
  }
  const containerRef = useRef(null);

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    url: data.AudioFile,
    normalize: false,
    waveColor: "#ffffff",
    progressColor: "#5cfcff",
    cursorColor: "#66ffe0",
    cursorWidth: 1,
    barWidth: 6,
    height: 50,
    barGap: 1,
    barRadius: 30,
    barHeight: 1,
    // minPxPerSec: 47,
    fillParent: true,
    mediaControls: false,
    autoplay: false,
    interact: true,
    dragToSeek: true,
    hideScrollbar: true,
    audioRate: 1,
    autoScroll: true,
    autoCenter: true,
    sampleRate: 8000,
  });

  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause();
  };

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
                  src={data.Error ? Ximage : data.Pending ? clock : CorretMark}
                  alt={`${
                    data.Error ? "Error" : data.Pending ? "Sending" : "Sent"
                  }`}
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
            className={` relative p-1 pl-2 text-xl text-MainText flex break-words flex-col w-fit h-fit max-w-[50vw] ${
              data.AudioFile && "min-w-fit "
            } ${
              String(data.Sender) != String(uuid)
                ? " bg-actionColor border-MainText  border-solid border-b-[1px] text-black m-2 ml-auto  rounded-t-lg rounded-bl-lg"
                : "bg-Secondary border-actionColor  border-solid border-b-[1px] text-white m-2  rounded-e-lg rounded-t-lg  "
            }`}
          >
            {data.AudioFile ? (
              <div
                className={`flex ${
                  String(data.Sender) != String(uuid) && "flex-row-reverse"
                } w-80 h-[50px] items-center gap-1`}
              >
                {" "}
                <img
                  src={avatar_url}
                  alt="pfp"
                  className="rounded-full h-full"
                />
                <div
                  className="w-full  rounded-xl overflow-hidden"
                  ref={containerRef}
                ></div>
                <div className="flex flex-col items-center gap-1">
                  <button onClick={onPlayPause}>
                    <img
                      src={isPlaying ? pauseImage : playImage}
                      alt={isPlaying ? "Pause" : "Play"}
                      className="invert w-8 h-8"
                    />
                  </button>
                  <small className="text-xs">
                    {currentTime.toFixed(2) + "/" + wavesurfer?.getDuration()}s
                  </small>
                </div>
              </div>
            ) : (
              <span className="p-2  w-full">
                {!!data.FileURL ? (
                  <>
                    <img
                      className="max-h-80 "
                      src={`${data.FileURL}`}
                      alt={"img"}
                    />
                    {data.Content}
                  </>
                ) : (
                  data.Content
                )}
              </span>
            )}
            <div
              className={`flex flex-col items-start font-bold  gap-1 text-MainText absolute ${
                String(data.Sender) != String(uuid) ? "-left-16" : "-right-16"
              } bottom-0`}
            >
              {String(data.Sender) == String(uuid) && data && (
                <img
                  src={
                    !data.ReadAt
                      ? data.Error
                        ? Ximage
                        : data.Pending
                        ? clock
                        : CorretMark
                      : dbcheck
                  }
                  className={`content-end  w-4 h-4  right-0`}
                />
              )}
              <span className="text-sm   ml-auto w-full ">
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
