// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NftAuction is ERC721, ERC721Enumerable, ERC721URIStorage, IERC721Receiver {
    // Enum for the status of the auction
    enum AuctionStatus {
        Active,
        Ended
    }

    // The seller of the NFT
    address public seller;
    // The price of the NFT
    uint256 public price;
    // The id of the auction
    uint256 public auctionId;
    // The address of the highest bidder
    address public highestBidder;
    // The highest bid amount
    uint256 public highestBid;
    // The end time of the auction
    uint256 public auctionEndTime;
    // The duration of the auction
    uint256 public duration;
    // The status of the auction
    AuctionStatus public status;

    // Events
    // Event for when a new auction is created
    event NewAuctionCreated(uint256 auctionId);
    // Event for when a new bid is placed
    event BidPlaced(uint256 auctionId, address bidder, uint256 bidAmount);
    // Event for when the auction ends
    event AuctionEnded(uint256 auctionId, address winner, uint256 winningBid);
    // Event for when the seller withdraws the funds
    event WithdrawFunds();

    // Modifiers
    // Modifier to check if the auction is active
    modifier onlyAuctionSeller() {
        require(seller == msg.sender, "Only the seller can call this function");
        _;
    }

    // Contract constructor
    // @param _seller - The address of the seller
    // @param _nftId - The id of the NFT
    // @param _duration - The duration of the auction
    // @param _price - The price of the NFT
    constructor(address _seller, uint256 _nftId, uint256 _duration, uint256 _price) ERC721("NftListing", "NFTL") {
        seller = _seller;
        auctionId = _nftId;
        duration = _duration;
        price = _price;
    }

    // Function to mint the auction
    // @param _uri - The URI of the NFT
    function mintAuction(string memory _uri) external {
        _safeMint(seller, auctionId);
        _setTokenURI(auctionId, _uri);

        auctionEndTime = block.timestamp + duration;

        status = AuctionStatus.Active;

        emit NewAuctionCreated(auctionId);
    }

    // Function to place a bid
    // The bid must be higher than the current highest bid
    // The bid must be higher than the price of the NFT
    // The auction must not have ended
    // The previous highest bidder must be refunded
    // Emit a BidPlaced event
    function placeBid() external payable {
        require(block.timestamp < auctionEndTime, "Auction has ended");
        require(msg.value > highestBid, "Bid must be higher than current highest bid");
        require(msg.value >= price, "Insufficient funds sent");

        if (highestBidder != address(0)) {
            // Refund the previous highest bidder
            payable(highestBidder).transfer(highestBid);
        }

        highestBidder = msg.sender;
        highestBid = msg.value;

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    // Function to withdraw funds and end the auction
    // The auction must not have ended
    function withdraw() external returns (bool) {
        require(block.timestamp > auctionEndTime, "Auction has not ended");
        // get the amount sent to the contract for the purchase of the product
        uint256 amount = address(this).balance;

        // transfer the amount to the seller
        (bool sent,) = seller.call{value: amount}("");
        require(sent, "Failed to withdraw amount");
        // transfer the NFT to the highest bidder
        _transfer(seller, highestBidder, auctionId);
        // emit the WithdrawFunds event
        emit WithdrawFunds();
        // set the status of the auction to ended
        status = AuctionStatus.Ended;
    
        // emit the AuctionEnded event
        emit AuctionEnded(auctionId, highestBidder, highestBid);
        return true;
    }


    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
