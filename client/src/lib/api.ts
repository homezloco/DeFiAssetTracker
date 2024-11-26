const COINGECKO_API = "https://api.coingecko.com/api/v3";

export async function fetchTopAssets() {
  const response = await fetch(
    `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&sparkline=true&price_change_percentage=24h`
  );
  const data = await response.json();
  return data.map((asset: any) => ({
    ...asset,
    sparkline: asset.sparkline_in_7d?.price || []
  }));
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

export async function addAsset(asset: { assetId: string; amount: number }) {
  const response = await fetch("/api/portfolio/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset)
  });
  return response.json();
}
