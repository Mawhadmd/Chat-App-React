import Searchbox from "./searchbox";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext } from "../App";
import Contacts from "./Contacts";
import GlobalChat from "./GlobalChat";

const LeftSection = ({}) => {
  const { setCurrentopenchatid, logged, uuid } = useContext(ChatContext);
  const [query, setquery] = useState<string>("");
  const [contacts, setcontacts] = useState<{ Contactid: any }[]>();
  const [SearchResults, setSearchResults] = useState([]);
  const [namesmap, setnamesmap] = useState(new Map());
  async function getcontacts() {
    var { data, error } = await supabase
      .from("Contacts")
      .select("Contactid")
      .eq("Userid", uuid);
    let map = new Map();
    if (!!data) {
      for (let i = 0; i < data?.length; i++) {
        let id = data[i].Contactid;
        let res = (await supabase.auth.admin.getUserById(id)).data.user
          ?.user_metadata.name;
        map.set(id, res);
      }
      setnamesmap(map);
      setcontacts(data);
    }
    console.log(data, error, "data,error getting contacts");
  }

  useEffect(() => {
    if (uuid) {
      getcontacts();
    }
  }, [uuid]);

  function handlelogin() {
    supabase.auth.signInWithOAuth({ provider: "google" });
  }

  function Logout() {
    if (confirm("Are you sure?")) supabase.auth.signOut();
  }


  return (
    <>
      <section
        className="z-20 flex flex-col bg-MainBlack w-[500px]
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
                        <Contacts
                          key={i}
                          name={e.user_metadata.name}
                          id={e.id}
                        ></Contacts>
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
                  Loading
                </div>
              )
            ) : (
              <div className="h-24 gap-2 flex items-center mx-auto text-MainPinkishWhite text-2xl">
                {contacts != undefined ? (
                  contacts.map(({ Contactid }, i) => {
                    return (
                      <Contacts
                        key={i}
                        name={namesmap}
                        id={Contactid}
                      ></Contacts>
                    );
                  })
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
