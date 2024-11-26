import { createConfig, configureChains } from 'wagmi';
import { mainnet, avalanche, bsc } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';

if (!import.meta.env.VITE_WALLETCONNECT_PROJECT_ID) {
  throw new Error('Missing VITE_WALLETCONNECT_PROJECT_ID environment variable');
}

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, avalanche, bsc],
  [
    w3mProvider({ projectId }),
    publicProvider(),
  ]
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ 
    chains,
    projectId,
    version: 2
  }),
  publicClient,
  webSocketPublicClient,
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);
