import React from "react";

export function Header({ myData, comparerData, clearDataCallBack }) {
  const handleDataClear = () => {
    clearDataCallBack();
  };

  return (
    <header className="flex min-h-[60px]  bg-opacity-[10%] rounded-[50px] text-[18px] px-9 justify-between text-white items-center">
      <div className="logo"> </div>

      <ul className="flex gap-9">
        {myData && comparerData ? (
          <li onClick={handleDataClear} className="cursor-pointer bg-black py-2 px-5 rounded-lg">
          Go to Home
          </li>
        ) : (
          <li className="cursor-not-allowed bg-black py-2 px-5 rounded-xl">Go to home</li>
        )}
        {/* TODO: add about */}
        
      </ul>
    </header>
  );
}
