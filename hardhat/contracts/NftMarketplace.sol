// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NftListing.sol";

contract NftMarketplace is Ownable {
    // Counter for all NFTs in the marketplace
    uint256 public NftIdCounter = 0;

    // Variable to hold the listing fee
    uint256 listingFee = 0.01 ether;

    // Struct to hold all created nfts
    struct Nft {
        address seller;
        uint256 tokenId;
        uint256 price;
        NftListing sellerNft;
    }

    // Mapping to hold all the NFTs created
    mapping(uint256 => Nft) public NftListings;

    // Function to create NFTs
    function createNft(string memory _uri, uint256 _price) payable public {
        // Check if the price is greater than the listingFee
        require(msg.value >= listingFee, "Invalid minting price");
        // Create a new NFT
        NftListing newNft = new NftListing(NftIdCounter, msg.sender, _price);
        // Mint the NFT
        newNft.safeMint(_uri);

        // Add the NFT to the NftListings mapping
        NftListings[NftIdCounter] = Nft(
            payable(msg.sender),
            NftIdCounter,
            _price,
            newNft
        );
        // Increment the NftIdCounter
        NftIdCounter++;
    }

    // Function to read NFTs
    function readNft(uint256 _id) public view returns(Nft memory) {
        // Check if the NFT exists
        require(_id < NftIdCounter, "Invalid NFT ID passed");
        // Return the NFT
        return NftListings[_id];
    }

    // Function to withdraw listingFee funds
    function withdraw() onlyOwner public {
        // Get the owner address
        address _owner = owner();
        // Get the amount to be withdrawn
        uint256 amount = address(this).balance;
        // Transfer the amount to the owner
        (bool sent, ) = _owner.call{value: amount}("");
        // Check if the amount was sent
        require(sent, "Failed to send amount");
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}
    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
    
}
