// import pfp from "../../assets/grayuserpfp.png";
import globe from "../../assets/global-communication_9512332.png";
import { ChatContext, Onlineusersctxt, SettingContext } from "../App";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../Supabase";
import convertTime from "../util/convertTime";
import defaultpfp from "../../assets/grayuserpfp.png";
import { getuserbyid } from "../util/getuserbyid";
const ChatHeader = () => {
  const context = useContext(ChatContext);
  const [lastseen, setlastseen] = useState<string>("");
  const [lastseenglobal, setlastseenglobal] = useState<string>("");
  const [loading, setloading] = useState<boolean>();
  const [name, setname] = useState<string>("");
  const [pfp, setpfp] = useState<string>("");
  const [istyping, setistyping] = useState<boolean>();
  const [whoistyping, setwhoistyping] = useState<string[] | null>(null);
  const { lightmode } = useContext(SettingContext);
  const {
    Currentopenchatid,
    setOtheruserid,
    setCurrentopenchatid,
    Otheruserid,
    uuid,
  } = context;
  const { MobileMode } = useContext(SettingContext);
  const { onlineusers }: { onlineusers: any[] } = useContext(Onlineusersctxt);
  useEffect(() => {
    if (Currentopenchatid == "Global") {
      const usersinglobalroom = supabase.channel("onlineinglobal");
      usersinglobalroom
        .on("presence", { event: "sync" }, () => {
          const presenceState = usersinglobalroom.presenceState();
          const userSet = new Set();
          Object.values(presenceState).forEach((value: any) => {
            userSet.add(value[0].user);
          });
          const userCount = userSet.size;

          setlastseenglobal(String(userCount));
        })
        .subscribe()
        .track({ user: uuid });
      return () => {
        supabase.removeChannel(usersinglobalroom);
      };
    }
  }, []); //gets the numbers of users online by tracking them on a websocket
  useEffect(() => {
    const channelB = supabase.channel("istyping");
    let NumberOfPeopleTypingInGlobal: any[] = [];
    channelB
      .on("broadcast", { event: `typing${Currentopenchatid}` }, (payload) => {
        let payloadUser = payload.payload.user;
        let payloadIstyping = payload.payload.istyping;
        let payloadId = payload.payload.id;
        if (payloadId != uuid) {
          if (Currentopenchatid == "Global") {
            const index = NumberOfPeopleTypingInGlobal.indexOf(payloadUser);

            if (payloadIstyping) {
              if (index === -1) {
                //if doesn't exist in the typing array
                NumberOfPeopleTypingInGlobal.push(payloadUser);
              }
            } else {
              if (index > -1) {
                //removing the guy, he exists
                NumberOfPeopleTypingInGlobal.splice(index, 1);
              }
            }
            setistyping(NumberOfPeopleTypingInGlobal.length > 0);
            setwhoistyping([...NumberOfPeopleTypingInGlobal]);
          } else {
            setistyping(payloadIstyping);
          }
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channelB);
    };
  }, [Currentopenchatid]); //checks if the user is typing or not
  useEffect(() => {
    //set name and pfp of a user if not global
    if (Currentopenchatid != "Global") {
      (async () => {
        let res = await getuserbyid(Otheruserid);
        setname(res.data.user?.user_metadata.name);
        setpfp(res.data.user?.user_metadata.avatar_url);
        setloading(false); // i put it here because this is the palce that requires the most time
      })();
    }
  }, [Otheruserid]);

  async function getlastseen(thenewpayload: any | null) {
    //Gets last seen for non global
    if (Currentopenchatid != "Global") {
      try {
        var lastseen, error;
        if (thenewpayload == null) {
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

        if (diffSeconds < 60) {
          setlastseen("Last Seen: A few moments ago");
        } else if (diffSeconds < 3600) {
          setlastseen(
            `Last Seen: ${Math.floor(diffSeconds / 60)} minute(s) ago`
          );
        } else if (now.toDateString() === lastSeenDate.toDateString()) {
          setlastseen(
            "Last Seen: Today at " + convertTime(String(lastSeenDate))
          );
        } else {
          setlastseen(
            "Last Seen: " +
              lastSeenDate.toLocaleDateString() +
              " " +
              convertTime(String(lastSeenDate))
          ); // Fallback to full date
        }
      } catch (e) {
        setlastseen("Unknown");
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
            getlastseen(payload.new);
          }
        )
        .subscribe();
      setloading(true);
      getlastseen(null);
      let interval = setInterval(() => {
        getlastseen(null);
      }, 300000);
      return () => {
        channels.unsubscribe();
        clearInterval(interval);
      };
    }
  }, [Otheruserid]);

  function GoBack() {
    setCurrentopenchatid(undefined);
    setOtheruserid(undefined);
  }
  return !loading ? (
    <div
      id="CurrentHeader"
      className=" text-MainText shadow-[0px_1px_5px_rgba(var(--MainText),0.2)] z-10 min-h-16 h-[10%] bg-Main w-full  gap-2 content-center flex px-1 justify-between items-center "
    >
      {Currentopenchatid != "Global" ? (
        <>
          <div className="flex justify-center items-center gap-3">
            <div className="relative">
              {pfp && <img
                alt="PFP"
                src={pfp}
                className="h-14 w-14 cursor-pointer rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement; // Cast to HTMLImageElement
                  target.onerror = null; // Prevent infinite loop
                  target.src = defaultpfp; // Fallback to 'pfp'
                }}
              />}
              {onlineusers &&
                onlineusers.some((u: any) => u.user === Otheruserid) &&
                (onlineusers[
                  onlineusers.findIndex((obj) => obj.user == Otheruserid)
                ].status == "Online" ? (
                  <span className="absolute w-4 h-4 right-0 top-[70%] rounded-full bg-green-500"></span>
                ) : (
                  <span className="absolute w-4 h-4 right-0 top-[70%] rounded-full bg-yellow-500"></span>
                ))}
            </div>
            <div>
              <span>{name}</span>
              <br />
              {!istyping ? (
                <span>
                  {onlineusers &&
                  onlineusers.some((u: any) => u.user === Otheruserid)
                    ? onlineusers[
                        onlineusers.findIndex((obj) => obj.user == Otheruserid)
                      ].status == "Online"
                      ? "Online"
                      : "Away"
                    : lastseen}
                </span>
              ) : (
                <span>bro is typing...</span>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="w-fit h-full gap-2 flex items-center text-LightModeMain  cursor-pointer">
           <div className="rounded-full ml-1 border-MainText border-2 border-solid  w-16">
      <img src={globe} className={`  ${!lightmode ? "invert": ""} `} alt="Globe" />
      </div>
          <div>
            <span>Global Chat</span>
            <br />
            <div className="flex flex-col items-start">
              {istyping && whoistyping ? (
                <span>
                  <span>{lastseenglobal} Online and </span>
                  <span>
                    {whoistyping.length === 1
                      ? `${whoistyping[0]} is typing...`
                      : whoistyping.length > 3
                      ? `${whoistyping.length} users typing`
                      : `${whoistyping.join(", ")} are typing...`}
                  </span>
                </span>
              ) : Number(lastseenglobal) <= 1 ? (
                <span>You're lonely here</span>
              ) : (
                <span>{lastseenglobal} Online</span>
              )}
            </div>
          </div>
        </div>
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
  ) : (
    <div
      id="CurrentHeader"
      className=" text-LightModeMain shadow-[0px_5px_12px_rgba(0,0,0,0.589)] z-10 min-h-16 h-[10%] bg-Main w-full  gap-2 content-center flex px-1 justify-between items-center "
    >
      Loading
    </div>
  );
};

export default ChatHeader;
