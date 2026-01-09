import { useState } from "react";
import "@/App.css";
import { ThemeProvider, useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, TrendingDown, Target, BarChart3, Moon, Sun, ExternalLink, Grid3x3, History, LogOut } from "lucide-react";
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

export default function DashboardPage() {
  const [sipData, setSipData] = useState(null);
  const [swpData, setSwpData] = useState(null);
  const [activeTab, setActiveTab] = useState("sip");
  const { user, logout } = useAuth();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
          <ThemeToggle />
          <Button
            onClick={logout}
            variant="outline"
            className="rounded-2xl font-semibold shadow-lg"
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        <Toaster position="top-center" />
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTIwIDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDEwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          
          <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <img 
                  src="https://customer-assets.emergentagent.com/job_dual-fin-calc/artifacts/503uepwb_Vittlit%20Logo%20600X300.jpg" 
                  alt="Vittlit Logo" 
                  className="h-16 md:h-20 mb-6 mx-auto md:mx-0"
                  data-testid="vittlit-logo"
                />
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight" style={{fontFamily: 'Manrope, sans-serif'}}>
                  Welcome, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl" style={{fontFamily: 'Manrope, sans-serif'}}>
                  Your financial planning dashboard
                </p>
                <Button 
                  asChild
                  size="lg" 
                  className="h-14 px-8 text-lg font-bold bg-white hover:bg-amber-50 text-purple-600 rounded-2xl shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105"
                  data-testid="mutual-fund-journey-btn"
                >
                  <a href="http://p.njw.bz/18501" target="_blank" rel="noopener noreferrer">
                    <Target className="w-5 h-5 mr-2" />
                    Start Your Mutual Fund Journey
                    <ExternalLink className="w-4 h-4 ml-2" />
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

        <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
          {/* Main Calculator Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 mb-8 h-16 bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl" data-testid="calculator-tabs">
              <TabsTrigger 
                value="sip" 
                className="rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-bold"
                data-testid="sip-tab"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                SIP
              </TabsTrigger>
              <TabsTrigger 
                value="swp" 
                className="rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-bold"
                data-testid="swp-tab"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                SWP
              </TabsTrigger>
              <TabsTrigger 
                value="compare" 
                className="rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-bold"
                data-testid="compare-tab"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare
              </TabsTrigger>
              <TabsTrigger 
                value="more" 
                className="rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-bold"
                data-testid="more-tools-tab"
              >
                <Grid3x3 className="w-4 h-4 mr-2" />
                More
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-bold"
                data-testid="history-tab"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sip" className="mt-0">
              <SIPCalculator onCalculate={setSipData} />
            </TabsContent>

            <TabsContent value="swp" className="mt-0">
              <SWPCalculator onCalculate={setSwpData} sipData={sipData} />
            </TabsContent>

            <TabsContent value="compare" className="mt-0">
              <ComparisonView sipData={sipData} swpData={swpData} />
            </TabsContent>

            <TabsContent value="more" className="mt-0">
              <MoreTools />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <CalculationHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ThemeProvider>
  );
}