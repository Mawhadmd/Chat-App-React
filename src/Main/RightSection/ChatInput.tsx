import { useContext, useEffect, useState } from "react";
import { ChatContext, ReloadContactsCtxt } from "../App";
import { supabase } from "../Supabase";

const ChatArea = () => {
  const context = useContext(ChatContext);
  const {
    setCurrentopenchatid,
    setquery,
    Currentopenchatid,
    Otheruserid,
    uuid,
  } = context;
  const { setReloadcontact } = useContext(ReloadContactsCtxt);
  const [content, setinputcontent] = useState<
    string | readonly string[] | undefined
  >("");
  const [contentisfull, setcontentisfull] = useState<boolean>(false);

  async function SetData() {
    if (!contentisfull) {
      let contentval = content;
      setinputcontent("");
      if (contentval != "") {
        if (Currentopenchatid != "Global" && !!Currentopenchatid) {
          var chatid = null;
          if (Currentopenchatid == -1) {
           await  fetch("https://chat-app-react-server-qizz.onrender.com/insertuser", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                uuid: uuid,
                accessToken: (await supabase.auth.getSession()).data.session?.access_token,
                Otheruserid: Otheruserid,
              }),
            })
              .then((response) => {
                if (!response.ok) {
                  // Check if the response status is not in the range 200-299
                  throw new Error(`HTTP error! Status: ${response.status}`); // Throw an error with the status code
                }
                return response.json();
              })
              .then((res) => {
                setCurrentopenchatid(res?.[0].chatId);
                chatid = res?.[0].chatId;
                setquery("");
                setReloadcontact((previous: boolean) => !previous);

              })
              .catch((e) => console.log(e + "Error while inserting a user"));
          }
    
          await fetch("https://chat-app-react-server-qizz.onrender.com/Insertprivatemessages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Content: contentval,
              chatId: Currentopenchatid < 1 ? chatid : Currentopenchatid,
              Receiver: Otheruserid,
              senderid: uuid,
              accessToken: (await supabase.auth.getSession()).data.session?.access_token,
            }),
          })
            .then((response) => {
              
              if (!response.ok) {
                // Check if the response status is not in the range 200-299
                throw new Error(`HTTP error! Status: ${response.status}`); // Throw an error with the status code
              }
              return response.json();
            })
            .then((res) => console.log(res + "Inseting pvt message done"))
            .catch((e) => console.log(e + "Error Inseting pvt message"));
        } else {
          await fetch("https://chat-app-react-server-qizz.onrender.com/Insertglobalmessages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ contents: contentval, senderid: uuid,accessToken: (await supabase.auth.getSession()).data.session?.access_token }),
          })
            .then((response) => {
              if (!response.ok) {
                // Check if the response status is not in the range 200-299
                throw new Error(`HTTP error! Status: ${response.status}`); // Throw an error with the status code
              }
              return response.json();
            })
            .then((res) => console.log(res + "Response Inseting global message"))
            .catch((e) => console.log(e + "Error Inseting global message"));
        }
      } else alert("Write something");
    }
  }

  useEffect(() => {
    if (!!content || content == "")
      if (content.length > 300) {
        setcontentisfull(true);
      } else setcontentisfull(false);
  }, [content]);
  return (
    <div
      id="ChatInput"
      className="relative gap-3 transition-all  bg-Main flex items-center  h-[10%]  w-full content-center px-5 "
    >
      {contentisfull && (
        <div className=" absolute w-32 pointer-events-none bg-Main text-Secondary text-center p-1 rounded-lg  top-[-120%] right-6 z-20">
          You can't have over 300 characters in here
        </div>
      )}
      <input
        onKeyDown={({ key }) => {
          if (String(key) == "Enter") SetData();
        }}
        onChange={(e) => {
          setinputcontent(e.target.value);
        }}
        value={content}
        type="text"
        placeholder="Text Here"
        className={`w-[95%] shadow-[-5px_5px_15px_1px_rgba(0,0,0,0.589)] transition-all placeholder:text-Main rounded-3xl p-4 focus:!ring-4 focus:p-3 bg-MainText text-Main ${
          !contentisfull ? "focus:ring-Secondary" : "focus:ring-red-500"
        } focus:outline-none`}
      />
      <button
        onClick={() => {
          SetData();
        }}
        className={`w-[5%] min-w-fit hover:bg-actionColor hover:text-black text-white transition-all duration-500 bg-Secondary rounded-full p-4`}
      >
        Send
      </button>
    </div>
  );
};

export default ChatArea;
