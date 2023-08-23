// Importing the dependencies
import { useState } from "react";
import { uploadToIPFS } from "../utils/minter";
import { nftMarketplaceAddress, nftMarketplaceAbi } from "../contract";
import { writeContract, waitForTransaction } from '@wagmi/core'
import { parseEther } from "viem";

// Define the AddProductModal component
export default function AddNft() {
  // The visible state is used to toggle the visibility of the modal
  const [visible, setVisible] = useState(false);
  // Loading state is used to display a loading indicator when the product is being created
  const [loading, setLoading] = useState(false);
  // Set auction state
  const [auction, setAuction] = useState(null);
  // Set auction duration state
  const [auctionDuration, setAuctionDuration] = useState(null);
  // The following states are used to store the values of the input fields
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [productImage, setProductImage] = useState("");
  const [productDescription, setProductDescription] = useState("");

  // Check if all the input fields are filled
  const isComplete = productName && productPrice && productImage && productDescription

  // Check if all the input fields are empty strings
  const isEmpty = productName.trim() == "" || productPrice == 0 || productImage == "" || productDescription.trim() == "";

  // Clear the input fields after the product is added to the marketplace
  const clearForm = () => {
    setProductName("");
    setProductPrice(0);
    setProductImage("");
    setProductDescription("");
  };

  // Define function that handles the creation of a product, if a user submits the product form
  const addProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(auctionDuration);

    try {
      // Check if all the input fields are filled
      if(!isComplete && isEmpty) throw new Error("Please fill all fields");
      // Upload the product image to IPFS and get the metadata from IPFS 
      const metadata = await uploadToIPFS(productImage, productName, productDescription);
      
      // Define the transaction variable
      let tx;
      // Check if the product is an auction
      if(auction === "true") {
        tx = await writeContract({
          address: nftMarketplaceAddress,
          abi: nftMarketplaceAbi,
          functionName: 'createAuctionNft',
          args: [metadata, parseEther(productPrice), parseInt(auctionDuration * 60)],
          value: parseEther('0.01'),
        })
      }
      // If the product is not an auction
      else {
        // Create the product by calling the writeProduct function on the marketplace contract
        tx = await writeContract({
          address: nftMarketplaceAddress,
          abi: nftMarketplaceAbi,
          functionName: 'createNft',
          args: [metadata, parseEther(productPrice)],
          value: parseEther('0.01'),
        })
      }

      // Wait for the transaction to be mined
      await waitForTransaction(tx);

      console.log({
        productName,
        productPrice,
        productImage,
        productDescription,
      })
    } catch (e) {
      console.log({ e });
      // Clear the loading state after the product is added to the marketplace
    } finally {
      setLoading(false);
      clearForm();
      setVisible(false);
    }
  };

  // Define the JSX that will be rendered
  return (
    <div className="flex flex-row w-fit justify-between items-center">
      <div>
        {/* Add Product Button that opens the modal */}
        <button
          className="px-5 py-2 rounded-lg shadow-lg shadow-gray-100 active:shadow-sm hover:scale-105 transition-all duration-200 active:scale-100"
          onClick={() => setVisible(true)}
        >
          Upload Nft
        </button>
        {/* Modal */}
        {visible && (
          <div
            className="absolute z-40 overflow-y-auto -top-4 w-full left-0"
            id="modal"
          >
            {/* Form with input fields for the product, that triggers the addProduct function on submit */}
            <form onSubmit={addProduct}>
              <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity">
                  <div className="absolute inset-0 bg-gray-900 opacity-75" />
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
                  &#8203;
                </span>
                <div
                  className="inline-block align-center bg-white rounded-lg overflow-hidden text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="modal-headline"
                >
                  <h2 className="text-center pt-4 text-3xl font-bold underline uppercase">Add Your Nft</h2>
                  {/* Input fields for the product */}
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <label>Product Name</label>
                    <input
                      onChange={(e) => {
                        setProductName(e.target.value);
                      }}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Product Image</label>
                    <input
                      onChange={(e) => {
                        setProductImage(e.target.files[0]);
                      }}
                      required
                      type="file"
                      accept="image/*"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Product Description</label>
                    <input
                      onChange={(e) => {
                        setProductDescription(e.target.value);
                      }}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />
                    <label>For Auction</label>
                    <select
                      onChange={(e) => {
                        setAuction(e.target.value);
                        console.log(auction)
                      }}
                      required
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                    {auction === "true" ? (
                      <>
                        <label>Auction Price (ETH)</label>
                        <input
                          onChange={(e) => {
                            setProductPrice(e.target.value);
                          }}
                          required
                          type="number"
                          step={0.001}
                          className="w-full bg-gray-100 p-2 mt-2 mb-3"
                        />

                        <label>Auction Duration (minutes)</label>
                        <input
                          onChange={(e) => {
                            setAuctionDuration(e.target.value);
                          }}
                          required
                          type="number"
                          step={1}
                          className="w-full bg-gray-100 p-2 mt-2 mb-3"
                        />
                      </>
                    ):(
                      <>
                        <label>Product Price (ETH)</label>
                        <input
                          onChange={(e) => {
                            setProductPrice(e.target.value);
                          }}
                          required
                          type="number"
                          step={0.001}
                          className="w-full bg-gray-100 p-2 mt-2 mb-3"
                        />
                      </>
                    )}
                  </div>
                  {/* Button to close the modal */}
                  <div className="bg-gray-200 px-4 py-3 text-right">
                    <button
                      type="button"
                      className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                      onClick={() => setVisible(false)}
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>
                    {/* Button to add the product to the marketplace */}
                    <button
                      type="submit"
                      disabled={!!loading}
                      className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
                    >
                      { loading ? (
                        <span>Adding Nft, please wait...</span>
                      ):(
                        <span>Add Nft</span>)}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}