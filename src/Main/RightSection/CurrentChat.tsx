import pfp from "../../assets/grayuserpfp.png";
import globe from "../../assets/global-communication_9512332.png";
import { ChatContext } from "../App";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../Supabase";
const ChatArea = () => {

  const context = useContext(ChatContext);
  const [lastseen, setlastseen] = useState<string>('');
  const [name, setname] = useState<string>('');
  const [pfp, setpfp] = useState<string>('');
  const { Currentopenchatid,Otheruserid } = context;
  async function getlastseen() {

      let res = await supabase.auth.admin.getUserById(Otheruserid);
      setname(res.data.user?.user_metadata.name);
      setpfp(res.data.user?.user_metadata.avatar_url);
      
      setlastseen(res.data.user?.last_sign_in_at?.slice(0, 18).replace("T", " ") || '');
    
  }

  useEffect(() => {
    getlastseen();
  }, [Otheruserid]);
  return (
    <div
      id="CurrentChat"
      className="text-MainPinkishWhite shadow-[0px_5px_12px_rgba(0,0,0,0.589)] z-10 min-h-16 h-[10%] bg-MainBlack w-full  gap-2 content-center px-5 flex items-center justify-start"
    >
      <div className="w-fit pr-10 pl-5 h-full gap-2 flex items-center text-MainPinkishWhite hover:bg-white/20 cursor-pointer">
        {Currentopenchatid != "Global" ? (
          <>
            <img  alt="PFP" src={pfp} className="cursor-pointer w-20 rounded-full" />
            <div>
              <span>{name}</span>
              <br />
             { <span>Last Seen: {lastseen}</span>}
            </div>
          </>
        ) : (
          <>
            <img src={globe} className="h-10 invert" alt="Globe" />
            <span>Global Chat</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
