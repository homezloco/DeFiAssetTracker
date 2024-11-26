import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function TopBar() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          DeFi Tracker
        </Link>
        
        <nav className="flex gap-4">
          <Link href="/">
            <Button variant="ghost">Market</Button>
          </Link>
          <Link href="/portfolio">
            <Button variant="ghost">Portfolio</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
