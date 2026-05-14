import { useState } from "react";
import "@/App.css";
import { ThemeProvider, useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, TrendingDown, Target, BarChart3, Moon, Sun, ExternalLink, Grid3x3, History, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import SIPCalculator from "@/components/SIPCalculator";
import SWPCalculator from "@/components/SWPCalculator";
import ComparisonView from "@/components/ComparisonView";
import MoreTools from "@/components/MoreTools";
import CalculationHistory from "@/components/CalculationHistory";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useState(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      data-testid="theme-toggle-btn"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:scale-110 shadow-lg"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-amber-500" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700" />
      )}
    </button>
  );
}

export default function DashboardPage({ isGuestMode = false, activeTab: initialTab = "sip" }) {
  const [sipData, setSipData] = useState(null);
  const [swpData, setSwpData] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-slate-950 transition-colors duration-500">
        <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-4 md:top-6 md:right-6 z-50 flex items-center justify-end gap-2 md:gap-3">
          <ThemeToggle />
          {!isGuestMode && isAuthenticated ? (
            <Button
              onClick={logout}
              variant="outline"
              className="h-10 md:h-11 px-3 md:px-4 rounded-2xl font-semibold shadow-lg border-slate-700 hover:border-slate-600"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <Button
              onClick={() => window.location.href = '/login'}
              className="h-10 md:h-11 px-3 md:px-4 rounded-2xl font-semibold shadow-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
              data-testid="guest-login-btn"
            >
              <LogIn className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sign In to Save</span>
              <span className="sm:hidden">Sign In</span>
            </Button>
          )}
        </div>
        <Toaster position="top-center" />
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTIwIDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDEwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          
          <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
              <div className="flex-1 text-center lg:text-left max-w-4xl">
                <img 
                  src="https://customer-assets.emergentagent.com/job_dual-fin-calc/artifacts/503uepwb_Vittlit%20Logo%20600X300.jpg" 
                  alt="Vittlit Logo" 
                  className="h-12 md:h-16 lg:h-20 mb-4 md:mb-6 mx-auto lg:mx-0"
                  data-testid="vittlit-logo"
                />
                <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-3 md:mb-4 leading-tight" style={{fontFamily: 'Inter, sans-serif'}}>
                  {isGuestMode || !user ? 'Smart Financial' : `Welcome, ${user?.name?.split(' ')[0]}!`}
                  {(isGuestMode || !user) && (
                    <>
                      <br />
                      <span className="text-amber-300">Planning Tools</span>
                    </>
                  )}
                </h1>
                <p className="text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto lg:mx-0" style={{fontFamily: 'Inter, sans-serif'}}>
                  {isGuestMode || !user 
                    ? 'Calculate returns, plan investments - Sign in to save your calculations'
                    : 'Your financial planning dashboard'
                  }
                </p>
                <Button 
                  asChild
                  size="lg" 
                  className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-bold bg-white hover:bg-amber-50 text-purple-600 rounded-2xl shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105 mx-auto lg:mx-0 w-full sm:w-auto"
                  data-testid="mutual-fund-journey-btn"
                >
                  <a href="http://p.njw.bz/18501" target="_blank" rel="noopener noreferrer">
                    <Target className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    <span className="hidden sm:inline">Start Your Mutual Fund Journey</span>
                    <span className="sm:hidden">Start Investing</span>
                    <ExternalLink className="w-3 h-3 md:w-4 md:h-4 ml-2" />
                  </a>
                </Button>
              </div>
              <div className="hidden lg:block">
                <div className="w-64 h-64 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-pink-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                  <Calculator className="w-full h-full text-white/20" strokeWidth={0.5} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 py-8 md:py-12 max-w-7xl">
          {/* Main Calculator Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full max-w-3xl mx-auto ${isGuestMode || !isAuthenticated ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-5'} mb-8 h-auto min-h-[4rem] bg-slate-900 shadow-xl border border-slate-800 p-1.5 rounded-2xl gap-1`} data-testid="calculator-tabs">
              <TabsTrigger 
                value="sip" 
                className="min-w-0 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-bold text-slate-300 text-xs md:text-sm py-3 px-1 sm:px-2 md:px-4 flex flex-col md:flex-row items-center gap-1 md:gap-2"
                data-testid="sip-tab"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">SIP</span>
              </TabsTrigger>
              <TabsTrigger 
                value="swp" 
                className="min-w-0 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-bold text-slate-300 text-xs md:text-sm py-3 px-1 sm:px-2 md:px-4 flex flex-col md:flex-row items-center gap-1 md:gap-2"
                data-testid="swp-tab"
              >
                <TrendingDown className="w-4 h-4" />
                <span className="hidden sm:inline">SWP</span>
              </TabsTrigger>
              <TabsTrigger 
                value="compare" 
                className="min-w-0 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-bold text-slate-300 text-xs md:text-sm py-3 px-1 sm:px-2 md:px-4 flex flex-col md:flex-row items-center gap-1 md:gap-2"
                data-testid="compare-tab"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Compare</span>
              </TabsTrigger>
              <TabsTrigger 
                value="more" 
                className="min-w-0 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-bold text-slate-300 text-xs md:text-sm py-3 px-1 sm:px-2 md:px-4 flex flex-col md:flex-row items-center gap-1 md:gap-2"
                data-testid="more-tools-tab"
              >
                <Grid3x3 className="w-4 h-4" />
                <span className="hidden sm:inline">More</span>
              </TabsTrigger>
              {!isGuestMode && isAuthenticated && (
                <TabsTrigger 
                  value="history" 
                  className="min-w-0 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-bold text-slate-300 text-xs md:text-sm py-3 px-1 sm:px-2 md:px-4 flex flex-col md:flex-row items-center gap-1 md:gap-2"
                  data-testid="history-tab"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="sip" className="mt-0">
              <SIPCalculator onCalculate={setSipData} isGuestMode={isGuestMode || !isAuthenticated} />
            </TabsContent>

            <TabsContent value="swp" className="mt-0">
              <SWPCalculator onCalculate={setSwpData} sipData={sipData} isGuestMode={isGuestMode || !isAuthenticated} />
            </TabsContent>

            <TabsContent value="compare" className="mt-0">
              <ComparisonView sipData={sipData} swpData={swpData} />
            </TabsContent>

            <TabsContent value="more" className="mt-0">
              <MoreTools />
            </TabsContent>

            {!isGuestMode && isAuthenticated && (
              <TabsContent value="history" className="mt-0">
                <CalculationHistory />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </ThemeProvider>
  );
}