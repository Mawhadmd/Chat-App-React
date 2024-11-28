import Searchbox from "./searchbox";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext, ReloadContactsCtxt } from "../App";
import Contacts from "./Contacts";
import GlobalChat from "./GlobalChat";

const LeftSection = ({}) => {
  const { setCurrentopenchatid, query,setquery, logged, uuid } =
    useContext(ChatContext);
  const {Reloadcontact, setReloadcontact} = useContext(ReloadContactsCtxt)
  const [contacts, setcontacts] = useState<any[] | undefined>();
  const [SearchResults, setSearchResults] = useState([]);

  async function getcontacts() {
    var data, error;
    let q1 = await supabase.from("Contacts").select("User2").eq("User1", uuid);

    let q2 = await supabase.from("Contacts").select("User1").eq("User2", uuid);

    if (q1.error && q2.error)
      error = q1.error.details + "errors2:" + q2.error.details;
    let arrayofusers: any[] = [];

    if (!!q1.data && !!q2.data) {
      console.log(q1,"user1 if user2 is current user")
      console.log(q2,"user2 if user1 is current user")
      for (let i = 0; i < q1.data?.length; i++) {
        let id = q1.data[i].User2;
        let res = await supabase.auth.admin.getUserById(id);
        arrayofusers.push(res);
      }
      for (let i = 0; i < q2.data?.length; i++) {
        let id = q2.data[i].User1;

        let res = await supabase.auth.admin.getUserById(id);
        arrayofusers.push(res);
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
  }, [uuid,Reloadcontact]);

  function handlelogin() {
    supabase.auth.signInWithOAuth({ provider: "google" });
  }

  function Logout() {
    if (confirm("Are you sure?")) supabase.auth.signOut();
  }

  return (
    <>
      <section
        className=" flex flex-col bg-MainBlack w-[500px]
        h-screen relative "
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
                    <div className="h-20 text-2xl content-center mx-auto text-MainPinkishWhite">
                      Search Results
                    </div>
                    {SearchResults.map((e: any, i) => {
                      return (
                        <Contacts issearch={true} key={i} user={e}></Contacts>
                      );
                    })}
                  </>
                ) : (
                  <div className="mt-5 mx-auto text-2xl text-MainPinkishWhite">
                    No Results
                  </div>
                )
              ) : (
                <div className="mt-5 mx-auto text-2xl text-MainPinkishWhite">
                  Loading...
                </div>
              )
            ) : (
              <div className=" h-fit gap-2 mt-1 flex flex-col items-center justify-center text-MainPinkishWhite text-2xl">
                {contacts != undefined ? (
                  contacts.length > 0 ? (
                    contacts.map((item, i) => {
                      return (
                        <Contacts key={i} user={item?.data.user}></Contacts>
                      );
                    })
                  ) : (
                    <span>No Contacts</span>
                  )
                ) : (
                  <span>Loading...</span>
                )}
              </div>
            )}
          </>
        ) : (
          <button
            id="login"
            className="shadow-[-4px_4px_5px_rgba(62,74,100,0.589)] mt-11 p-3 bg-blue-400 w-[50%] mx-auto rounded-2xl "
            onClick={handlelogin}
          >
            Login to access more features
          </button>
        )}

        <div className={`${!logged ? "hidden" : "static"}`}>
          <button
            onClick={Logout}
            className="flex absolute bottom-2 left-2 hover:bg-MainSky/80 bg-MainBlue w-20 h-10 justify-center items-center rounded-3xl"
          >
            Logout
          </button>
        </div>
      </section>
    </>
  );
};

export default LeftSection;
