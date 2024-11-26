import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Web3Button, useWeb3Modal } from '@web3modal/react';
import { useAccount } from 'wagmi';

export default function TopBar() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          DeFi Tracker
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost">Market</Button>
          </Link>
          <Link href="/portfolio">
            <Button variant="ghost">Portfolio</Button>
          </Link>
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <Web3Button />
            </div>
          ) : (
            <Button onClick={() => open()}>Connect Wallet</Button>
          )}
        </nav>
      </div>
    </header>
  );
}
