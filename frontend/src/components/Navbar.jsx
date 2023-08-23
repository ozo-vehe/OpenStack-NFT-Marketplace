import PropTypes from "prop-types";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import AddNft from "./AddNftModal";
import ErrorAlert from "./alerts/ErrorAlert";

export default function Navbar({setAddress}) {
  const [searchAddress, setSearchAddress] = useState('');
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const { isConnected } = useAccount()

  const isValid = (address) => {
    if(address.length === 42 && address.startsWith('0x') || address == "") return true;
    else return false;
  }

  return (
    <>
      {error && <ErrorAlert message={errorText} setError={(error) => setError(error.error)} />}

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
              console.log(searchAddress.address);
              console.log(isValid(searchAddress.address));
              if(isValid(searchAddress.address)) {
                setAddress(searchAddress);
              }
              else {
                setError(true);
                setErrorText("Invalid Address");
              }
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