import { useState, createContext, useEffect } from "react";
import LeftSection from "./LeftSection/LeftSection";
import RightSection from "./RightSection/RightSection";
import { supabase } from "./Supabase";

export const SettingContext = createContext<any>(null);
export const ChatContext = createContext<any>(null);
export const ReloadContactsCtxt = createContext<any>(null);

function App() {
  const [lightmode, setlightmode] = useState<boolean>(true);
  const [MobileMode, setMobileMode] = useState<boolean>(false);
  const [showsettings, setshowsettings] = useState<string>(
    "hidden translate-y-[100vh]"
  );
  const [Reloadcontact, setReloadcontact] = useState<boolean>();
  const [query, setquery] = useState<string>("");
  const [Content, setcontent] = useState<string>("");
  const [logged, setLogged] = useState(false);
  const [uuid, setuuid] = useState<string | undefined>();
  const timeuntilnextlastseen = 60 * 1000;
  const [Currentopenchatid, setCurrentopenchatid] = useState<
    string | undefined
  >(undefined);
  const [Otheruserid, setOtheruserid] = useState<string | undefined>(undefined);
  const timeuntilnextupdate = timeuntilnextlastseen;
  async function getuuid() {
    let user = await supabase.auth.getUser();
    let uuid = user.data.user?.id;

    setuuid(uuid);
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
  async function insertlastseen() {
    if (uuid && document.hasFocus()) {
      var userinUserscheck = await supabase
        .from("Users")
        .select("*")
        .eq("id", uuid);
      var a;
      if (userinUserscheck.data && userinUserscheck.data?.length == 0) {
        a = await supabase
          .from("Users")
          .insert([{ LastSeen: `${Date.now()}` }])
          .select();
      } else {
        a = await supabase
          .from("Users")
          .update([{ LastSeen: `${Date.now()}` }])
          .eq("id", uuid)
          .select();
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
        className={`flex items-center justify-center gap-5 p-5  fixed inset-0 bg-black rounded-md z-[99] transition-all 
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
            <button className="p-2 bg-MainBlack text-MainPinkishWhite">
              Light Mode
            </button>
          ) : (
            <button className="bg-MainBlack text-MainPinkishWhite p-2">
              Dark Mode
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
