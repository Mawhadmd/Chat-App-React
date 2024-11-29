// import pfp from "../../assets/grayuserpfp.png";
import globe from "../../assets/global-communication_9512332.png";
import { ChatContext, SettingContext } from "../App";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../Supabase";
const ChatArea = () => {

  const context = useContext(ChatContext);
  const [lastseen, setlastseen] = useState<string>('');
  const [name, setname] = useState<string>('');
  const [pfp, setpfp] = useState<string>('');
  const { Currentopenchatid ,setOtheruserid,setCurrentopenchatid,Otheruserid } = context;
  const {MobileMode } =  useContext(SettingContext);

  async function getlastseen() {

      let res = await supabase.auth.admin.getUserById(Otheruserid);
      setname(res.data.user?.user_metadata.name);
      setpfp(res.data.user?.user_metadata.avatar_url);
      
      setlastseen(res.data.user?.last_sign_in_at?.slice(0, 18).replace("T", " ") || '');
    
  }

  useEffect(() => {
    getlastseen();
  }, [Otheruserid]);

  function GoBack(){
    setCurrentopenchatid(undefined)
    setOtheruserid(undefined)
  }
  return (
    <div
      id="CurrentChat"
      className=" text-MainPinkishWhite shadow-[0px_5px_12px_rgba(0,0,0,0.589)] z-10 min-h-16 h-[10%] bg-MainBlack w-full  gap-2 content-center flex px-1 justify-between items-center "
    >
        {Currentopenchatid != "Global" ? (
          <>
            <div className="flex justify-center items-center gap-3">
            <img  alt="PFP" src={pfp} className="cursor-pointer w-20 rounded-full" />
            <div>
              <span>{name}</span>
              <br />
             { <span>Last Seen: {lastseen}</span>}
            </div>
            </div>
            {MobileMode && 
            <div>
            <button onClick={GoBack} className="text-MainBlack p-4 bg-MainPinkishWhite font-bold rounded-full ml-auto">
              Back
            </button>
          </div>}
          </>
        ) : (
          <>
          <div className="w-fit h-full gap-2 flex items-center text-MainPinkishWhite hover:bg-white/20 cursor-pointer">
            <img src={globe} className="h-10 invert" alt="Globe" />
            <span>Global Chat</span>
            </div>
          </>
        )}
    </div>
  );
};

export default ChatArea;
