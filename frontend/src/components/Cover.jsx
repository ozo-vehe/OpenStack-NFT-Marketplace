import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Cover() {
  return (
    <>
      <div className="cover flex text-white bg-cover bg-fixed flex-col items-center justify-center h-screen">
        <div className="border flex items-center justify-center flex-col bg-black/40 w-full h-full">
          <p className="text-7xl font-bold">OpenStack</p>
          <p className="text-2xl my-4">The modern world of creative and sell extraordinary NFTs</p>
          <ConnectButton />
        </div>
      </div>
    </>
  )
}