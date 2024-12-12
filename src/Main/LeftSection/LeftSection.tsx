import Searchbox from "./searchbox";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext, ReloadContactsCtxt, SettingContext } from "../App";
import Contacts from "./Contacts";
import GlobalChat from "./GlobalChat";
import googleicon from "../../assets/googleicon.png";

const LeftSection = ({}) => {
  const { setCurrentopenchatid, query, setquery, logged, uuid } =
    useContext(ChatContext);
  const { MobileMode } = useContext(SettingContext);
  const { Reloadcontact } = useContext(ReloadContactsCtxt);
  const [contacts, setcontacts] = useState<any[] | undefined>();
  const [SearchResults, setSearchResults] = useState([]);

  async function getcontacts() {
    var data, error;
    let q1 = await supabase
      .from("Contacts")
      .select("User2, chatId")
      .eq("User1", uuid);

    let q2 = await supabase
      .from("Contacts")
      .select("User1, chatId")
      .eq("User2", uuid);

    if (q1.error && q2.error)
      error = q1.error.details + "errors2:" + q2.error.details;
    let arrayofusers: any[] = [];


    if (!!q1.data && !!q2.data) {
      for (let i = 0; i < q1.data?.length; i++) {
        let id = q1.data[i].User2;
        let res = await fetch('https://chat-app-react-server-qizz.onrender.com/getuserbyid', {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({id: id})
    }).then(res => res.json())
        let chatId = q1.data[i].chatId;
        arrayofusers.push({ res, chatId });
      }
      for (let i = 0; i < q2.data?.length; i++) {
        let id = q2.data[i].User1;

        let res = await fetch('https://chat-app-react-server-qizz.onrender.com/getuserbyid', {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({id: id})
        }).then(res => res.json())
        let chatId = q2.data[i].chatId;
        arrayofusers.push({ res, chatId });
      }
    }
    console.log(arrayofusers, "Array of contacts");
    setcontacts(arrayofusers);

    console.log(data, error, "data,error getting contacts");
  }

  useEffect(() => {
    if (uuid) {
      getcontacts();
    }
  }, [uuid, Reloadcontact]);

  function handlelogin() {
    supabase.auth.signInWithOAuth({ provider: "google" });
  }

  function Logout() {
    if (confirm("Are you sure?")) supabase.auth.signOut();
  }

  return (
    <>
      <section
        id="LeftSection"
        className={`flex flex-col bg-Main ${
          MobileMode ? "w-full" : "w-[500px] min-w-[400px]"
        }
        h-screen relative z-20 transition-all`}
      >
        {logged ? (
          <>
            <Searchbox
              setquery={setquery}
              query={query}
              setSearchResults={setSearchResults}
            />
            <GlobalChat setCurrentopenchatid={setCurrentopenchatid} />

            {query != "" ? (
              SearchResults != undefined ? (
                SearchResults.length != 0 ? (
                  <>
                    {" "}
                    <div className="h-20 text-2xl content-center mx-auto text-MainText">
                      Search Results
                    </div>
                    {SearchResults.map(({ user, chatid }, i) => {
                      return (
                        <Contacts
                          issearch={true}
                          chatId={chatid}
                          key={i}
                          user={user}
                        ></Contacts>
                      );
                    })}
                  </>
                ) : (
                  <div className="mt-5 mx-auto text-2xl text-MainText">
                    No Results
                  </div>
                )
              ) : (
                <div className="mt-5 mx-auto text-2xl text-MainText">
                  Loading...
                </div>
              )
            ) : (
              <div className=" h-fit  mt-1 flex flex-col items-center justify-center text-MainText text-2xl">
                {contacts != undefined ? (
                  contacts.length > 0 ? (
                    contacts.map(({ res, chatId }, i) => {
                      return (
                        <Contacts
                          key={i}
                          chatId={chatId}
                          user={res?.data.user}
                        ></Contacts>
                      );
                    })
                  ) : (
                    <span>No Contacts</span>
                  )
                ) : (
                  <>
                  <span>Loading...</span>
                  <div className="fixed inset-0 transition-all z-50 text-MainText flex items-center justify-center text-4xl bg-Main">
                    Loading chat
                  </div>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <button
            id="login"
            className="transition-all duration-300 hover:bg-actionColor bg-Main gap-4 flex justify-center items-center shadow-[-4px_4px_5px_rgba(62,74,100,0.589)] mt-11 p-3 w-fit mx-auto rounded-2xl "
            onClick={handlelogin}
          >
            <img src={googleicon} alt="icon" className="w-10 h-full" />
            <span className="text-MainText font-bold">Sign In</span>
          </button>
        )}

        <div className={`${!logged ? "hidden" : "static"}`}>
          <button
            onClick={Logout}
            className="flex absolute bottom-2 left-2 hover:bg-actionColor/80 text-white hover:text-black bg-Secondary w-20 h-10 justify-center items-center rounded-3xl"
          >
            Logout
          </button>
        </div>
      </section>
    </>
  );
};

export default LeftSection;
