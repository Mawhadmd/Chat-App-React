import { getuserbyid } from "./getuserbyid";

export async function getname(id: string) {
  try {
    let res = await getuserbyid(id);
    let name = res.data.user?.user_metadata.name;
    return name;
  } catch (Error) {
    throw "Error 500, please reload or contact support" + Error;
  }
}
