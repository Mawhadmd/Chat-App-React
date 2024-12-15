import { useState, createContext, useEffect } from "react";
import LeftSection from "./LeftSection/LeftSection";
import RightSection from "./RightSection/RightSection";
import { supabase } from "./Supabase";

export const SettingContext = createContext<any>(null);
export const ChatContext = createContext<any>(null);
export const ReloadContactsCtxt = createContext<any>(null);
export const Onlineusersctxt = createContext<any>(null);

function App() {
  const [lightmode, setlightmode] = useState<boolean>(
    localStorage.getItem("islightmode") == "1" ? true : false
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
  const [onlineusers, setonlineusers] = useState<any>(null);
  const timeuntilnextlastseen = 180 * 1000;
  const [Currentopenchatid, setCurrentopenchatid] = useState<
    string | undefined
  >(undefined);
  const [Otheruserid, setOtheruserid] = useState<string | undefined>(undefined);
  useEffect(() => {
    const Darkcolors = {
      "--Main": "15,17,8", // main dark
      "--MainText": "202, 216 ,222", // main dark text
      "--Secondary": "36,25,9", //sec dark
      "--actionColor": "0,246,237", //action
      "--MainBlackfr": "0, 0, 0",
    };
    const lightcolors = {
      "--actionColor": "0,200,200", //action
      "--Main": "202, 216 ,222", // main light
      "--MainText": "15,17,8", // main light text
      "--Secondary": "100,88,83", // sec light
      "--MainBlackfr": "255,255,255",
    };
    const rootStyle = document.documentElement.style;

    if (!lightmode) {
      Object.entries(Darkcolors).forEach(([key, value]) => {
        rootStyle.setProperty(key, value);
      });
      localStorage.setItem("islightmode", "0");
      setlightmode(false);
    } else if (
      lightmode &&
      getComputedStyle(document.documentElement).getPropertyValue("--Main") ==
        "15,17,8"
    ) {
      Object.entries(lightcolors).forEach(([key, value]) => {
        rootStyle.setProperty(key, value);
      });
      localStorage.setItem("islightmode", "1");
      setlightmode(true);
    }
  }, [lightmode]);
  useEffect(() => {
    if (!uuid) return;

    async function getContacts() {
      let q1 = supabase.from("Contacts").select("User2").eq("User1", uuid);

      let q2 = supabase.from("Contacts").select("User1").eq("User2", uuid);

      // Wait for both queries to resolve
      let [contacts1, contacts2] = await Promise.all([q1, q2]);

      if (!contacts1.data || !contacts2.data) {
        alert("Couldn't get contacts for online status");
        return [];
      }

      return [
        ...contacts1.data.map((contact) => contact.User2),
        ...contacts2.data.map((contact) => contact.User1),
      ];
    }
    var onlineroom: any;
    // Call getContacts directly instead of using an async immediately
    getContacts().then((contacts) => {
      onlineroom = supabase.channel("onlineusers");

      const trackPresence = async () => {
        onlineroom
          .on("presence", { event: "sync" }, () => {
            let onlinecontacts = Object.values(
              onlineroom.presenceState()
            ).filter((val: any) => {
              return contacts.includes(val[0].user);
            });
            console.log(onlinecontacts, "online contacts");
            if (onlinecontacts.length > 0) {
              setonlineusers(onlinecontacts.map((val: any) => val[0].user));
            } else {
              setonlineusers(null);
            }
          })
          .subscribe();

        await onlineroom.track({ user: uuid });
      };

      trackPresence();
    });

    return () => {
      supabase.removeChannel(onlineroom);
    };
  }, [uuid]);

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
      if (["INITIAL_SESSION", "SIGNED_IN"].includes(event) && session != null)
        setLogged(true);
      if (event === "SIGNED_OUT") setLogged(false);
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);
  useEffect(() => {
    window.addEventListener("focus", insertlastseen);
    return () => {
      window.removeEventListener("focus", insertlastseen);
    };
  }, [uuid]);
  async function insertlastseen() {
    if (uuid && document.hasFocus()) {
      var userinUserscheck = await supabase
        .from("Users")
        .select("*")
        .eq("id", uuid); //checks if user already has a spot and a lastseen, so just update

      if (userinUserscheck.data && userinUserscheck.data?.length == 0) {
        try {
          await fetch(
            "https://chat-app-react-server-qizz.onrender.com/insertlastseen",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                mode: "insert",
                uuid: uuid,
                accessToken: (
                  await supabase.auth.getSession()
                ).data.session?.access_token,
              }),
            }
          );
        } catch (e) {
          alert("Error occured while updating lastseen");
        }
      } else {
        try {
          await fetch(
            "https://chat-app-react-server-qizz.onrender.com/insertlastseen",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                mode: "update",
                uuid: uuid,
                accessToken: (
                  await supabase.auth.getSession()
                ).data.session?.access_token,
              }),
            }
          );
        } catch (e) {
          console.error("Error occured while updating lastseen" + e);
        }
      }
      localStorage.setItem("lastseenupdate", `${Date.now()}`);
    }
  }
  useEffect(() => {
    insertlastseen();
    let interva = setInterval(() => {
      let lastseen = localStorage.getItem("lastseenupdate");
      if (lastseen) {
        if (Date.now() - Number(lastseen) > timeuntilnextlastseen)
          insertlastseen();
      } else {
        insertlastseen();
      }
    }, timeuntilnextlastseen / 2);
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
        className={`flex items-center justify-center gap-5 p-5  fixed inset-0 bg-Main rounded-md z-[99] transition-all 
          ${showsettings}`}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="relative max-md:flex-1 p-3 rounded-xl w-[40%] h-full bg-Secondary flex flex-col items-center shadow-[0_0_10px_MainBlack] gap-5 pt-10 "
        >
          <a
            href="mailto:mawhadmd@gmail.com"
            className="max-md:w-fit p-5 bg-actionColor rounded-xl text-black hover:text-MainText w-[50%] h-16 hover:bg-Main"
          >
            <p className="text-center">FeedBack</p>
          </a>
          <a
            href="mailto:mawhadmd@gmail.com"
            className=" max-md:w-fit p-5 bg-actionColor rounded-xl text-black hover:text-MainText w-[50%] h-16 hover:bg-Main"
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
              className="p-2 bg-Main text-MainText"
            >
              Dark Mode
            </button>
          ) : (
            <button
              onClick={changelightmode}
              className="bg-Main text-MainText p-2"
            >
              Light Mode
            </button>
          )}
        </div>
        <button className="rounded-xl  text-MainText mb-auto p-4 bg-Secondary hover:bg-Main">
          Close
        </button>
      </div>
      <SettingContext.Provider
        value={{ setshowsettings1, MobileMode, lightmode }}
      >
        <Onlineusersctxt.Provider value={{ onlineusers }}>
          <ReloadContactsCtxt.Provider
            value={{ Reloadcontact, setReloadcontact }}
          >
            <ChatContext.Provider
              value={{
                setCurrentopenchatid,
                Currentopenchatid,
                onlineusers,
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
        </Onlineusersctxt.Provider>
      </SettingContext.Provider>
    </>
  );
}

export default App;
