import { NFTStorage } from 'nft.storage';
import { readContract, writeContract } from '@wagmi/core';

const NFT_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDI5NzlGQTlBRTk5YTZCMEUwZmQyMjdiOGVlNjhFRkI0MzMwQTc2MUMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5MjM5MTk4OTIzMSwibmFtZSI6Ik9wZW5TdGFjayBORlQifQ.DaKV7bCh-zCqPOCQhslDmCx1LYuCiJWvy5t8X9doDpQ';
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

export const uploadToIPFS = async(file, name, description) => {
  console.log(file, file.name, file.type);
  const imageFile = new File([ file ], file.name, { type: file.type })

  const metadata = await client.store({
    name,
    description,
    image: imageFile
  })
  console.log(metadata);
  return metadata.url;
}

export const nftDetail = async(id, abi, data, auction=false) => {
  // Initialize common variables
  let uri, price, seller, endsAt, auctionStatus, currentBid;
  // Check if auction
  if(auction) {
    uri = await readContract({
      address: data,
      abi,
      functionName: 'tokenURI',
      args: [id],
    });
    
    price = await readContract({
      address: data,
      abi,
      functionName: 'price',
    });

    seller = await readContract({
      address: data,
      abi,
      functionName: 'seller',
    });

    endsAt = await readContract({
      address: data,
      abi,
      functionName: 'auctionEndTime',
    });

    auctionStatus = await readContract({
      address: data,
      abi,
      functionName: 'status',
    });

    currentBid = await readContract({
      address: data,
      abi,
      functionName: 'highestBid',
    });
  }
  // If not auction
  else {
    // Get uri from nftMarketplace data
    uri = await readContract({
      address: data,
      abi,
      functionName: 'tokenURI',
      args: [id],
    });

    // Get Nft price
    price = await readContract({
    address: data,
    abi,
    functionName: 'price',
    });

    seller = await readContract({
    address: data,
    abi,
    functionName: 'seller',
    });
  }


  // Get metadata from IPFS
  const metadata = await fetch(`https://nftstorage.link/ipfs/${uri.slice(7)}`);
  const nftMetadata = await metadata.json();
  console.log(nftMetadata);
  const { name, description } = nftMetadata;

  // Get image url from IPFS
  const { image } = nftMetadata;
  // Create image url from IPFS
  const imageUrl = `https://nftstorage.link/ipfs/${image.slice(7)}`
  // Return all data
  
  if(auction) console.log (name, description, imageUrl, price, seller, data, id, endsAt, auctionStatus, currentBid);
  else console.log (name, description, imageUrl, price, seller, data, id);
  
  // Return all data for auction
  if(auction) return { name, description, imageUrl, price, seller, data, id, endsAt, auctionStatus, currentBid };
  // Return all data for non-auction
  else return { name, description, imageUrl, price, seller, data, id };
}

export const buyNft = async(nftAddress, nftAbi, price) => {
  console.log("Buying...")
  await writeContract({
    address: nftAddress,
    abi: nftAbi,
    functionName: 'buy',
    value: price
  });

  console.log("Bought!");
  // console.log(buy)
}