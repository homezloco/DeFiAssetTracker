import { WalletBalance } from "@/types/asset";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WalletAssetsProps {
  wallets: WalletBalance[];
  isLoading: boolean;
}

const chainColors = {
  ethereum: "bg-purple-500/10 text-purple-500",
  solana: "bg-green-500/10 text-green-500",
  avalanche: "bg-red-500/10 text-red-500",
  bsc: "bg-yellow-500/10 text-yellow-500"
};

export default function WalletAssets({ wallets, isLoading }: WalletAssetsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-4 bg-muted rounded w-1/4" />
          </Card>
        ))}
      </div>
    );
  }

  if (!wallets?.length) {
    return (
      <Card className="p-4 text-center">
        <p className="text-muted-foreground">No wallets added yet. Add a wallet to track its balance.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {wallets.map((wallet, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={chainColors[wallet.chain as keyof typeof chainColors]}>
                  {wallet.chain.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground break-all">
                {wallet.address}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xl font-bold">{wallet.balance} {wallet.chain === 'ethereum' ? 'ETH' : 'SOL'}</p>
            {wallet.tokenBalances?.map((token, idx) => (
              <div key={idx} className="mt-2">
                <p className="text-sm">
                  {token.balance} {token.symbol}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
