const COINGECKO_API = "https://api.coingecko.com/api/v3";

type ChainIdentifiers = {
  [key in 'ethereum' | 'solana' | 'avalanche' | 'bsc']: string[];
};

const SUPPORTED_CHAINS: ChainIdentifiers = {
  ethereum: ['ethereum', 'eth'],
  solana: ['solana', 'sol'],
  avalanche: ['avalanche-2', 'avax'],
  bsc: ['binancecoin', 'bnb']
};

export async function fetchTopAssets() {
  const response = await fetch(
    `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=true&price_change_percentage=24h`
  );
  const data = await response.json();
  
  return data
    .map((asset: any) => {
      let blockchain = 'ethereum'; // default
      for (const [chain, identifiers] of Object.entries(SUPPORTED_CHAINS)) {
        if (identifiers.includes(asset.id) || asset.id.startsWith(chain)) {
          blockchain = chain;
          break;
        }
      }
      return {
        ...asset,
        blockchain,
        sparkline: asset.sparkline_in_7d?.price || []
      };
    })
    .filter((asset: any) => 
      Object.values(SUPPORTED_CHAINS).flat().some(id => {
        const chainKey = Object.keys(SUPPORTED_CHAINS).find(k => 
          SUPPORTED_CHAINS[k as keyof ChainIdentifiers].includes(id)
        ) as keyof ChainIdentifiers | undefined;
        return asset.id === id || (chainKey && asset.id.startsWith(chainKey));
      })
    )
    .slice(0, 20);
}

export async function fetchTrendingAssets() {
  const response = await fetch(`${COINGECKO_API}/search/trending`);
  const data = await response.json();
  return data.coins;
}

export async function fetchPortfolio() {
  const response = await fetch("/api/portfolio");
  return response.json();
}

export async function addAsset(asset: { assetId: string; amount: number; blockchain: string }) {
  const response = await fetch("/api/portfolio/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset)
  });
  return response.json();
}

export async function addWallet(wallet: { walletAddress: string; chain: string }) {
  const response = await fetch("/api/portfolio/wallets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: wallet.walletAddress,
      chain: wallet.chain
    })
  });
  return response.json();
}
