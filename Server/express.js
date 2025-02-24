import express from "express";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
dotenv.config();
dotenv.config({ path: `.env.local`, override: true });
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(
  cors({ origin: ["http://localhost:3001", "https://chatty001a.netlify.app"] })
);
var Usersids = new Map();
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_KEY || "" // Service Role Key
);
setInterval(() => {
  Usersids.clear();
}, 1000 * 60 * 60 * 24);
const validateTokenMiddleware = async (req, res, next) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is missing" });
  }
  try {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = data;
    next();
  } catch (err) {
    console.error("Token validation error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

app.use(validateTokenMiddleware);

app.post("/Insertglobalmessages", async (req, res) => {
  const { contents, senderid, Timeofthemessage } = req.body;
  var { data, error } = await supabase
    .from("Messages")
    .insert([
      {
        Sender: senderid,
        Content: contents,
        created_at: Timeofthemessage,
      },
    ])
    .select();

  if (data) return res.status(201).send("Insert successful");
  else return res.status(404).json({ message: "Bad Request", Error: error });
});
app.post("/UploadFile", async (req, res) => {
  const { File, uuid, Timeofthemessage } = req.body;
  console.log("here");
  let decodedFile = atob(File);
  const uint8Array = new Uint8Array(decodedFile.length);
  console.log(uint8Array);
  for (let i = 0; i < decodedFile.length; i++) {
    uint8Array[i] = decodedFile.charCodeAt(i);
  }
  const blob = new Blob([uint8Array], { type: "image/png" });

  try {
    const { data, error: e1 } = await supabase.storage
      .from("Media")
      .upload(`${uuid + Timeofthemessage}`, blob);

    if (e1) {
      console.error("Upload error:", e1);
      return res.status(400).json({ error: "Upload failed" });
    }

    const { data: urlData } = supabase.storage
      .from("Media")
      .getPublicUrl(data.path);

    return res.status(200).json(urlData);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/UploadAudio", async (req, res) => {
  const { Audio, uuid, Timeofthemessage } = req.body;
  console.log("here");
  let decodedFile = atob(Audio);

  const uint8Array = new Uint8Array(decodedFile.length);

  console.log(uint8Array);

  for (let i = 0; i < decodedFile.length; i++) {
    uint8Array[i] = decodedFile.charCodeAt(i);
  }

  const blob = new Blob([uint8Array], { type: "audio/wav" });

  try {
    const { data, error: e1 } = await supabase.storage
      .from("Audio")
      .upload(`${uuid + Timeofthemessage}`, blob);

    if (e1) {
      console.error("Upload error:", e1);
      return res.status(400).json({ error: "Upload failed" });
    }

    const { data: urlData } = supabase.storage
      .from("Audio")
      .getPublicUrl(data.path);

    return res.status(200).json(urlData);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/Insertprivatemessages", async (req, res) => {
  console.log(JSON.stringify(req.body));
  const {
    Content,
    chatId,
    FileURL,
    AudioFile,
    Receiver,
    senderid,
    Timeofthemessage: Timeofthemessage,
  } = req.body;
  console.log("Insert message private");
  var { data, error } = await supabase
    .from("PrivateMessages")
    .insert([
      {
        Content: Content,
        chatId: chatId,
        FileURL: FileURL,
        AudioFile: AudioFile,
        Receiver: Receiver,
        Sender: senderid,
        created_at: Timeofthemessage,
      },
    ])
    .select();

  if (data) return res.status(201).send("Insert successful");
  else return res.status(404).json("Bad Request" + error);
});

app.post("/insertuser", async (req, res) => {
  const { uuid, Otheruserid } = req.body;
  var { data, error } = await supabase
    .from("Contacts")
    .insert([
      {
        User1: uuid,
        User2: Otheruserid,
      },
    ])
    .select();

  if (data) return res.status(201).json(data);
  else return res.status(404).json("Bad Request" + error);
});
app.post("/upsertlastseen", async (req, res) => {
  const { uuid } = req.body;
  var ressupa = await supabase
    .from("Users")
    .upsert([{ LastSeen: `${Date.now()}`, id: uuid }])
    .select();
  if (ressupa.data) return res.status(201).json(ressupa.data);
  else return res.status(404).json(ressupa.error);
});

app.post("/getuserbyid", async (req, res) => {
  const { id } = req.body;
  if (Usersids.get(id)) {
    console.log("getting user by id exists", id);
    return res.status(200).json(Usersids.get(id));
  }
  console.log("getting user by id", id);
  let User = await supabase.auth.admin.getUserById(id);
  if (User) {
    Usersids.set(id, User);
    return res.status(202).json(User);
  } else {
    return res.status(400).json("Need ID");
  }
});
app.post("/getuserslist", async (req, res) => {
  let Users = await supabase.auth.admin.listUsers();
  if (Users) {
    return res.status(200).json(Users);
  } else {
    return res.status(400).json("Need ID");
  }
});
app.post("/messageisread", async (req, res) => {
  var { id } = req.body;
  if(id==null) return res.status(400).json("Need ID");
  console.log(id)
  console.log(id==null)
  console.log(id[0]==null)
  var { data, error } = await supabase
  .from("PrivateMessages")
  .update({ ReadAt: new Date().getTime() })
  .is('ReadAt', null)
  .in("id", id).select()
  console.log(data,error)
  if (data) return res.status(201).json(data);
  else return res.status(404).json("Bad Request" + error);
});
app.listen(process.env.PORT, () => {
  console.log("Listening on", process.env.PORT)
});
