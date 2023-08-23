// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./NftListing.sol";
import "./NftAuction.sol";

contract NftMarketplace is Ownable {
    // Counter for all NFTs in the marketplace
    uint256 public NftIdCounter = 0;
    // Counter for all NFTs in the marketplace
    uint256 public AuctionIdCounter = 0;

    // Variable to hold the listing fee
    uint256 listingFee = 0.01 ether;

    // Struct to hold all created nfts
    struct Nft {
        NftListing sellerNft;
    }
    
    // Struct to hold all the auction Nft
    struct AuctionNft {
        NftAuction auctionNft;
    }

    // Mapping to hold all the NFTs created
    mapping(uint256 => Nft) public NftListings;
    
    // Mapping to hold all the NFTs created
    mapping(uint256 => AuctionNft) public NftAuctions;

    // Function to create NFTs
    function createNft(string memory _uri, uint256 _price) payable external {
        // Check if the price is greater than the listingFee
        require(msg.value >= listingFee, "Invalid minting price");
        
        // Create a new NFT
        NftListing newNft = new NftListing(NftIdCounter, msg.sender, _price);
        // Mint the NFT
        newNft.safeMint(_uri);

        // Add the NFT to the NftListings mapping
        NftListings[NftIdCounter] = Nft(
            newNft
        );
        // Increment the NftIdCounter
        NftIdCounter++;
    }

    // Function to create auction Nfts
    function createAuctionNft(string memory _uri, uint256 _price, uint256 _duration) payable external {
        // Check if the price is greater than the listingFee
        require(msg.value >= listingFee, "Invalid minting price");
        
        // Create a new NFT
        NftAuction newAuction = new NftAuction(msg.sender, AuctionIdCounter, _duration, _price);
        // Mint the NFT
        newAuction.mintAuction(_uri);

        // Add the NFT to the NftListings mapping
        NftAuctions[AuctionIdCounter] = AuctionNft(
            newAuction
        );
        // Increment the NftIdCounter
        AuctionIdCounter++;
    }

    // Function to withdraw listingFee funds
    function withdraw() onlyOwner external {
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
