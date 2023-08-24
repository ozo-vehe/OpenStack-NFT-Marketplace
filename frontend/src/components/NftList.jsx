import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { readContract } from '@wagmi/core';
import { useBalance, useAccount } from 'wagmi';
import { nftMarketplaceAddress, nftMarketplaceAbi, nftListingAbi, nftAuctionAbi } from "../contract";
import Nft from "./Nft";
import SearchResult from './SearchResult';
import LoadingAlert from './alerts/LoadingAlert';
import ErrorAlert from './alerts/ErrorAlert';
import { nftDetail } from '../utils/minter';

export default function NftList({search}) {
  console.log(search.address);
  const [nfts, setNfts] = useState([]);
  const [auctionNft, setAuctionNft] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAuction, setLoadingAuction] = useState(false);
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
          functionName: 'NftListings',
          args: [i],
        });
        console.log(data);
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

  const getAuctionNfts = async() => {
    // Array to store the auction products
    const auctionNftArray = [];
    // Set the loading state to display a loading indicator when the products are being fetched
    setLoadingAuction(true);
    try {
      // Get the number of products in the marketplace
      const nftLength = await readContract({
        address: nftMarketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: 'AuctionIdCounter',
      });

      // Loop through the products and get the product details
      for (let i = 0; i < Number(nftLength); i++) {
        const data = await readContract({
          address: nftMarketplaceAddress,
          abi: nftMarketplaceAbi,
          functionName: 'NftAuctions',
          args: [i],
        });
        console.log(data);
        // Get the product details
        const nftData = await nftDetail(i, nftAuctionAbi, data, true);
        // Add the product to the products array
        auctionNftArray.push(nftData);
      }
      // Set the auction products array in the local state
      setAuctionNft(auctionNftArray);
    } catch (error) {
      setTimeout(() => {
        setError(true);
        setErrorText(error.message);
      }, 3000);
      console.log(error);
    } finally {
      // Set the loading state to false when the products have been fetched
      setLoadingAuction(false);
    }
  }

  useEffect(() => {
    // Call the getNfts function to fetch the products when the component is mounted
    getNfts();
    // Call the getAuctionNfts function to fetch the products when the component is mounted
    getAuctionNfts();
  }, [data])

  return (
    <>
      {search.address !== "" && search.address !== undefined ? (
        <SearchResult nfts={[...nfts, ...auctionNft]} searchAddress={search} />
      ):(
      <>
        {error &&
          <ErrorAlert
            message={errorText}
            setError={(error) => {
              setError(error.error)
            }}
          />
        }
      
        <div className="flex flex-wrap gap-x-12 gap-y-8 items-center justify-center py-8">
          <h2 className="w-full text-3xl px-12 text-center font-bold">Nft Marketplace</h2>
          {loading ? (
            <LoadingAlert message="Loading Nfts..." />
          ):(
            <>
              {nfts.length < 1 ? (
                <p className="text-2xl">No Nfts currently available</p>
              ):(
                nfts.map((nft) => (
                  <Nft key={Number(nft.tokenId)} nft={nft} auction={false} />
                ))
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-8 items-center justify-center py-8">
          <h2 className="w-full text-3xl px-12 text-center font-bold">Auction</h2>
          {loadingAuction ? (
            <LoadingAlert message="Loading available auction Nfts..." />
          ):(
            <>
              {auctionNft.length < 1 ? (
                <p className="text-2xl">No Nfts currently available for auction</p>
              ):(
                auctionNft.map((nft) => (
                  <Nft key={Number(nft.tokenId)} nft={nft} auction={true} />
                ))
              )}
            </>
          )}
        </div>
      </>
      )}
    </>
  )
}

NftList.propTypes = {
  search: PropTypes.string.isRequired,
};