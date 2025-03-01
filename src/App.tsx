
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WalletPage from "./pages/Wallet";
import Education from "./pages/Education";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import AuthLayout from "./components/AuthLayout";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import ThemeToggle from "./components/ThemeToggle";
import LanguageSwitcher from "./components/LanguageSwitcher";
import "./App.css";

const queryClient = new QueryClient();

function Navigation() {
  const { isSignedIn } = useUser();
  const { t } = useLanguage();

  return (
    <div className="fixed z-10 top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold">{t('cryptoTracker')}</Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/" className="hover:text-primary transition">{t('home')}</Link>
            {isSignedIn && (
              <Link to="/wallet" className="hover:text-primary transition">{t('wallet')}</Link>
            )}
            <Link to="/education" className="hover:text-primary transition">{t('education')}</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeToggle />
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                  {t('signIn')}
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md">
                  {t('signUp')}
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LanguageProvider>
          <TooltipProvider>
            <Router>
              <div className="pt-14"> {/* Add padding to account for fixed navigation */}
                <Navigation />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/sign-in/*" element={<SignInPage />} />
                  <Route path="/sign-up/*" element={<SignUpPage />} />
                  <Route path="/education" element={<Education />} />
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
              </div>
            </Router>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
