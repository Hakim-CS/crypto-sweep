
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CryptoList from "@/components/CryptoList";

export default function Index() {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {isSignedIn ? `Welcome${isAdmin ? ' Admin' : ''}, ${user?.firstName || 'back'}!` : 'Cryptocurrency Tracker'}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          {isSignedIn 
            ? 'Track your portfolio and favorite cryptocurrencies'
            : 'Sign in to start managing your crypto portfolio'}
        </p>
        {isSignedIn && (
          <Button 
            onClick={() => navigate('/wallet')} 
            className="mb-8"
          >
            Go to Wallet
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <CryptoList />
    </div>
  );
}
