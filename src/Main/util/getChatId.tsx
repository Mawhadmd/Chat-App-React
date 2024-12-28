import { supabase } from "../Supabase";
import { getCookie } from "./getCookie";
const getChatId = async (
  userId: string,
  uuid: string,
  setOtheruserid: any = undefined,
  setCurrentopenchatid: any = undefined
) => {
  let encodings = uuid + userId;
  let cache = getCookie(encodings);
  if (cache) {
    let chatidAndOtherUser = cache.split("---");
    console.log(chatidAndOtherUser);
    let chatid = chatidAndOtherUser[0];
    let otherUser = chatidAndOtherUser[1];
    if (setOtheruserid && setCurrentopenchatid) {
      setCurrentopenchatid(chatid);
      setOtheruserid(otherUser);
    }
    return chatid;
  }

  if (uuid == userId) {
    alert("You can't talk to yourself");
    return;
  }
  console.log("getting chat id");
  try {
    const { data, error } = await supabase
      .from("Contacts")
      .select("chatId")
      .or(
        `and(User1.eq.${userId},User2.eq.${uuid}),and(User2.eq.${userId},User1.eq.${uuid})`
      )
      .limit(1);
    document.cookie = `${encodings}=${
      data?.[0].chatId + "---" + userId
    }; expires=${new Date(
      new Date().getTime() + 720 * 60 * 60 * 1000
    ).toUTCString()}; `;
    console.log(data);
    if (error) {
      console.log("Error while getting chatid");
      throw error;
    }

    if (!(setOtheruserid && setCurrentopenchatid)) {
      // If the function is called from somewhere else without those to set functions it will just return the chatid
      if (data && data?.length > 0) {
        return data?.[0].chatId;
      } else return -1;
    }

    if (data && data[0] && data.length != 0) {
      //this will set the chatid and the other user id
      setCurrentopenchatid(data[0].chatId);
      setOtheruserid(userId);
    } else setCurrentopenchatid(-1);
  } catch (error) {
    console.error("Error getting chat ID:", error);
    alert("Couldn't get the chat. Please try again later or contact support.");
  }
};

export default getChatId;
