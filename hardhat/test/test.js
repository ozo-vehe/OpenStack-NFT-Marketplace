const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NftListing", function () {
  let NftListing;
  let nftListing;
  let owner;
  let addr1;

  it("Should create listing Nft", async function () {
    // Create NFT
    const price = 1;
    const id = 0;
    [owner, addr1] = await ethers.getSigners();
    NftListing = await ethers.deployContract("NftListing", [id, addr1, price]);
    const uri = "https://example.com/nft1";
    await NftListing.safeMint(uri);
    expect(await NftListing.ownerOf(id)).to.equal(addr1.address);
  });

  it("Should buy a listing Nft", async function () {
    // Create NFT
    const price = 1;
    const id = 0;
    [owner, addr1] = await ethers.getSigners();
    NftListing = await ethers.deployContract("NftListing", [id, addr1, price]);
    const uri = "https://example.com/nft1";
    await NftListing.safeMint(uri);

    await NftListing.buy({value: BigInt(price), from: owner})
    expect(await NftListing.ownerOf(id)).to.equal(owner.address);
  });
});

describe("NftAuction", function () {
  let NftAuction;
  let owner;
  let addr1;

  it("Should create an auction Nft", async function () {
    // Create NFT
    const price = 1;
    const id = 0;
    const duration = 20 * 60;
    [owner, addr1] = await ethers.getSigners();
    NftAuction = await ethers.deployContract("NftAuction", [addr1, id, duration, price]);
    const uri = "https://example.com/nft1";
    // Call the mint function from the smart contract
    await NftAuction.mintAuction(uri);

    expect(await NftAuction.ownerOf(id)).to.equal(addr1.address);
  });

  it("Should place a bid successfully", async function () {
    const price = 1;
    const bid = 2;
    const id = 0;
    const duration = 20 * 60;
    [owner, addr1] = await ethers.getSigners();
    NftAuction = await ethers.deployContract("NftAuction", [addr1, id, duration, price]);
    const uri = "https://example.com/nft1";
    // Call the mint function from the smart contract
    await NftAuction.mintAuction(uri);

    await NftAuction.placeBid({value: BigInt(bid), from: owner})
    expect(await NftAuction.highestBidder()).to.equal(owner.address);
  });

  // it("Should withdraw a bid successfully", async function () {
  //   const price = 1;
  //   const bid = 2;
  //   const id = 0;
  //   const duration = 20 * 60;
  //   [owner, addr1] = await ethers.getSigners();
  //   NftAuction = await ethers.deployContract("NftAuction", [addr1, id, duration, price]);
  //   const uri = "https://example.com/nft1";
  //   // Call the mint function from the smart contract
  //   await NftAuction.mintAuction(uri);

  //   await NftAuction.placeBid({value: BigInt(bid), from: owner})

  //   await NftAuction.withdraw({from: addr1});

  //   expect(await NftAuction.status()).to.equal(BigInt(1));
  // });
});
