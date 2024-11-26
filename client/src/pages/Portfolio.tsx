import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchPortfolio, addAsset } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

interface FormData {
  assetId: string;
  amount: number;
  blockchain: string;
}

const BLOCKCHAIN_OPTIONS = [
  { label: "Ethereum", value: "ethereum" },
  { label: "Solana", value: "solana" },
  { label: "Avalanche", value: "avalanche" },
  { label: "BSC", value: "bsc" }
];

export default function Portfolio() {
  const { toast } = useToast();
  const form = useForm<FormData>();
  
  const { data: portfolio, isLoading } = useQuery({
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Portfolio</h1>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => addAssetMutation.mutate(data))}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
            </div>
            <Button type="submit" className="mt-4">Add Asset</Button>
          </form>
        </Form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolio?.assets.map((asset) => (
          <Card key={asset.id} className="p-4">
            <h3 className="font-bold">{asset.assetId}</h3>
            <p>Amount: {asset.amount}</p>
            <p>Purchase Price: ${asset.purchasePrice}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
