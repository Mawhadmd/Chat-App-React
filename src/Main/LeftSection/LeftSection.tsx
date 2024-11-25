import Searchbox from "./searchbox";

import globe from "../../assets/global-communication_9512332.png";
import { useContext } from "react";
import { supabase } from "../Supabase";
import { ChatContext } from "../App";

const LeftSection = ({}) => {
  const { setCurrentopenchatid , logged }= useContext(ChatContext);

  function handlelogin() {
    supabase.auth.signInWithOAuth({ provider: "google" });
  }

  return (
    <section
      className="z-20 flex flex-col bg-MainBlack w-[500px]
        h-screen "
    >
      {logged ? (
        <>
          <Searchbox />
          <div
            onClick={() => {
              setCurrentopenchatid("Global")
              console.log('Set')
            }}
            className="h-24 gap-2 flex items-center pl-5 text-MainPinkishWhite hover:bg-white/20 cursor-pointer border-MainBlue/15 border-[1px]"
          >
            <img src={globe} className="h-10 invert" alt="Globe" />
            <span>Global Chat</span>
          </div>
        
        </>
      ) 
      : (
        <button
          id="login"
          className="shadow-[-4px_4px_5px_rgba(62,74,100,0.589)] mt-11 p-3 bg-blue-400 w-[50%] mx-auto rounded-2xl "
          onClick={handlelogin}
        >
          Login to access more features
        </button>
      )}
    </section>
  );
};

export default LeftSection;
