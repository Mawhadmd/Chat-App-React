// Time in the db is formated as follow: 2024-11-28 16:39:49.944192+00
function convertTime(time:string){ 

  if(!!!time)
    return 'loading'
    let isAm: boolean;
    Number(time.slice(11, 13)) > 12 ? (isAm = false) : (isAm = true);
    let timeconverted =
      Number(time.slice(11, 13)) > 12
        ? Number(time.slice(11, 13))-12
        : Number(time.slice(11, 13))+12;

    return timeconverted + time.slice(13, 19) + (isAm ? " am" : " pm");
}

export default convertTime