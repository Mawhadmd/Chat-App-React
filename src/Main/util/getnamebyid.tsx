import { supabase } from "../Supabase";

  export async function getname(id: string) {
   try{
    let name = await (
      await fetch("https://chat-app-react-server-qizz.onrender.com/getuserbyid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, accessToken: (await supabase.auth.getSession()).data.session?.access_token}),
      }).then((res) => res.json())
    ).data.user?.user_metadata.name;
    return name
   }catch(Error){
    throw("Error 500, please reload or contact support" + Error)
   }
  }