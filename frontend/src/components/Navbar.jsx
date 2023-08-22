import PropTypes from "prop-types";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import AddNft from "./AddNftModal";

export default function Navbar({setAddress}) {
  const [searchAddress, setSearchAddress] = useState('');
  const { isConnected } = useAccount()
  return (
    <>
      <nav className="shadow-sm flex flex-wrap items-center justify-between px-12 py-4">
        <p className="text-2xl font-bold">OpenStack</p>
        <div className="overflow-hidden border border-slate-400 flex gap-4 items-center justify-between w-350 h-10 rounded-md">
          <input
            type="text"
            className="pl-2 h-full w-full outline-none"
            onChange={(e) => {
              setSearchAddress({address: e.target.value})
            }}
          />
          <img
            className="cursor-pointer w-5 hover:scale-125 transition-all duration-200 active:scale-100 mr-4" src="https://img.icons8.com/ios-filled/50/525050/search--v1.png"
            alt="search--v1"
            onClick = {() => {
              setAddress(searchAddress);
              console.log(searchAddress);
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <ConnectButton />
          {isConnected && (<AddNft />)}
        </div>
      </nav>
    </>
  )
}

Navbar.propTypes = {
  setAddress: PropTypes.object.isRequired,
};