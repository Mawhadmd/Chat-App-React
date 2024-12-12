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
  useEffect(() => {
    (async () => {
      let res = await fetch('http://localhost:8080/getuserbyid', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id: Otheruserid})
      }).then(res => res.json())
        setname(res.data.user?.user_metadata.name);
        setpfp(res.data.user?.user_metadata.avatar_url);
  })()
  }, [Otheruserid]);
  async function getlastseen() {
   if(Currentopenchatid != "Global"){
    try {


  

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
  
       
        if (diffSeconds < 13 ) {
          setlastseen("Online");
        }else if (diffSeconds < 60 ) {
          setlastseen("A few moments ago");
        } else if (diffSeconds < 3600) {
          setlastseen(`${Math.floor(diffSeconds / 60)} minute(s) ago`);
        } else if (now.toDateString() === lastSeenDate.toDateString()) {
          setlastseen("Today at "+ convertTime(String(lastSeenDate)));
        } else {
          setlastseen(lastSeenDate.toLocaleDateString() + " " + convertTime(String(lastSeenDate))); // Fallback to full date
        }
      }
    } catch (e) {
      setlastseen("Unknown");
    }
   }
  }
  

  useEffect(() => {
  const channels = supabase.channel('Get-LastSeen')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'Users', filter: `id=eq.${Otheruserid}` },
    (payload) => {
      console.log('Change received!', payload)
      getlastseen();
    }
  )
  .subscribe()
   getlastseen();
   let interval = setInterval(() => {
    getlastseen();
   }, 2000);
    return () => {
      channels.unsubscribe()
      clearInterval(interval)
    }
  }, [Otheruserid]);

  function GoBack() {
    setCurrentopenchatid(undefined);
    setOtheruserid(undefined);
  }
  return (
    <div
      id="CurrentChat"
      className=" text-LightModeMain shadow-[0px_5px_12px_rgba(0,0,0,0.589)] z-10 min-h-16 h-[10%] bg-Main w-full  gap-2 content-center flex px-1 justify-between items-center "
    >
      {Currentopenchatid != "Global" ? (
        <>
          <div className="flex justify-center items-center gap-3">
            <img
              alt="PFP"
              src={pfp}
              className="h-14 w-14 cursor-pointer rounded-full"
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
          <div className="w-fit h-full gap-2 flex items-center text-LightModeMain hover:bg-white/20 cursor-pointer">
            <img src={globe} className="h-10 invert" alt="Globe" />
            <span>Global Chat</span>
          </div>
        </>
      )}
      {MobileMode && (
        <div>
          <button
            onClick={GoBack}
            className="text-Main p-4 bg-LightModeMain font-bold rounded-full ml-auto"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
