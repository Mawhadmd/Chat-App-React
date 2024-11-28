import {  useState, createContext, useEffect } from "react";
import LeftSection from "./LeftSection/LeftSection";
import RightSection from "./RightSection/RightSection";
import { supabase } from "./Supabase";

export const ChatContext = createContext<any>(null);
export const ReloadContactsCtxt = createContext<any>(null);


function App() {
  const [Reloadcontact, setReloadcontact] = useState<boolean>();
  const [query, setquery] = useState<string>("");
  const [Content, setcontent] = useState<string>('');
  const [logged, setLogged] = useState(false);
  const [uuid, setuuid] = useState<string | undefined>();
  async function getuuid() {
    let user = await supabase.auth.getUser();
    let uuid = user.data.user?.id;
    setuuid(uuid);
  }
  useEffect(() => {
    getuuid(); // get uuid of the current user logged in
  }, []);
  const [Currentopenchatid, setCurrentopenchatid] = useState<string | undefined>(undefined);
  const [Otheruserid, setOtheruserid] = useState<string | undefined>(undefined);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session, "Event, Session");
      if (["INITIAL_SESSION", "SIGNED_IN"].includes(event) && session != null) setLogged(true);
      if (event === "SIGNED_OUT") setLogged(false);
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);


  return (
    <>
    <div className="absolute inset-[20%] bg-black z-[99]">

    </div>
    <ReloadContactsCtxt.Provider value={{Reloadcontact, setReloadcontact}}>
    <ChatContext.Provider
    value={{ setCurrentopenchatid, Currentopenchatid,setOtheruserid,Otheruserid, logged, uuid, setcontent,Content, query, setquery}}
    >
      <LeftSection />
      <RightSection />
    </ChatContext.Provider>
      </ReloadContactsCtxt.Provider>
      </>

  );
}

export default App;
