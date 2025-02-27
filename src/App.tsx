
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WalletPage from "./pages/Wallet";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import AuthLayout from "./components/AuthLayout";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import ThemeToggle from "./components/ThemeToggle";
import "./App.css";

const queryClient = new QueryClient();

function Navigation() {
  const { isSignedIn } = useUser();

  return (
    <div className="fixed top-4 right-4 flex items-center gap-4">
      <ThemeToggle />
      {isSignedIn ? (
        <UserButton afterSignOutUrl="/" />
      ) : (
        <>
          <SignInButton mode="modal">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md">
              Sign Up
            </button>
          </SignUpButton>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Router>
            <Navigation />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sign-in/*" element={<SignInPage />} />
              <Route path="/sign-up/*" element={<SignUpPage />} />
              <Route 
                path="/wallet" 
                element={
                  <AuthLayout>
                    <WalletPage />
                  </AuthLayout>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
