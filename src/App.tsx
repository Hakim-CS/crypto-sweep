
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
import { Menu } from "lucide-react";
import "./App.css";
// Import SidebarProvider but we won't use SidebarTrigger anymore
import { SidebarProvider } from "@/components/ui/sidebar";

const queryClient = new QueryClient();

function Navigation() {
  const { isSignedIn } = useUser();
  const { t } = useLanguage();

  // Removed SidebarTrigger from here
  return (
    <div className="fixed z-10 top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-6">
          {/* Removed the SidebarTrigger component */}
          <Link to="/" className="text-xl font-bold hover-scale">{t('cryptoTracker')}</Link>
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
              {/* Wrap the app with SidebarProvider to make the sidebar components work */}
              <SidebarProvider>
                <div className="flex w-full min-h-screen">
                  <main className="flex-1 pt-14 animate-fade-in">
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
                  </main>
                </div>
              </SidebarProvider>
            </Router>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
