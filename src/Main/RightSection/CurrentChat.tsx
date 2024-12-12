// import pfp from "../../assets/grayuserpfp.png";
import globe from "../../assets/global-communication_9512332.png";
import { ChatContext, SettingContext } from "../App";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../Supabase";
import convertTime from "../util/convertTime";
import { Usermapscontext } from "./RightSection";
interface UserMessage {
  name: string;
  id: string;
  color: string | null;
}
const ChatArea = () => {
  const context = useContext(ChatContext);
  const [lastseen, setlastseen] = useState<string>("");
  const [lastseenglobal, setlastseenglobal] = useState<string>("");
  const { UserMessageMap }: { UserMessageMap: Map<string, UserMessage> } =
    useContext(Usermapscontext);
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
    if (Currentopenchatid == "Global") {
      getlastseen(null)
      //supabase realtime channel doesn't support multiple channels therefore i can't 
      // do a realtime change of active in global chat since this will consume much resources
      // interval works fine
      let interval = setInterval(() => {
        getlastseen(null)
      }, 60000);
      return () => {clearInterval(interval); };
    }
  }, [UserMessageMap]);

  useEffect(() => {
    //set name and pfp of a user if not global
    if (Currentopenchatid != "Global") {
      (async () => {
        let res = await fetch("http://localhost:8080/getuserbyid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: Otheruserid }),
        }).then((res) => res.json());
        setname(res.data.user?.user_metadata.name);
        setpfp(res.data.user?.user_metadata.avatar_url);
      })();
    }
  }, [Otheruserid]);

  async function getlastseen(thenewpayload: any | null) {
    //Gets last seen for non global
    if (Currentopenchatid != "Global") {
      try {
        var lastseen, error;
        if (thenewpayload == null) {
          console.log("initial");
          let { data, error: e } = await supabase
            .from("Users")
            .select("LastSeen")
            .eq("id", Otheruserid);
          if (data) {
            lastseen = data[0].LastSeen;
          } else error = e;
        } else {
          lastseen = thenewpayload.LastSeen;
        }
        if (error) {
          throw Error;
        }

        let lastSeenTimestamp = Number(lastseen);
        let lastSeenDate = new Date(lastSeenTimestamp);
        let now = new Date();
        let diffSeconds = Math.floor(
          (Number(now) - Number(lastSeenDate)) / 1000
        );

        if (diffSeconds < 190) {
          //this is time between every update of lastseen in database
          setlastseen("Online");
        } else if (diffSeconds < 600) {
          setlastseen("A few moments ago");
        } else if (diffSeconds < 3600) {
          setlastseen(`${Math.floor(diffSeconds / 60)} minute(s) ago`);
        } else if (now.toDateString() === lastSeenDate.toDateString()) {
          setlastseen("Today at " + convertTime(String(lastSeenDate)));
        } else {
          setlastseen(
            lastSeenDate.toLocaleDateString() +
              " " +
              convertTime(String(lastSeenDate))
          ); // Fallback to full date
        }
      } catch (e) {
        setlastseen("Unknown");
      }
    }else{
     try {

      let users = Array.from(UserMessageMap.keys())
      console.log(users,'usershere')
      let { data, error } = await supabase
      .from("Users")
      .select("LastSeen")
      .in('id', users)
      .gte('LastSeen', Date.now() - 180 * 1000)
      if(data)
        {console.log(data,'data of lastseen here')
        setlastseenglobal(String(data.length))}
      else
        throw(JSON.stringify(error))
     } catch (error) {
      console.log('Error getting online users' + JSON.stringify(error))
        setlastseenglobal('Unknown')
     }
    }
  }

  useEffect(() => {
    //call getlastseen on intervals or time
    if (Currentopenchatid != "Global") {
      const channels = supabase
        .channel("Get-LastSeen")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "Users",
            filter: `id=eq.${Otheruserid}`,
          },
          (payload) => {
            console.log("Change received!", payload);
            getlastseen(payload.new);
          }
        )
        .subscribe();
      getlastseen(null);
      let interval = setInterval(() => {
        getlastseen(null);
      }, 60000);
      return () => {
        channels.unsubscribe();
        clearInterval(interval)
      };
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
            <div>
              <span>Global Chat</span>
              <br />
              {Number(lastseenglobal) <= 1? <span>You're lonely here</span>: <span>{lastseenglobal} Online</span>}
            </div>
          </div>
        </>
      )}
      {MobileMode && (
        <div>
          <button
            onClick={GoBack}
            className="text-MainText p-4 bg-LightModeMain font-bold rounded-full ml-auto"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
