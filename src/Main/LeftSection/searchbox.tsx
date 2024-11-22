import React from 'react';

const Searchbox = () => {
    return (
        <div>
               <div className="w-full h-20 bg-Main flex items-center justify-center">
        <input
          type="text"
          className="p-2 w-11/12 mx-auto h-10 placeholder:p-1 placeholder:text-black rounded-lg"
          placeholder="Search For a contact By ID"
        />
      </div>
        </div>
    );
}

export default Searchbox;
