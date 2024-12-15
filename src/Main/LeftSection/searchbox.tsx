import { useContext, useEffect, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext, SettingContext } from "../App";
import pfp from "../../assets/grayuserpfp.png"
import getChatId from "../util/getChatId";
const Searchbox = ({ setquery, query, setSearchResults }: any) => {
  const [userPfp, setUserPfp] = useState<string | undefined>("");
  const {uuid} = useContext(ChatContext)
  const {setshowsettings1} = useContext(SettingContext)

  async function fetchPfp() {
    supabase.auth
      .getUser()
      .then((pfp) => {
        setUserPfp(pfp.data.user?.user_metadata.avatar_url);
      })
      .catch(() => {
        console.log("An Error Occured while fetching the pfp");
      });
  }

  useEffect(() => {
    fetchPfp();
  }, []);

  async function runquery() {

    let res = (await fetch('/getuserslist', {
      method: "POST",
      headers: {"Content-Type": "application/json"},
    }).then(res => res.json()))
    
    
    res.data.users.filter(
      (e:any) =>
        e.id.slice(0, 5) == query ||
        e.user_metadata.name.toLowerCase().includes(query.toLowerCase())
        && e.id != uuid
        
    );
    const result = await Promise.all(
      res.map(async (user:any) => {
        let id = await getChatId(user.id, uuid);
        return { user, chatid: id };
      })
    );
    setSearchResults(result);
    console.log(res, 'Search results of the search');
  }


  useEffect(() => {
    var tout: any
    if (!!query) {
    setSearchResults()
     tout = setTimeout(() => {
     
        runquery();
       
      }, 1000);
    }
    return () => clearTimeout(tout);
  }, [query]);


  return (
    <div className="h-24 min-w-[650px]min-h-16 flex items-center justify-center px-3">
      <div className=" relative group ">
        <img
          onClick={()=>setshowsettings1()}
          src={userPfp}
          alt="pfp"
          className="rounded-full cursor-pointer w-20"
          onError={(e) => {
         
            const target = e.target as HTMLImageElement; // Cast to HTMLImageElement
            target.onerror = null; // Prevent infinite loop
            target.src = pfp; // Fallback to 'pfp'
          }}
        />
        <span className="absolute -bottom-12 bg-MainBlackfr/80 text-MainText 
        pink w-fit h-fit p-2 
        pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100
         group-hover:translate-y-0 translate-y-5 transition-all  z-50">
          Settings
        </span>
      </div>
      <div className=" w-full h-20 bg-Main flex items-center justify-center">
        <input
          value={query}
          onChange={(e) => setquery(e.target.value)}
          type="text"
          className="focus:ring-actionColor focus:ring-2 transition-all outline-none p-2 w-11/12
           mx-auto h-10 placeholder:p-1 placeholder:text-black rounded-lg drop-shadow-xl"
          placeholder="Search For a contact By ID"
        />
      </div>
    </div>
  );
};

export default Searchbox;
