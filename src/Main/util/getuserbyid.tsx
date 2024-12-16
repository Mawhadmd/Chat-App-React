
import { supabase } from "../Supabase";
const getCookie = (key: string) => {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((row) => row.startsWith(`${key}=`));


  return cookie ? cookie.slice(cookie.indexOf("=")+1) : null;
};
export async function getuserbyid(id: string) {
  // Check cache for the user data

  let cache = getCookie(id);
  if (cache) {
    const cachedData = JSON.parse(cache);
   
    return cachedData;
  }

  // Fetch user data from the server
  let res = (
    await fetch("https://chat-app-react-server-qizz.onrender.com/getuserbyid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id,
        accessToken: (
          await supabase.auth.getSession()
        ).data.session?.access_token,
      }),
    }).then((res) => res.json())
  ).data.user;
  let requireddata = {
    "data": {
      "user": {
        "id": res.id,
        "user_metadata": {
          "name": res.user_metadata.name,
          "avatar_url": res.user_metadata.avatar_url || res.user_metadata.picture,
          
        },
      },
    },
  };

  const expirationTime = new Date();
  expirationTime.setTime(expirationTime.getTime() + 6 * 60 * 60 * 1000); // 6 hours in milliseconds

  document.cookie = `${id}=${JSON.stringify(requireddata)}; expires=${expirationTime.toUTCString()}; `;

  // Return only the specific fields
  return requireddata;
}
