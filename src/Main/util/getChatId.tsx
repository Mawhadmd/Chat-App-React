import { supabase } from "../Supabase";

const getChatId = async (userId: string, uuid: string, setOtheruserid: any, setCurrentopenchatid: any) => {
    if(uuid == userId){
        alert('You can\'t talk to yourself')
        return}

    try {
      const { data, error } = await supabase
        .from("Contacts")
        .select("chatId")
        .or(`and(User1.eq.${userId},User2.eq.${uuid}),and(User2.eq.${userId},User1.eq.${uuid})`)
        .limit(1);
      console.log(data,error,"For gettingchatid")
      if (error) throw error;
      setOtheruserid(userId);
      if (data && data[0] && data.length != 0)
        setCurrentopenchatid(data[0].chatId);
      else setCurrentopenchatid(-1);
    } catch (error) {
      console.error("Error getting chat ID:", error);
      alert(
        "Couldn't get the chat. Please try again later or contact support."
      );
    }
  };

  export default getChatId