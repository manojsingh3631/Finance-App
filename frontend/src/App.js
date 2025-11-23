import { useState, useEffect } from "react";
import "@/App.css";
import { ThemeProvider } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, TrendingDown, Target, BarChart3, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import SIPCalculator from "@/components/SIPCalculator";
import SWPCalculator from "@/components/SWPCalculator";
import ComparisonView from "@/components/ComparisonView";
import { Toaster } from "@/components/ui/sonner";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      data-testid="theme-toggle-btn"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-300 hover:scale-110"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700" />
      )}
    </button>
  );
}

function AppContent() {
  const [sipData, setSipData] = useState(null);
  const [swpData, setSwpData] = useState(null);
  const [activeTab, setActiveTab] = useState("sip");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
      <ThemeToggle />
      <Toaster position="top-center" />
      
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-emerald-600 to-blue-600 dark:from-blue-400 dark:via-emerald-400 dark:to-blue-400 bg-clip-text text-transparent" style={{fontFamily: 'Manrope, sans-serif'}}>
              Financial Calculator
            </h1>
          </div>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto" style={{fontFamily: 'Manrope, sans-serif'}}>
            Calculate your investment returns with precision
          </p>
        </div>

        {/* Main Calculator Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 h-14 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-1 rounded-2xl" data-testid="calculator-tabs">
            <TabsTrigger 
              value="sip" 
              className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
              data-testid="sip-tab"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              SIP
            </TabsTrigger>
            <TabsTrigger 
              value="swp" 
              className="rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
              data-testid="swp-tab"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              SWP
            </TabsTrigger>
            <TabsTrigger 
              value="compare" 
              className="rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-300"
              data-testid="compare-tab"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sip" className="mt-0">
            <SIPCalculator onCalculate={setSipData} />
          </TabsContent>

          <TabsContent value="swp" className="mt-0">
            <SWPCalculator onCalculate={setSwpData} />
          </TabsContent>

          <TabsContent value="compare" className="mt-0">
            <ComparisonView sipData={sipData} swpData={swpData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;