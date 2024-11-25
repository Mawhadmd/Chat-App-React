import { useEffect, useState } from "react";
import { supabase } from "../Supabase";
const Searchbox = () => {
  const [userPfp, setUserPfp] = useState<string | undefined>();

  async function fetchPfp() {
    supabase.auth
      .getUser()
      .then((pfp) => {
        setUserPfp(pfp.data.user?.user_metadata.avatar_url);
      }).catch(()=>{
        console.log("An Error Occured while fetching the pfp")
      })

  }

  useEffect(() => {
    fetchPfp();
  }, []);

  return (
    <div className="h-[10%] min-w-[650px]min-h-16 flex items-center justify-center px-3">
      <div className="relative group">
        <img src={userPfp} alt="pfp" className="rounded-full cursor-pointer w-fit h-fit" />
        <span className="absolute -bottom-12 bg-black/80 text-MainPinkishWhite pink w-fit h-fit p-2 pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100  group-hover:translate-y-0 translate-y-5 transition-all  z-50">
          Settings
        </span>
      </div>
      <div className="w-full h-20 bg-MainBlack flex items-center justify-center">
        <input
          type="text"
          className="focus:ring-MainSky focus:ring-2 transition-all outline-none p-2 w-11/12 mx-auto h-10 placeholder:p-1 placeholder:text-black rounded-lg drop-shadow-xl"
          placeholder="Search For a contact By ID"
        />
      </div>
    </div>
  );
};

export default Searchbox;
