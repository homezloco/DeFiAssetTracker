import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchPortfolio, addAsset, addWallet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from 'wagmi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Portfolio, PortfolioAsset, WalletBalance } from "@/types/asset";
import WalletAssets from "@/components/WalletAssets";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { insertAssetSchema } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

interface AssetFormData {
  assetId: string;
  amount: number;
  blockchain: string;
}

interface WalletFormData {
  walletAddress: string;
  chain: string;
}

const BLOCKCHAIN_OPTIONS = [
  { label: "Bitcoin", value: "bitcoin" },
  { label: "Ethereum", value: "ethereum" },
  { label: "Solana", value: "solana" },
  { label: "BSC", value: "bsc" },
  { label: "XRP", value: "xrp" }
];

export default function Portfolio() {
  const { toast } = useToast();
  const { address: connectedWallet } = useAccount();
  const assetForm = useForm<AssetFormData>();
  const walletForm = useForm<WalletFormData>({
    defaultValues: {
      walletAddress: "",
      chain: ""
    }
  });
  
  const { data: portfolio, isLoading } = useQuery<Portfolio>({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio
  });

  const addAssetMutation = useMutation({
    mutationFn: addAsset,
    onSuccess: () => {
      toast({
        title: "Asset added successfully",
        description: "Your portfolio has been updated"
      });
    }
  });

  const addWalletMutation = useMutation({
    mutationFn: addWallet,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Wallet added to portfolio"
      });
      walletForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Portfolio</h1>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Assets</TabsTrigger>
          <TabsTrigger value="wallets">Wallet Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card className="p-6">
            <Form {...assetForm}>
              <form onSubmit={assetForm.handleSubmit((data) => addAssetMutation.mutate(data))}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={assetForm.control}
                    name="assetId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. bitcoin" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={assetForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.000001" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={assetForm.control}
                    name="blockchain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blockchain</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blockchain" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BLOCKCHAIN_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="mt-4">Add Asset</Button>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="wallets">
          <Card className="p-6">
            {connectedWallet && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Connected Wallet</h3>
                <p className="text-sm text-muted-foreground">{connectedWallet}</p>
              </div>
            )}
            
            <Form {...walletForm}>
              <form onSubmit={walletForm.handleSubmit((data) => {
                addWalletMutation.mutate(data);
              })}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={walletForm.control}
                    name="walletAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0x..." />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={walletForm.control}
                    name="chain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chain</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select chain" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BLOCKCHAIN_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="mt-4">Track Wallet</Button>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </Card>
            ))
          ) : portfolio?.assets?.length ? (
            portfolio.assets.map((asset) => (
              <Card key={asset.id} className="p-4">
                <h3 className="font-bold">{asset.assetId}</h3>
                <p>Amount: {asset.amount}</p>
                <p>Purchase Price: ${asset.purchasePrice}</p>
              </Card>
            ))
          ) : (
            <Card className="p-4 col-span-full text-center">
              <p className="text-muted-foreground">No assets in portfolio. Add some assets to get started!</p>
            </Card>
          )}
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Wallet Assets</h2>
        <WalletAssets 
          wallets={portfolio?.wallets || []} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}
