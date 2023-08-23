// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NftListing is ERC721, IERC721Receiver, ERC721Enumerable, ERC721URIStorage {
    // Variable to hold the nft ID
    uint256 public nftId;
    address public seller;
    uint256 public price;

    // Contract events
    event NewNft(address newBuyer);
    event NftBought(address buyer);

    // Custom only owner modifier
    modifier nftOwner() {
        require(seller == msg.sender, "Only Nft owner is allowed to call this function");
        _;
    }

    // Constructor to initialize the contract
    constructor(uint256 _nftId, address _seller, uint256 _price) ERC721("NftListing", "NFTL") {
        nftId = _nftId;
        seller = _seller;
        price = _price;
    }

    // Function mint an Nft
    function safeMint(string memory _uri) public {
        _safeMint(seller, nftId);
        _setTokenURI(nftId, _uri);

        // Emit NewNft event
        emit NewNft(seller);
    }

    // function to buy an Nft
    function buy() external payable {
        // Check if the buyer is not the seller
        require(msg.sender != seller, "Seller can't buy their Nft");
        // Check if the buyer has sent enough Ether
        require(msg.value >= price, "Invalid price passed");
        // Send the money to the seller
        payable(seller).transfer(msg.value);
        // Transfer ownership to the buyer
        _transfer(seller, msg.sender, nftId);
        // Change the value of seller to the address of the buyer
        seller = msg.sender;
        // Emit NftBought event
        emit NftBought(msg.sender);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}
    // Fallback function is called when msg.data is not empty
    fallback() external payable {}


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

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
