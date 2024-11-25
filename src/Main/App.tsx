import {  useState, createContext, useEffect } from "react";
import LeftSection from "./LeftSection/LeftSection";
import RightSection from "./RightSection/RightSection";
import { supabase } from "./Supabase";

export const ChatContext = createContext<any>(null);

function App() {
  const [logged, setLogged] = useState(false);
  const [Currentopenchatid, setCurrentopenchatid] = useState<string | undefined>(undefined);

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
    <ChatContext.Provider
      value={{ setCurrentopenchatid, Currentopenchatid, logged }}
    >
      <LeftSection />
      <RightSection />
    </ChatContext.Provider>
  );
}

export default App;
