import PropTypes from 'prop-types';
import { useState } from 'react';
import { formatEther, parseEther } from 'viem';
import { writeContract, waitForTransaction } from '@wagmi/core';
import { nftAuctionAbi } from '../contract';
import LoadingAlert from './alerts/LoadingAlert';
import ErrorAlert from './alerts/ErrorAlert';

export default function BidModal({nft}) {
  console.log(nft);
  // Set the loading state to display a loading indicator when the product is being bought
  const [loading, setLoading] = useState(false);
  // Set loading text to display a loading indicator when the product is being bought
  const [loadingText, setLoadingText] = useState("");
  // Set the error state to display an error message when the funds are not withdrawn
  const [error, setError] = useState(false);
  // Set the error text to display an error message when the funds are not withdrawn
  const [errorText, setErrorText] = useState("");
  // Set the show state to display the modal
  const [show, setShow] = useState(false);
  // Set the bid state to store the bid amount
  const [bid, setBid] = useState(0);

  // Function to place a bid on an auction
  const handleBid = async (e) => {
    e.preventDefault();
    // Set the loading state to display a loading indicator when the product is being bought
    setLoading(true);
    // Set loading text to display a loading indicator when the product is being bought
    setLoadingText(`Placing bid on ${nft.name}...`);
    
    try {
      // Check if valid bid is placed
      if(bid <= 0 || parseEther(bid) <= nft.currentBid || parseEther(bid) <= nft.price) {
        throw new Error("Invalid bid placed");
      }
      const tx = await writeContract({
        address: nft.data,
        abi: nftAuctionAbi,
        functionName: 'placeBid',
        value: parseEther(bid),
      })
  
      await waitForTransaction(tx);
  
    } catch (error) {
      setError(true);
      setErrorText(error.message);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  }
  return (
    <>
      {loading && <LoadingAlert message={loadingText} />}
      {error && <ErrorAlert 
        message={errorText}
        setError={(error) => {
          setError(error.error)
        }} />}
      <button
        className="bg-blue-600 capitalize text-white w-full py-2"
        disabled={loading}
        onClick={() => setShow(true)}
      >
        Place bid
      </button>
      {show &&
      <div className="border flex items-center justify-center w-full h-screen fixed top-0 left-0 bg-black/30 z-10" id="bidModal">
        <div className="border p-4 rounded-md bg-slate-50 w-400">
          <h2 className="text-center text-2xl">Place bid</h2>
          <p>Cuurent bid: {formatEther(nft.currentBid)}</p>
          <form>
            <div className="mb-3 w-full">
              <input
                step={0.01}
                type="number"
                className="border w-full h-10 mt-4 rounded px-4"
                id="bid"
                onChange={(e) => setBid(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <button
                type="submit"
                className="bg-blue-600 capitalize text-white w-full py-2"
                onClick={handleBid}
              >
                Place Bid
              </button>
              <button
                type="submit"
                className="text-blue-600 capitalize border border-blue-600 bg-text-white w-full py-2"
                onClick={() => setShow(false)}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
      }
    </>
  )
}

BidModal.propTypes = {
  nft: PropTypes.object.isRequired,
}