export const getCookie = (key: string) => {
    const cookies = document.cookie.split("; ");
    const cookie = cookies.find((row) => row.startsWith(`${key}=`));
    return cookie ? cookie.slice(cookie.indexOf("=")+1) : null;
  };