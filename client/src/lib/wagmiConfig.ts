
import { createConfig, configureChains } from 'wagmi';
import { mainnet, avalanche, bsc } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('WalletConnect Project ID not found. Please add VITE_WALLETCONNECT_PROJECT_ID to your environment variables.');
}

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, avalanche, bsc],
  [
    w3mProvider({ projectId }),
    publicProvider(),
  ],
  {
    retryCount: 3,
    pollingInterval: 5000,
  }
);

export const wagmiConfig = createConfig({
  autoConnect: false, // Changed to false to prevent connection errors on load
  connectors: w3mConnectors({ 
    chains,
    projectId,
    version: '2',
  }),
  publicClient,
  webSocketPublicClient,
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);
