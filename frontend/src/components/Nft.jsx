import { useState } from 'react';
import { fetchBalance, getAccount, waitForTransaction, writeContract } from '@wagmi/core'
import PropTypes from 'prop-types';
import { formatEther } from 'viem';
import { buyNft } from '../utils/minter';
import { nftListingAbi, nftAuctionAbi } from '../contract';
import LoadingAlert from './alerts/LoadingAlert';
import ErrorAlert from './alerts/ErrorAlert';
import SuccessAlert from './alerts/SuccessAlert';
import BidModal from './BidModal';

export default function Nft({ nft, auction }) {
  // Get the time left for the auction to end
  const timeLeft = Math.round(((Number(nft.endsAt) * 1000) - Date.now()) / 1000 / 60);
  // Set the loading state to display a loading indicator when the product is being bought
  const [loading, setLoading] = useState(false);
  // Set loading text to display a loading indicator when the product is being bought
  const [loadingText, setLoadingText] = useState("");
  // Set the success state to display a success message when the funds are withdrawn
  const [success, setSuccess] = useState(false);
  // Set the error state to display an error message when the funds are not withdrawn
  const [error, setError] = useState(false);
  // Set the error text to display an error message when the funds are not withdrawn
  const [errorText, setErrorText] = useState("");
  // Set the success text to display a success message when the funds are withdrawn
  const [successText, setSuccessText] = useState("");
  // Get the user's account from the context
  const { address } = getAccount();


  // Get the user's account from the context
  const handleBuy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingText(`Buying ${nft.name}...`);

    try {
      // Get the user's balance
      const { value: balance } = await fetchBalance({
        address,
      })

      // Check if the user's balance is greater than the product price
      if(balance > nft.price) {
        // Buy the product by calling the buyProduct function on the marketplace contract
        await buyNft(nft.sellerNft, nftListingAbi, nft.price);
      } 
        // Throw an error if the user's balance is less than the product price
      else {
        throw new Error("Insufficient balance");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  }

  // Function to withdraw funds from nft sales
  const handleWithdraw = async (e) => {
    e.preventDefault();
    // Set the loading state to display a loading indicator when the product is being bought
    setLoading(true);
    // Set loading text to display a loading indicator when the product is being bought
    setLoadingText(`Withdrawing ${nft.name} funds...`);

    // Try to withdraw funds from nft sales
    try {
      // Get the contract balance
      const { formatted: contractBalance } = await fetchBalance({
        address: nft.data,
      })

      // Check if the contract balance is greater than 0
      if(contractBalance <= 0) throw new Error("No funds to withdraw");
      // Withdraw funds from nft sales by calling the withdraw function on the marketplace contract
      const tx = await writeContract({
        address: nft.data,
        abi: nftAuctionAbi,
        functionName: 'withdraw',
      });
      // Wait for the transaction to be confirmed
      await waitForTransaction(tx);
      // Set the success state to display a success message when the funds are withdrawn
      setTimeout(() => {
        setSuccess(true);
        setSuccessText("Funds withdrawn successfully");
      }, 3000);

    } catch(error) {
      console.log(error);
      // Set the error state to display an error message when the funds are not withdrawn
      setTimeout(() => {
        setError(true);
        setErrorText(error.message);
      }, 2000);
    } finally {
      setSuccess(false);
      setError(false);
    }
    setLoading(false);
    setLoadingText("");
  }

  return (
    <>
      {loading && <LoadingAlert message={loadingText} />}
      {error && 
        <ErrorAlert 
          message={errorText} 
          setError={(error) => {
            setError(error.error)
            console.log(error)
          }}
        />
      }
      {success && <SuccessAlert message={successText} />}

      <div className="w-250 h-300 shadow-md border relative rounded-2xl overflow-hidden pt-2">
        <div className="image h-300">
          <img className="w-full h-full object-contain hover:scale-125 transition-all duration-300" src={nft.imageUrl} alt={nft.name} />
          {auction && (
            <>
            {timeLeft >= 1 ? (
              <span className="px-4 py-1 rounded-l-lg shadow-md absolute top-4 right-0 bg-blue-500 text-slate-50">
                {Math.round(((Number(nft.endsAt) * 1000) - Date.now()) / 1000 / 60)} min left
              </span>
            ):(
            <span className="px-4 py-1 rounded-l-lg shadow-md absolute top-4 right-0 bg-red-500 text-slate-50">
              Ended
            </span>
            )}
            </>
          )}
        </div>

        <div className="group content absolute bottom-0 left-0 w-full py-2 bg-white">
          <div className="header px-4">{nft.name}</div>
          <div className="meta px-4 pb-1">{formatEther(nft.price)} ETH</div>
          <div className="description px-4 pb-1">
            {nft.description.length > 20 ? (
              <span>{nft.description.substring(0, 20).padEnd(23, ".")}</span>
            ):(
              <span>{nft.description}</span>
            )}
          </div>
          <div className="btn absolute -bottom-12 group-hover:bottom-0 left-0 w-full transition-all duration-300">            
            {auction ? (
              <>
                {nft.seller !== address ? (
                  <BidModal nft={nft} />
                ):(
                  <button
                    className="bg-blue-600 cursor-pointer capitalize text-white w-full py-2"
                    disabled={loading}
                    onClick={handleWithdraw}
                  >
                    withdraw funds
                  </button>
                )}                
              </>
            ):(
              <>
                {nft.seller !== address && (
                  <button
                    className="bg-blue-600 cursor-pointer capitalize text-white w-full py-2"
                    disabled={loading}
                    onClick={handleBuy}
                  >
                    {loading ? loadingText: "buy now"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Nft.prototype = {
//   nft: PropTypes.object.isRequired
// }
Nft.propTypes = {
  nft: PropTypes.object.isRequired,
  auction: PropTypes.bool.isRequired,
}