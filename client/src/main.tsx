import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Web3Modal } from '@web3modal/react';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig, ethereumClient } from './lib/wagmiConfig';
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import TopBar from "./components/TopBar";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/portfolio" component={Portfolio} />
          <Route>404 Page Not Found</Route>
        </Switch>
      </main>
      <Toaster />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <WagmiConfig config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <Router />
        </QueryClientProvider>
      </WagmiConfig>
      <Web3Modal
        projectId={import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''}
        ethereumClient={ethereumClient}
        themeMode="dark"
      />
    </ErrorBoundary>
  </StrictMode>,
);
