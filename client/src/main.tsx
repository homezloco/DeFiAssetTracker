import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, useLocation } from "wouter";
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
import AuthPage from "./pages/AuthPage";
import TopBar from "./components/TopBar";
import { useUser } from "./hooks/use-user";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useUser();

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/portfolio">
            <ProtectedRoute component={Portfolio} />
          </Route>
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
