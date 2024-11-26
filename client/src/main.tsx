import React, { StrictMode } from "react";
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

interface ProtectedRouteProps {
  component: React.ComponentType;
}

function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();
  
  const handleRedirect = React.useCallback(() => {
    try {
      if (!isLoading && !user) {
        setLocation("/auth");
      }
    } catch (error) {
      console.error("Error during navigation:", error);
    }
  }, [isLoading, user, setLocation]);

  React.useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    } else if (!isLoading && user) {
      // Only redirect from auth page when logged in
      if (window.location.pathname === "/auth") {
        setLocation("/portfolio");
      }
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
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
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <ErrorBoundary>
          <Router />
        </ErrorBoundary>
        <Web3Modal
          projectId={import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''}
          ethereumClient={ethereumClient}
          themeMode="dark"
        />
      </WagmiConfig>
    </QueryClientProvider>
  </StrictMode>,
);
