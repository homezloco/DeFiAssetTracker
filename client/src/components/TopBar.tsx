import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Web3Button, useWeb3Modal } from '@web3modal/react';
import { useAccount, useConnect } from 'wagmi';
import { ErrorBoundary } from "./ErrorBoundary";
import { useToast } from "@/hooks/use-toast";

export default function TopBar() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();

  const { toast } = useToast();
  const { error: connectError } = useConnect({
    onError: (error) => {
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

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
          <ErrorBoundary>
            {isConnected ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Web3Button />
              </div>
            ) : (
              <Button 
                onClick={() => open()}
                disabled={!!connectError}
              >
                Connect Wallet
              </Button>
            )}
          </ErrorBoundary>
        </nav>
      </div>
    </header>
  );
}
