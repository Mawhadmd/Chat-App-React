import { useEffect, useState, createContext } from "react";
import Contacts from "./LeftSection/Contacts";
import LeftSection from "./LeftSection/LeftSection";
import RightSection from "./RightSection/RightSection";
import { supabase } from "./Supabase";

export const ChatContext = createContext<any>(null);

function App() {
  const [Currentopenchatid, setCurrentopenchatid] = useState<string | undefined>(undefined);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event);
      if (["INITIAL_SESSION", "SIGNED_IN"].includes(event)) setLogged(true);
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
