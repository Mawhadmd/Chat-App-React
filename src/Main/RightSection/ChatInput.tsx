import { useContext, useEffect, useMemo, useState } from "react";
import { ChatContext, ReloadContactsCtxt } from "../App";
import { supabase } from "../Supabase";
import { getname } from "../util/getnamebyid";


const ChatArea = ({ setmessages }: { setmessages: any }) => {
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
  const [username, setusername] = useState<boolean>(false);
  const [istyping, setistyping] = useState<boolean>(false);

 async function Messageisin(chatid:any){
   setReloadcontact((previous: boolean) => !previous);
  setCurrentopenchatid(chatid);
  setquery("");
 }
useEffect(() => {
  (async () => {let u = await getname(uuid);  setusername(u)})()

}, []);
  async function SetData() {
    if (contentisfull) return;
    let contentval = content;
    setinputcontent("");

    if (contentval != "") {
      if(Currentopenchatid != -1){
        setmessages((PreviousMessages: any) => [
          {
            Sender: uuid,
            created_at: Date.now(),
            Content: contentval,
          },
          ...(PreviousMessages || []),
        ]);
      }
      if (Currentopenchatid != "Global" && !!Currentopenchatid) {
        var chatid: string | number | null = null;
        if (Currentopenchatid == -1) {
          await fetch(
            "https://chat-app-react-server-qizz.onrender.com/insertuser",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                uuid: uuid,
                accessToken: (
                  await supabase.auth.getSession()
                ).data.session?.access_token,
                Otheruserid: Otheruserid,
              }),
            }
          )
            .then((response) => {
              if (!response.ok) {
                // Check if the response status is not in the range 200-299
                throw new Error(`HTTP error! Status: ${response.status}`); // Throw an error with the status code
              }
              return response.json();
            })
            .then((res) => {
               chatid = res?.[0].chatId
            })
            .catch((e) => console.log(e + "Error while inserting a user"));
        }
  
        async function insertmessage(){
          await fetch(
            "https://chat-app-react-server-qizz.onrender.com/Insertprivatemessages",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                Content: contentval,
                chatId: Currentopenchatid < 1 ? chatid : Currentopenchatid,
                Receiver: Otheruserid,
                senderid: uuid,
                accessToken: (
                  await supabase.auth.getSession()
                ).data.session?.access_token,
              }),
            }
          )
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              console.log('insert successful')
              if(Currentopenchatid == -1){
                Messageisin(chatid)
              }
            })
            .catch((e) => console.log(e + " Error inserting private message"));
          
        }

        insertmessage()
      } else {
        await fetch(
          "https://chat-app-react-server-qizz.onrender.com/Insertglobalmessages",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: contentval,
              senderid: uuid,
              accessToken: (
                await supabase.auth.getSession()
              ).data.session?.access_token,
            }),
          }
        )
          .then((res) => console.log(res + "Response Inseting global message"))
          .catch((e) => console.log(e + " Error Inserting global message"));
      }
    } else alert("Write something");

 
  }

  useEffect(() => {
   if(Currentopenchatid != -1){
    if (!content?.length) {
      setistyping(false);
    } else {
      setistyping(true);
      window.onblur = () => {
        setistyping(false);
      };
      window.onfocus = () => {
        setistyping(true);
      };
    }
   }
  }, [content]);

  useEffect(() => {
    const channelB = supabase.channel("istyping");
    console.log("run");
 
    async function sendMessage(isTyping: any) {
      console.log("Sending message...");
      try {
         await channelB.send({
          type: "broadcast",
          event: `typing${Currentopenchatid}`,
          payload: { user: username, id:uuid, istyping: isTyping },
        });
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }

    if (istyping) {
      sendMessage(true);
    } else {
      sendMessage(false);
    }
    return () => {
      supabase.removeChannel(channelB);
    };
  }, [Currentopenchatid, istyping]);

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
