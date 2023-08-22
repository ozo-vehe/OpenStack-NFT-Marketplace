import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { readContract } from '@wagmi/core';
import { nftListingAbi } from '../contract';
import LoadingAlert from './alerts/LoadingAlert';
import Nft from './Nft';

export default function SearchResult({ searchAddress, nfts }) {
  const [loading, setLoading] = useState(false);
  const [ownedNft, setOwnedNft] = useState([]);
  console.log(searchAddress)
  console.log(nfts)

  const handleOwner = async() => {
    setLoading(true);
    try {
      if(nfts) {
        const owned = [];

        for(let i = 0; i < nfts.length; i++) {
          const owner = await readContract({
            address: nfts[i].sellerNft,
            abi: nftListingAbi,
            functionName: 'ownerOf',
            args: [nfts[i].tokenId],
          });
          if(owner === searchAddress.address) {
            owned.push(nfts[i]);
          }
        }
        setOwnedNft(owned);
      }
    } catch (error) {
      console.log(error)      
    } finally {
      console.log("Finished")
      setLoading(false);
    }
  }

  useEffect(() => {
    handleOwner();
  }, [searchAddress])

  return (
    <>
      {/* {error &&
        <ErrorAlert
          message={errorText}
          setError={(error) => {
            setError(error.error)
            console.log(error)
          }}
        />
      } */}
      
      <div className="flex flex-wrap gap-x-12 gap-y-8 items-center justify-center py-8">
        {loading ? (
          <LoadingAlert message="Searching for Nfts..." />
        ):(
          <>
            {ownedNft.length < 1 ? (
              <p className="text-2xl">No Nfts currently owned</p>
            ):(
              ownedNft.map((nft) => (
                <Nft key={Number(nft.tokenId)} nft={nft} />
              ))
            )}
          </>
        )}
      </div>  
    </>
  )
}

SearchResult.propTypes = {
  searchAddress: PropTypes.string.isRequired,
  nfts: PropTypes.array.isRequired,
};