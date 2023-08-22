import { useState, useEffect } from 'react';
import { readContract } from '@wagmi/core';
import { useBalance, useAccount } from 'wagmi';
import { nftMarketplaceAddress, nftMarketplaceAbi, nftListingAbi } from "../contract";
import Nft from "./Nft";
import LoadingAlert from './alerts/LoadingAlert';
import ErrorAlert from './alerts/ErrorAlert';
import { nftDetail } from '../utils/minter';

export default function NftList() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState('');
  // const [balance, setBalance] = useState(0);
  const { address } = useAccount();

  const { data } = useBalance({
    address,
    watch: true
  })

  // console.log(balance);

  const getNfts = async() => {
    // Array to store the products
    const nftArray = [];
    // Set the loading state to display a loading indicator when the products are being fetched
    setLoading(true);
    try {
      // Get the number of products in the marketplace
      const nftLength = await readContract({
        address: nftMarketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: 'NftIdCounter',
      });

      // Loop through the products and get the product details
      for (let i = 0; i < Number(nftLength); i++) {
        const data = await readContract({
          address: nftMarketplaceAddress,
          abi: nftMarketplaceAbi,
          functionName: 'readNft',
          args: [i],
        });
        // Get the product details
        const nftData = await nftDetail(i, nftListingAbi, data);
        // Add the product to the products array
        nftArray.push(nftData);
      }
      // Set the products array in the local state
      setNfts(nftArray);
    } catch (error) {
      setTimeout(() => {
        setError(true);
        setErrorText(error.message);
      }, 3000);
      console.log(error);
    } finally {
      // Set the loading state to false when the products have been fetched
      setLoading(false);
    }
  }

  useEffect(() => {
    // Call the getNfts function to fetch the products when the component is mounted
    getNfts();
  }, [data])

  return (
    <>
      {error &&
        <ErrorAlert
          message={errorText}
          setError={(error) => {
            setError(error.error)
            console.log(error)
          }}
        />
      }
      
      <div className="flex flex-wrap gap-x-12 gap-y-8 items-center justify-center py-8">
        {loading ? (
          <LoadingAlert message="Loading Nfts..." />
        ):(
          <>
            {nfts.length < 1 ? (
              <p className="text-2xl">No Nfts currently available</p>
            ):(
              nfts.map((nft) => (
                <Nft key={Number(nft.tokenId)} nft={nft} />
              ))
            )}
          </>
        )}
      </div>  
    </>
  )
}