import { supabase } from "../Supabase";

const getChatId = async (
  userId: string,
  uuid: string,
  setOtheruserid: any = undefined,
  setCurrentopenchatid: any = undefined
) => {
  console.log('getting chat id')
  if (uuid == userId) {
    alert("You can't talk to yourself");
    return;
  }
  if (!(setOtheruserid && setCurrentopenchatid)) {
    const { data, error } = await supabase
      .from("Contacts")
      .select("chatId")
      .or(
        `and(User1.eq.${userId},User2.eq.${uuid}),and(User2.eq.${userId},User1.eq.${uuid})`
      )
      .limit(1);
      if(error){
        console.log('Error while getting chatid')
      }
    if (data && data?.length > 0) return data?.[0].chatId;
    else return -1;
  }

  try {
    const { data, error } = await supabase
      .from("Contacts")
      .select("chatId")
      .or(
        `and(User1.eq.${userId},User2.eq.${uuid}),and(User2.eq.${userId},User1.eq.${uuid})`
      )
      .limit(1);
    if (error) throw error;
    setOtheruserid(userId);
    if (data && data[0] && data.length != 0)
      setCurrentopenchatid(data[0].chatId);
    else setCurrentopenchatid(-1);
  } catch (error) {
    console.error("Error getting chat ID:", error);
    alert("Couldn't get the chat. Please try again later or contact support.");
  }
};

export default getChatId;
