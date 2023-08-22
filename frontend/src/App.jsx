// import Nft from './components/Nft';
import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import NftList from './components/NftList';

function App() {
  const [searchAddress, setSearchAddress] = useState('');
  return (
    <>
      <div>
        <Navbar setAddress={(e) => {
            setSearchAddress(e)
            console.log(searchAddress);
          }}
        />
        <NftList search={searchAddress} />
      </div>
    </>
  )
}

export default App
