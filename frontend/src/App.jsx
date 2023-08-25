// import Nft from './components/Nft';
import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import NftList from './components/NftList';
import Cover from './components/Cover';
import { useAccount } from 'wagmi';

function App() {
  const { isConnected } = useAccount();

  const [searchAddress, setSearchAddress] = useState('');
  return (
    <>
      {isConnected ? (
      <div>
        <Navbar setAddress={(e) => {
            setSearchAddress(e)
            console.log(searchAddress);
          }}
        />
        <NftList search={searchAddress} />
      </div>
      ) : (
        <Cover />
      )}
    </>
  )
}

export default App
