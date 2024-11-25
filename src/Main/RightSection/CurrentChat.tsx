import pfp from "../../assets/grayuserpfp.png"
import globe from "../../assets/global-communication_9512332.png";
import { ChatContext } from "../App";
import { useContext } from "react";
const ChatArea = () => {
  const context = useContext(ChatContext);
  const { Currentopenchatid } = context;
    return (
        <div
        id="CurrentChat"
        className="text-MainPinkishWhite shadow-[0px_5px_12px_rgba(0,0,0,0.589)] z-10 min-h-16 h-[10%] bg-MainBlack w-full  gap-2 content-center px-5 flex items-center justify-start"
      >
   
   <div
        
        className="w-fit pr-10 pl-5 h-full gap-2 flex items-center text-MainPinkishWhite hover:bg-white/20 cursor-pointer"
      >
          {Currentopenchatid != "Global"? (
          <>
              <img alt="PFP" src={pfp} className='cursor-pointer w-20' />
             <div>
             <span>El SESE</span>
             <br />
             <span>Last Seen: Today</span>
             </div>
           </>
          ):(
        <>
          <img src={globe} className="h-10 invert" alt="Globe" />
          <span>Global Chat</span>
          </>
        )}
        </div>
         
       
      </div>
    );
}

export default ChatArea;
