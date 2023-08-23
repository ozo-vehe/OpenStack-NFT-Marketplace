// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NftAuction is ERC721, ERC721Enumerable, ERC721URIStorage, IERC721Receiver {

    enum AuctionStatus {
        Active,
        Ended
    }

    address public seller;
    uint256 public price;
    uint256 public auctionId;
    address public highestBidder;
    uint256 public highestBid;
    uint256 public auctionEndTime;
    uint256 public duration;
    AuctionStatus public status;

    event NewAuctionCreated(uint256 auctionId);
    event BidPlaced(uint256 auctionId, address bidder, uint256 bidAmount);
    event AuctionEnded(uint256 auctionId, address winner, uint256 winningBid);
    event WithdrawFunds();

    modifier onlyAuctionSeller() {
        require(seller == msg.sender, "Only the seller can call this function");
        _;
    }

    constructor(address _seller, uint256 _nftId, uint256 _duration, uint256 _price) ERC721("NftListing", "NFTL") {
        seller = _seller;
        auctionId = _nftId;
        duration = _duration;
        price = _price;
    }

    function mintAuction(string memory _uri) external {
        _safeMint(seller, auctionId);
        _setTokenURI(auctionId, _uri);

        auctionEndTime = block.timestamp + duration;

        status = AuctionStatus.Active;

        emit NewAuctionCreated(auctionId);
    }

    function placeBid() external payable {
        // Auction storage auction = auctions[auctionId];
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

    function withdraw() external returns (bool) {
        require(block.timestamp < auctionEndTime, "Auction has already ended");
        // get the amount sent to the contract for the purchase of the product
        uint256 amount = address(this).balance;

        (bool sent,) = seller.call{value: amount}("");
        require(sent, "Failed to withdraw amount");
        _transfer(seller, highestBidder, auctionId);
        emit WithdrawFunds();
        status = AuctionStatus.Ended;
        
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
