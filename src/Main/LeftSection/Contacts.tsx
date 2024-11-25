import pfp from "../../assets/grayuserpfp.png";
const Contacts = () => {
  return (
    <>
      <div
        className="text-MainPinkishWhite   border-collapse 
w-full hover:z-10 mx-auto h-20 bg-MainBlack border-MainBlue/15
      border-spacing-2 border-[1px]  mb-[-1px] flex items-center 
      border-solid cursor-pointer hover:bg-white/20 transition-all"
      >
        <div>
          <img src={pfp} alt="Profile Picture" className="w-20 rounded-full" />
        </div>
        <div className="flex flex-col">
          <span>EL SESE</span>
          <span className="text-xs opacity-70">you: كسمك</span>
        </div>
      </div>
    </>
  );
};

export default Contacts;
