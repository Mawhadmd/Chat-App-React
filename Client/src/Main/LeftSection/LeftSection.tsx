import Searchbox from "./searchbox";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../Supabase";
import { ChatContext, ReloadContactsCtxt, SettingContext } from "../App";
import Contacts from "./Contacts";
import GlobalChat from "./GlobalChat";
import googleicon from "../../assets/googleicon.png";
import { getuserbyid } from "../util/getuserbyid";
import React from "react";

const LeftSection = ({}) => {
  const {
    setCurrentopenchatid,
    logged,
    query,
    setquery,
    uuid,
    Currentopenchatid,
  } = useContext(ChatContext);

  const { MobileMode } = useContext(SettingContext);
  const { Reloadcontact } = useContext(ReloadContactsCtxt);
  const [contacts, setcontacts] = useState<any[] | undefined>();
  const [SearchResults, setSearchResults] = useState([]);
  useEffect(() => {
    const subscription = supabase
      .channel("listens-to-new-users")
      .on(
        "postgres_changes",
        {
          event: "INSERT", // you can also listen to UPDATE and DELETE
          schema: "public",
          table: "Contacts",
          filter: `User2=eq.${String(uuid)}`,
        },
        () => {
          console.log("new user added me");
          getcontacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [uuid]); // this listens if new contacts added me or messaged me
  async function getcontacts() {
    let q1 = await supabase
      .from("Contacts")
      .select("User2, chatId")
      .eq("User1", uuid); //you added them to your contacts

    let q2 = await supabase
      .from("Contacts")
      .select("User1, chatId")
      .eq("User2", uuid); //they added you to their contacts
    if (q1.error && q2.error)
      console.error(q1.error.details + "errors2:" + q2.error.details);
    let arrayofusers: any[] = [];
    if (!!q1.data && !!q2.data) {
      for (let i = 0; i < q1.data?.length; i++) {
        let id = q1.data[i].User2;
        let res = await getuserbyid(id);
        let chatId = q1.data[i].chatId;
        arrayofusers.push({ res, chatId });
      }
      for (let i = 0; i < q2.data?.length; i++) {
        let id = q2.data[i].User1;

        let res = await getuserbyid(id);
        let chatId = q2.data[i].chatId;
        arrayofusers.push({ res, chatId });
      }
    }
    console.log(arrayofusers);
    setcontacts(arrayofusers);
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
        className={`flex flex-col bg-Main h-screen relative translate-x-0 transition-all z-20 ${
          MobileMode
            ? !Currentopenchatid
              ? "w-full !absolute"
              : "translate-x-[-100%] !absolute"
            : "w-[500px] min-w-[400px]"
        }
        `}
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
                          i={i}
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
                    contacts.map(({ res, chatId }, i: number) => {
                      return (
                        <Contacts
                          i={i}
                          key={chatId}
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
                    <div className="fixed inset-0 transition-all z-50 text-MainText flex items-center justify-center text-4xl bg-Main h-screen w-screen">
                      Loading chat
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <button
              id="login"
              className="transition-all duration-300  hover:text-Main  hover:bg-actionColor/50 bg-Main gap-4 flex justify-center items-center shadow-[-4px_4px_5px_rgba(62,74,100,0.589)] mt-11 p-3 w-fit mx-auto rounded-2xl "
              onClick={handlelogin}
            >
              <img src={googleicon} alt="icon" className="w-10 h-full" />
              <span className=" font-bold">Sign In</span>
            </button>
            <div className="text-center text-MainText text-xl mt-5 px-4">
              <h2 className="text-3xl font-bold text-MainText">
                Welcome to Chatty
              </h2>
              <p>
                You need to login to start chatting, This app allows you to
                connect and chat with your contacts seamlessly. Use the search
                box to find users and start conversations. For the best
                experience, please use the app on a desktop web browser.
              </p>
              <br />
              <h3 className="text-2xl font-bold text-MainText">
                Latest updates and features:
              </h3>
                <ul className="list-disc list-inside mt-4 text-left ml-4">
                <li className="mb-2">Real-time contact updates</li>
                <li className="mb-2">Improved search functionality</li>
                <li className="mb-2">Enhanced mobile mode for better usability</li>
                </ul>
            </div>
          </>
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

export default React.memo(LeftSection);
