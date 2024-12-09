import { useState, createContext, useEffect } from "react";
import LeftSection from "./LeftSection/LeftSection";
import RightSection from "./RightSection/RightSection";
import { supabase } from "./Supabase";

export const SettingContext = createContext<any>(null);
export const ChatContext = createContext<any>(null);
export const ReloadContactsCtxt = createContext<any>(null);

function App() {
  const [lightmode, setlightmode] = useState<boolean>(
    localStorage.getItem('islightmode') == '1'?  true: false
  );
  const [MobileMode, setMobileMode] = useState<boolean>(false);
  const [showsettings, setshowsettings] = useState<string>(
    "hidden translate-y-[100vh]"
  );
  const [Reloadcontact, setReloadcontact] = useState<boolean>();
  const [query, setquery] = useState<string>("");
  const [Content, setcontent] = useState<string>("");
  const [logged, setLogged] = useState(false);
  const [uuid, setuuid] = useState<string | undefined>();
  const timeuntilnextlastseen = 10 * 1000;
  const [Currentopenchatid, setCurrentopenchatid] = useState<
    string | undefined
  >(undefined);
  const [Otheruserid, setOtheruserid] = useState<string | undefined>(undefined);
  const timeuntilnextupdate = timeuntilnextlastseen;
  useEffect(() => {

   
      const colors = {  
        "--MainBlack": "54, 55, 50",
        "--MainBlue": "02, 195, 255",
        "--MainSky": "83, 216, 251",
        "--MainPinkishWhite": "220, 225, 233",
        "--Mainpink": "212, 175, 185",
        "--MainBlackfr": "0, 0, 0"
      };
     
      const rootStyle = document.documentElement.style;

    
          if (!lightmode) {
          
            Object.entries(colors).forEach(([key, value]) => {
              rootStyle.setProperty(key, value);
            });
            localStorage.setItem('islightmode','0')
            setlightmode(false)
          } else if(lightmode && getComputedStyle(document.documentElement).getPropertyValue("--MainBlack") == "54, 55, 50"){
            
            Object.keys(colors).forEach((key) => {
              const currentValue = getComputedStyle(document.documentElement)
                .getPropertyValue(key)
                .trim();
              const colorToInvert = currentValue;
              const invertedColor = colorToInvert
                .split(",")
                .map((i: string) => 255 - Number(i.trim()))
                .join(", ");
              console.log(invertedColor, key)
              rootStyle.setProperty(key, invertedColor);
            });   
             localStorage.setItem('islightmode','1')
             setlightmode(true)
          }
        
     
  }, [lightmode]);

  async function getuuid() {
    let user = await supabase.auth.getUser();
    let uuid = user.data.user?.id;

    setuuid(uuid);
  }
  function changelightmode() {
    setlightmode((prev) => !prev);
  }
  function getMobileMode(width: number) {
    let t;
    clearTimeout(t);
    t = setTimeout(() => {
      if (width < 800) {
        setMobileMode(true);
      } else {
        setMobileMode(false);
      }
    }, 200);
  }
  useEffect(() => {
    getMobileMode(window.innerWidth);
    window.addEventListener("resize", ({ target }) => {
      const w = target as Window;
      getMobileMode(w.innerWidth);
    });
    return () => {
      window.removeEventListener("resize", ({ target }) => {
        const w = target as Window;
        getMobileMode(w.innerWidth);
      });
    };
  }, []);
  useEffect(() => {
    getuuid(); // get uuid of the current user logged in
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session, "Event, Session");
      if (["INITIAL_SESSION", "SIGNED_IN"].includes(event) && session != null)
        setLogged(true);
      if (event === "SIGNED_OUT") setLogged(false);
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);
  useEffect(() => {
    window.addEventListener('focus',insertlastseen)
    return () => {
      window.removeEventListener('focus',insertlastseen)
    };
  }, [uuid]);
  async function insertlastseen() {
   console.log(document.hasFocus(),uuid, uuid && document.hasFocus())
    if (uuid && document.hasFocus()) {
      var userinUserscheck = await supabase
      .from("Users")
      .select("*")
      .eq("id", uuid);
  
    if (userinUserscheck.data && userinUserscheck.data?.length == 0) {
      await supabase
        .from("Users")
        .insert([{ LastSeen: `${Date.now()}` }])
 
    } else {
       await supabase
        .from("Users")
        .update([{ LastSeen: `${Date.now()}` }])
        .eq("id", uuid)
  
    }
    localStorage.setItem("lastseenupdate", `${Date.now()}`);
    }
  }
  useEffect(() => {
    let interva = setInterval(() => {
      let lastseen = localStorage.getItem("lastseenupdate");
      if (lastseen) {
        if (Date.now() - Number(lastseen) > timeuntilnextupdate)
          insertlastseen();
      } else {
        insertlastseen();
      }
    }, timeuntilnextlastseen);
    return () => {
      clearInterval(interva);
    };
  }, [uuid]);
  function setshowsettings1() {
    if (!showsettings.includes("flex")) {
      setTimeout(() => {
        setshowsettings("flex");
      }, 150);
      setshowsettings("translate-y-[-100vh]");
    } else {
      setshowsettings("translate-y-[100vh]");
      setTimeout(() => {
        setshowsettings("hidden");
      }, 150);
    }
  }
  return (
    <>
      <div
        onClick={() => setshowsettings1()}
        className={`flex items-center justify-center gap-5 p-5  fixed inset-0 bg-MainBlack rounded-md z-[99] transition-all 
          ${showsettings}`}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="relative max-md:flex-1 p-3 rounded-xl w-[40%] h-full bg-Mainpink flex flex-col items-center shadow-[0_0_10px_MainBlack] gap-5 pt-10 "
        >
          <a
            href="mailto:mawhadmd@gmail.com"
            className="max-md:w-fit p-5 bg-MainBlue rounded-xl text-MainBlack w-[50%] h-16 hover:bg-MainPinkishWhite"
          >
            <p className="text-center">FeedBack</p>
          </a>
          <a
            href="mailto:mawhadmd@gmail.com"
            className=" max-md:w-fit p-5 bg-MainBlue rounded-xl text-MainBlack w-[50%] h-16 hover:bg-MainPinkishWhite"
          >
            <p className="text-center">Suggestion</p>
          </a>
          <span className="mt-auto">
            Your id is <span className="font-bold">{uuid?.slice(0, 5)}</span>{" "}
            <br />
            or {uuid}
          </span>
          {lightmode ? (
            <button
              onClick={changelightmode}
              className="p-2 bg-MainBlack text-MainPinkishWhite"
            >
              Dark Mode
            </button>
          ) : (
            <button
              onClick={changelightmode}
              className="bg-MainBlack text-MainPinkishWhite p-2"
            >
              Light Mode
            </button>
          )}
        </div>
        <button className="rounded-xl  text-MainBlack mb-auto p-4 bg-Mainpink hover:bg-MainPinkishWhite">
          Close
        </button>
      </div>
      <SettingContext.Provider value={{ setshowsettings1, MobileMode }}>
        <ReloadContactsCtxt.Provider
          value={{ Reloadcontact, setReloadcontact }}
        >
          <ChatContext.Provider
            value={{
              setCurrentopenchatid,
              Currentopenchatid,
              setOtheruserid,
              Otheruserid,
              logged,
              uuid,
              setcontent,
              Content,
              query,
              setquery,
            }}
          >
            {/* If its not mobile show, and is not in a chat show leftsection */}
            {/* If its not mobile show, and is not in a chat show leftsection */}
            {MobileMode ? (
              <>
                {!Currentopenchatid && <LeftSection />}
                {Currentopenchatid && <RightSection />}
              </>
            ) : (
              <>
                <LeftSection />
                <RightSection />
              </>
            )}
          </ChatContext.Provider>
        </ReloadContactsCtxt.Provider>
      </SettingContext.Provider>
    </>
  );
}

export default App;
