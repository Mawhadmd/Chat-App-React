// import pfp from "../../assets/grayuserpfp.png";
import globe from "../../assets/global-communication_9512332.png";
import { ChatContext, SettingContext } from "../App";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../Supabase";
import convertTime from "../util/convertTime";
const ChatArea = () => {
  const context = useContext(ChatContext);
  const [lastseen, setlastseen] = useState<string>("");
  const [name, setname] = useState<string>("");
  const [pfp, setpfp] = useState<string>("");
  const {
    Currentopenchatid,
    setOtheruserid,
    setCurrentopenchatid,
    Otheruserid,
  } = context;
  const { MobileMode } = useContext(SettingContext);

  async function getlastseen() {
    try {
      // Fetch user metadata
      let res = await supabase.auth.admin.getUserById(Otheruserid);
      setname(res.data.user?.user_metadata.name);
      setpfp(res.data.user?.user_metadata.avatar_url);
  
      // Fetch last seen timestamp
      let { data, error } = await supabase
        .from("Users")
        .select("LastSeen")
        .eq("id", Otheruserid);
  
      if (error) {
        throw Error;
      }
  
      if (data) {
        let lastSeenTimestamp = Number(data[0].LastSeen);
        let lastSeenDate = new Date(lastSeenTimestamp);
        let now = new Date();
        let diffSeconds = Math.floor((Number(now) - Number(lastSeenDate)) / 1000);
  
        // Determine the relative time
        if (diffSeconds < 60 ) {
          setlastseen("Online");
        } else if (diffSeconds < 3600) {
          setlastseen(`${Math.floor(diffSeconds / 60)} minute(s) ago`);
        } else if (now.toDateString() === lastSeenDate.toDateString()) {
          setlastseen("Today at "+convertTime(String(lastSeenDate)));
        } else if (diffSeconds < 7 * 24 * 3600) {
          setlastseen("This week");
        } else {
          setlastseen(lastSeenDate.toLocaleDateString()); // Fallback to full date
        }
      }
    } catch (e) {
      setlastseen("Unknown");
    }
  }
  

  useEffect(() => {
    
  const channels = supabase.channel('Get-LastSeen')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'Users', filter: `id=${Otheruserid}` },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
    getlastseen();
    return () => {
      channels.unsubscribe()
    }
  }, [Otheruserid]);

  function GoBack() {
    setCurrentopenchatid(undefined);
    setOtheruserid(undefined);
  }
  return (
    <div
      id="CurrentChat"
      className=" text-MainPinkishWhite shadow-[0px_5px_12px_rgba(0,0,0,0.589)] z-10 min-h-16 h-[10%] bg-MainBlack w-full  gap-2 content-center flex px-1 justify-between items-center "
    >
      {Currentopenchatid != "Global" ? (
        <>
          <div className="flex justify-center items-center gap-3">
            <img
              alt="PFP"
              src={pfp}
              className="cursor-pointer w-20 rounded-full"
            />
            <div>
              <span>{name}</span>
              <br />
              {<span>Last Seen: {lastseen}</span>}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-fit h-full gap-2 flex items-center text-MainPinkishWhite hover:bg-white/20 cursor-pointer">
            <img src={globe} className="h-10 invert" alt="Globe" />
            <span>Global Chat</span>
          </div>
        </>
      )}
      {MobileMode && (
        <div>
          <button
            onClick={GoBack}
            className="text-MainBlack p-4 bg-MainPinkishWhite font-bold rounded-full ml-auto"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
