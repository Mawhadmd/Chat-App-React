import express from "express";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
dotenv.config();
dotenv.config({ path: `.env.local`, override: true });
const app = express();
app.use((req, res, next) => {
  const allowedOrigin = "http://localhost:3001";
  console.log(req.headers.origin, 'Accessed');
  // if (req.headers.origin !== allowedOrigin) {
  //   return res.status(403).send('Forbidden');
  // }
  next();
});
app.use(express.json());
app.use(cors({ origin: "http://localhost:3001" }));

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_KEY || "" // Service Role Key
);

app.post("/Insertglobalmessages", async (req, res) => {
  const { contents, senderid } = req.body;
  console.log(JSON.stringify(req.body));
  console.log(JSON.stringify(req.baseUrl));
  console.log("Insert Message global");
  var { data, error } = await supabase
    .from("Messages")
    .insert([
      {
        Sender: senderid,
        Content: contents,
      },
    ])
    .select();

  console.log(data, error);

  if (data) return res.status(201).send("Insert successful");
  else return res.status(404).json({ message: "Bad Request", Error: error });
});

app.post("/Insertprivatemessages", async (req, res) => {
  console.log(JSON.stringify(req.body));
  const { Content, chatId, Receiver, senderid } = req.body;
  console.log("Insert message private");
  var { data, error } = await supabase
    .from("PrivateMessages")
    .insert([
      {
        Content: Content,
        chatId: chatId,
        Receiver: Receiver,
        Sender: senderid,
      },
    ])
    .select();

  console.log(data, error);

  if (data) return res.status(201).send("Insert successful");
  else return res.status(404).json("Bad Request" + error);
});

app.post("/insertuser", async (req, res) => {
  const { uuid, Otheruserid } = req.body;
  console.log("Insert user");
  var { data, error } = await supabase
    .from("Contacts")
    .insert([
      {
        User1: uuid,
        User2: Otheruserid,
      },
    ])
    .select();
  console.log(data, error);

  if (data) return res.status(201).json(data);
  else return res.status(404).json("Bad Request" + error);
});
app.post("/insertlastseen", async (req, res) => {
  const { mode, uuid } = req.body;
  console.log("Insert last seen");
  console.log(req.body);
  if (mode == "insert") {
    var ressupa = await supabase
      .from("Users")
      .insert([{ LastSeen: `${Date.now()}`, id: uuid }]).select()
  } else if (mode == "update") {
    var ressupa = await supabase
      .from("Users")
      .update([{ LastSeen: `${Date.now()}` }])
      .eq("id", uuid).select();
  } else return res.status(400).send("mode not valid");
  console.log(ressupa);
  if (ressupa.data) return res.status(201).json(ressupa.data);
  else return res.status(404).json(ressupa.error);
});

app.post("/getuserbyid", async (req, res) => {
const {id} = req.body
console.log("Getting user by id");
let User = await supabase.auth.admin.getUserById(id)
if (User){
  return res.status(200).json(User)
}else{
  return res.status(400).json("Need ID")
}
});
app.post("/getuserslist", async (req, res) => {
let Users = await supabase.auth.admin.listUsers()
console.log("Getting user list");
if (Users){
  return res.status(200).json(Users)
}else{
  return res.status(400).json("Need ID")
}
});
app.listen(process.env.PORT, () => {
  console.log("Listening on", process.env.PORT);
});
