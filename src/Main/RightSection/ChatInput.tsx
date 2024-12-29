import { useContext, useEffect, useRef, useState } from "react";
import { ChatContext, ReloadContactsCtxt, SettingContext } from "../App";
import { supabase } from "../Supabase";
import { getname } from "../util/getnamebyid";
import xicon from "../../assets/letter-x_16083478.png";
import microphoneImage from "../../assets/mic_4812038.png";
import fileupload from "../../assets/folder_16798973.png";
import rec from "../../assets/rec-button_17003646.png";
import { motion } from "motion/react";

const ChatInput = ({ setmessages }: { setmessages: any }) => {
  const context = useContext(ChatContext);
  const { lightmode } = useContext(SettingContext);
  const {
    setCurrentopenchatid,
    setquery,
    Currentopenchatid,
    Otheruserid,
    uuid,
  } = context;
  const { setReloadcontact } = useContext(ReloadContactsCtxt);
  const [File, SetFile] = useState<File | undefined>();
  const [content, setinputcontent] = useState<
    string | readonly string[] | undefined
  >("");
  const [contentisfull, setcontentisfull] = useState<boolean>(false);
  const [username, setusername] = useState<boolean>(false);
  const [istyping, setistyping] = useState<boolean>(false);
  const fileuploadref = useRef<HTMLInputElement | null>(null);
  const [recordaudio, setrecordaudio] = useState<boolean>(false);
  const [nowrecording, setnowrecording] = useState<boolean>(false);
  const [Audio, setAudio] = useState<Blob | undefined>();



  async function Messageisin(chatid: any) {
    setReloadcontact((previous: boolean) => !previous);
    setCurrentopenchatid(chatid);
    setquery("");
  }


  useEffect(() => {
    (async () => {
      let u = await getname(uuid);
      setusername(u);
    })();
  }, []);


  async function SetData() {
    if (contentisfull) return;
  
    // const profanitycheck = await fetch('https://vector.profanity.dev', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ message: content }),
    // })
    //  let data = await profanitycheck.json()
    //   if (data.isProfanity) {
    //     alert("Please don't use bad words in the chat");
    //     return;
    //   }
    let contentval = content;
    setinputcontent("");
    var Timeofthemessage = Date.now();
    if (Currentopenchatid != -1 && (contentval != "" || !File || !Audio)) {
      setmessages((PreviousMessages: any) => [
        {
          Pending: true,
          Sender: uuid,
          chatId: Currentopenchatid,
          created_at: Timeofthemessage,
          FileURL: File ? URL.createObjectURL(File): null,
          AudioFile: Audio? URL.createObjectURL(Audio): null,
          Content: contentval,
        },
        ...(PreviousMessages || []),
      ]);
      document.getElementById('ChatArea')?.scrollTo(0 ,0)
    }
    if (contentval != "" && !File && !Audio) {
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
              chatid = res?.[0].chatId;
            })
            .catch((e) => console.log(e + "Error while inserting a user"));
        }
        async function insertmessage() {
          await fetch(
            "https://chat-app-react-server-qizz.onrender.com/Insertprivatemessages",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                Content: contentval,
                chatId: Currentopenchatid == -1 ? chatid : Currentopenchatid,
                Receiver: Otheruserid,
                Timeofthemessage: Timeofthemessage,
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
              console.log("insert successful");
              if (Currentopenchatid == -1) {
                Messageisin(chatid);
              }
            })
            .catch((e) => {
              setmessages((messages: any[]) =>
                messages.map((value) => {
                  if (
                    value.Content + value.created_at ==
                      String(contentval) + Timeofthemessage &&
                    value.Pending
                  ) {
                    return {
                      Error: true,
                      Sender: uuid,
                      chatId: Currentopenchatid,
                      created_at: Timeofthemessage,
                      Content: contentval,
                    };
                  } else {
                    console.log("same", value);
                    return value;
                  }
                })
              );
              console.log(e + " Error inserting private message");
            });
        }

        insertmessage();
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
              Timeofthemessage: Timeofthemessage,
              senderid: uuid,
              accessToken: (
                await supabase.auth.getSession()
              ).data.session?.access_token,
            }),
          }
        )
          .then((res) => {
            if (!res.ok) {
              throw Error("Something Went Wrong" + String(res));
            }
            console.log(res + "Response Inseting global message");
          })
          .catch((e) => {
            setmessages((messages: any[]) =>
              messages.map((value) => {
                if (
                  value.Content + value.created_at ==
                    String(contentval) + Timeofthemessage &&
                  value.Pending
                ) {
                  return {
                    Error: true,
                    Sender: uuid,
                    chatId: Currentopenchatid,
                    created_at: Timeofthemessage,
                    Content: contentval,
                  };
                } else {
                  console.log("same", value);
                  return value;
                }
              })
            );

            console.log(e + " Error Inserting global message");
          });
      }
    } else if (File) {
      SetFile(undefined);
      const fileToBase64 = (file: File) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(String(reader.result).split(",")[1]);
          reader.onerror = (error) => reject(error);
        });
      let fileBase64: any = await fileToBase64(File);
      try {
        let sendFileres = await fetch(
          "https://chat-app-react-server-qizz.onrender.com/UploadFile",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              File: fileBase64,
              uuid: uuid,
              Timeofthemessage: Timeofthemessage,
              accessToken: (
                await supabase.auth.getSession()
              ).data.session?.access_token,
            }),
          }
        );

        if (!sendFileres.ok)
          throw new Error(`HTTP error! Status: ${sendFileres.status}`); // Throw an error with the status code
        let Url = (await sendFileres.json()).publicUrl;
        console.log(Url);

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
                chatid = res?.[0].chatId;
                insertmessage(chatid, Url); // Call insertmessage after chatid is set
              })
              .catch((e) => console.log(e + "Error while inserting a user"));
          } else {
            console.log("inserting ssnow");
            insertmessage(Currentopenchatid, Url); // Call insertmessage with Currentopenchatid
          }
        }
      } catch (e) {
        setmessages((messages: any[]) => {
          return messages.map((value) => {
            if (
              value.Content + value.created_at ==
              String(contentval) + Timeofthemessage
            ) {
              return {
                Error: true,
                Sender: uuid,
                chatId: Currentopenchatid,
                created_at: Timeofthemessage,
                FileURL: URL.createObjectURL(File),
                Content: contentval,
              };
            }
            return value;
          });
        });
        console.log(e + "Error while uploading file");
        if (String(e).includes("413")) alert("File size is too big");
      }

      async function insertmessage(
        chatId: string | number | null,
        Url: string
      ) {
        await fetch(
          "https://chat-app-react-server-qizz.onrender.com/Insertprivatemessages",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Content: contentval,
              chatId: chatId,
              Receiver: Otheruserid,
              Timeofthemessage: Timeofthemessage,
              senderid: uuid,
              accessToken: (
                await supabase.auth.getSession()
              ).data.session?.access_token,
              FileURL: Url,
            }),
          }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            console.log("insert successful");
            if (Currentopenchatid == -1) {
              Messageisin(chatId);
            }
          })
          .catch((e) => {
            setmessages((messages: any[]) =>
              messages.map((value) => {
                if (
                  value.Content + value.created_at ==
                    String(contentval) + Timeofthemessage &&
                  value.Pending
                ) {
                  return {
                    Error: true,
                    Sender: uuid,
                    chatId: chatId,
                    created_at: Timeofthemessage,
                    FileURL: Url,
                    Content: contentval,
                  };
                }
                return value;
              })
            );
            console.log(e + "Error while inserting a message");
          });
      }
      clearFileInput();
    } else if (Audio) {
      const fileToBase64 = (file: Blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(String(reader.result).split(",")[1]);
          reader.onerror = (error) => reject(error);
        });
      let fileBase64: any = await fileToBase64(Audio);
      setAudio(undefined);
      try {
        let sendFileres = await fetch(
          "https://chat-app-react-server-qizz.onrender.com/UploadAudio",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Audio: fileBase64,
              uuid: uuid,
              Timeofthemessage: Timeofthemessage,
              accessToken: (
                await supabase.auth.getSession()
              ).data.session?.access_token,
            }),
          }
        );

        if (!sendFileres.ok)
          throw new Error(`HTTP error! Status: ${sendFileres.status}`); // Throw an error with the status code

        let Url = (await sendFileres.json()).publicUrl;
        console.log(Url);
        console.log("this is the file sent from the server", Url);
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
                chatid = res;
              })
              .catch((e) => console.log(e + "Error while inserting a user"));
          }
          async function insertmessage() {
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
                  Timeofthemessage: Timeofthemessage,
                  senderid: uuid,
                  AudioFile: Url,
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
                console.log("insert successful");
                if (Currentopenchatid == -1) {
                  Messageisin(chatid);
                }
              })
              .catch((e) => {
                setmessages((messages: any[]) =>
                  messages.map((value) => {
                    if (
                      value.Content + value.created_at ==
                        String(contentval) + Timeofthemessage &&
                      value.Pending
                    ) {
                      return {
                        Error: true,
                        Sender: uuid,
                        chatId: Currentopenchatid,
                        created_at: Timeofthemessage,
                        Content: contentval,
                      };
                    } else {
                      console.log("same", value);
                      return value;
                    }
                  })
                );
                console.log(e + " Error inserting private message");
              });
          }
          insertmessage();
        }
      } catch (e) {
        console.log("error while uploading audio", e);
      }
    } else {
      alert("Write something");
    }

  }


  useEffect(() => {
    if (Currentopenchatid != -1) {
      if (!content?.length) {
        //not typing
        setistyping(false);
      } else {
        setistyping(true);
        window.onblur = () => {
          if (content.length) setistyping(false);
        };
        window.onfocus = () => {
          if (content.length) setistyping(true);
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
          payload: { user: username, id: uuid, istyping: isTyping },
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


  useEffect(() => {
    clearFileInput();
  }, [Currentopenchatid, SetFile]);


  useEffect(() => {
    let mediaRecorder: MediaRecorder;
    let stream: MediaStream;

    const startRecording = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        console.log(stream);
        setnowrecording(true);
        if (recordaudio) {
          console.log("You let the browser use your mic");
          mediaRecorder.start();
          mediaRecorder.ondataavailable = (e) => {
            console.log(e.data);
            const audioBlob = new Blob([e.data], { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log(audioUrl);

            setAudio(audioBlob);
          };
          mediaRecorder.onstop = () => {
            console.log("Stopped recording");
          };
        } else {
          if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
          }
        }
      } catch (err) {
        console.log(err);
        setrecordaudio(false);
        setnowrecording(false);
        alert("Enable your mic");
      }
    };

    if (recordaudio) {
      startRecording();
    }

    return () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [recordaudio]);


  useEffect(() => {
    setrecordaudio(false);
    setnowrecording(false);
    setAudio(undefined);
  }, [Currentopenchatid]);


  const clearFileInput = async () => {
    SetFile(undefined);
    if (fileuploadref.current) fileuploadref.current.value = "";
  };


  return (
    <>
      <div className={`relative ${File ? "  min-h-20" : "translate-y-[300%]"}`}>
        <img
          className="w-10 h-10 absolute top-0 right-0 cursor-pointer"
          src={xicon}
          alt="X"
          onClick={clearFileInput}
        />
        {File && 
        <img
        className="w-fit max-h-full mx-auto"
        src={URL.createObjectURL(File)}
      />}
      </div>

      <div
        id="ChatInput"
        className="relative gap-3 transition-all  bg-Main flex items-center justify-end  h-[10%]  w-full content-center px-5 "
      >
        {contentisfull && (
          <div className=" absolute w-32 pointer-events-none bg-Main text-MainText text-center p-1 rounded-lg  top-[-120%] right-6 z-20">
            You can't have over 300 characters in here
          </div>
        )}
        {!nowrecording ? (
          !Audio ? (
            <div className="relative w-full">
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
                className={`w-full shadow-[-5px_5px_15px_1px_rgba(0,0,0,0.589)] transition-all placeholder:text-Main rounded-xl p-4 focus:!ring-4 focus:p-3 bg-MainText text-Main ${
                  !contentisfull ? "focus:ring-Secondary" : "focus:ring-red-500"
                } focus:outline-none`}
              />
              <p className="absolute text-Main top-0 right-[1%] bottom-0">
                {(content && content.length) || 0}/300
              </p>
            </div>
          ) : (
            <div className={`relative flex items-center justify-center`}>
              <img
                className="w-10 h-10  cursor-pointer"
                src={xicon}
                alt="X"
                onClick={() => {
                  setAudio(undefined);
                  setrecordaudio(false);
                }}
              />
              {Audio && (
                <audio
                  className={`${Audio ? "block" : "hidden"}`}
                  controls
                  src={Audio && URL.createObjectURL(Audio)}
                />
              )}
            </div>
          )
        ) : (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            Recording
          </motion.div>
        )}

        <div className="justify-center flex items-center gap-2 ">
          {Currentopenchatid != "Global" && (
            <div className="flex items-center gap-3">
              {!nowrecording && !Audio && (
                <div className="h-full w-12  cursor-pointer">
                  <label htmlFor="fileupload">
                    <img
                      src={fileupload}
                      className={` cursor-pointer ${
                        !lightmode ? "invert" : ""
                      }`}
                      alt="Upload File"
                    />
                  </label>
                  <input
                    ref={fileuploadref}
                    type="file"
                    id="fileupload"
                    accept="image/png, image/jpeg, image/jpg"
                    className="h-full w-12 hidden"
                    onChange={(e) => SetFile(e.target.files?.[0])}
                  />
                </div>
              )}

              <div className="h-full w-12 ">
                {!nowrecording ? (
                  <img
                    src={microphoneImage}
                    className="cursor-pointer"
                    alt="Mic"
                    onClick={() => setrecordaudio(true)}
                  />
                ) : (
                  <motion.img
                    animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    src={rec}
                    className=""
                    alt="Mic"
                  />
                )}
              </div>
            </div>
          )}
          <button
            onClick={() => {
              if (recordaudio) setrecordaudio(false);
              if (nowrecording) setnowrecording(false);
              else SetData();
            }}
            className={`w-[5%] min-w-fit hover:bg-actionColor hover:text-black text-white transition-all duration-500 bg-Secondary rounded-full p-4`}
          >
            {!nowrecording ? (File ? "Upload" : "Send") : "Finish"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatInput;
