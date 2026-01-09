import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingDown, Download, Info, AlertTriangle, TrendingUp } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SaveCalculationDialog from "@/components/SaveCalculationDialog";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const COLORS = {
  withdrawals: '#f59e0b',
  returns: '#10b981',
  remaining: '#3b82f6'
};

const RISK_PROFILES = {
  conservative: { label: 'Conservative', returnAdjustment: -1 },
  moderate: { label: 'Moderate', returnAdjustment: 0 },
  aggressive: { label: 'Aggressive', returnAdjustment: 1 }
};

export default function SWPCalculator({ onCalculate, sipData }) {
  const [lumpsumInvestment, setLumpsumInvestment] = useState(1000000);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState(10);
  const [duration, setDuration] = useState(15);
  const [inflation, setInflation] = useState(6);
  const [riskProfile, setRiskProfile] = useState('moderate');
  const [results, setResults] = useState(null);
  const [withdrawalMode, setWithdrawalMode] = useState('fixed'); // 'fixed' or 'percentage'
  const [yearlyWithdrawalPercent, setYearlyWithdrawalPercent] = useState(6);
  const [sipImported, setSipImported] = useState(false);
  
  // New state for inflation-adjusted withdrawals
  const [inflationAdjustedWithdrawal, setInflationAdjustedWithdrawal] = useState(false);
  const [showWithdrawalSchedule, setShowWithdrawalSchedule] = useState(false);

  const importFromSIP = () => {
    if (sipData && sipData.outputs) {
      setLumpsumInvestment(sipData.outputs.totalValue);
      setSipImported(true);
      toast.success('SIP portfolio value imported successfully');
    } else {
      toast.error('Please calculate SIP first');
    }
  };

  const getActualMonthlyWithdrawal = () => {
    if (withdrawalMode === 'percentage') {
      return Math.round((lumpsumInvestment * yearlyWithdrawalPercent) / 100 / 12);
    }
    return monthlyWithdrawal;
  };

  const calculateSWP = () => {
    const adjustedReturn = expectedReturn + RISK_PROFILES[riskProfile].returnAdjustment;
    const monthlyRate = adjustedReturn / 100 / 12;
    const months = duration * 12;
    const initialMonthlyWithdrawal = getActualMonthlyWithdrawal();
    const inflationRate = inflation / 100;
    
    let balance = lumpsumInvestment;
    let totalWithdrawals = 0;
    let totalReturns = 0;
    let exhausted = false;
    let exhaustionMonth = 0;
    let currentYearlyWithdrawal = initialMonthlyWithdrawal * 12;
    let currentMonthlyWithdrawal = initialMonthlyWithdrawal;
    
    // Track year-wise withdrawal schedule
    const withdrawalSchedule = [];
    
    for (let month = 1; month <= months; month++) {
      const monthlyReturn = balance * monthlyRate;
      totalReturns += monthlyReturn;
      balance = balance + monthlyReturn - currentMonthlyWithdrawal;
      totalWithdrawals += currentMonthlyWithdrawal;
      
      // Increase withdrawal at end of each year if inflation-adjusted is enabled
      if (inflationAdjustedWithdrawal && month % 12 === 0) {
        const year = month / 12;
        withdrawalSchedule.push({
          year,
          monthlyWithdrawal: Math.round(currentMonthlyWithdrawal),
          yearlyWithdrawal: Math.round(currentYearlyWithdrawal),
          portfolioBalance: Math.round(balance)
        });
        
        // Increase for next year
        currentYearlyWithdrawal = currentYearlyWithdrawal * (1 + inflationRate);
        currentMonthlyWithdrawal = currentYearlyWithdrawal / 12;
      } else if (!inflationAdjustedWithdrawal && month % 12 === 0) {
        const year = month / 12;
        withdrawalSchedule.push({
          year,
          monthlyWithdrawal: Math.round(currentMonthlyWithdrawal),
          yearlyWithdrawal: Math.round(currentYearlyWithdrawal),
          portfolioBalance: Math.round(balance)
        });
      }
      
      if (balance <= 0 && !exhausted) {
        exhausted = true;
        exhaustionMonth = month;
        balance = 0;
        break;
      }
    }
    
    const exhaustionProbability = exhausted ? 100 : (initialMonthlyWithdrawal * 12 / (lumpsumInvestment * (adjustedReturn / 100))) > 0.8 ? 60 : 20;
    
    const calculatedResults = {
      totalWithdrawals: Math.round(totalWithdrawals),
      returnsEarned: Math.round(totalReturns),
      remainingValue: Math.round(balance),
      exhausted,
      exhaustionMonth,
      exhaustionProbability,
      monthlyWithdrawal: initialMonthlyWithdrawal,
      finalMonthlyWithdrawal: Math.round(currentMonthlyWithdrawal),
      withdrawalSchedule,
      inflationAdjustedWithdrawal
    };
    
    setResults(calculatedResults);
    onCalculate && onCalculate({
      type: 'swp',
      inputs: { 
        lumpsumInvestment, 
        monthlyWithdrawal: initialMonthlyWithdrawal, 
        expectedReturn: adjustedReturn, 
        duration, 
        inflation, 
        riskProfile,
        withdrawalMode,
        yearlyWithdrawalPercent: withdrawalMode === 'percentage' ? yearlyWithdrawalPercent : null,
        sipImported,
        inflationAdjustedWithdrawal
      },
      outputs: calculatedResults
    });
  };

  const exportToPDF = () => {
    if (!results) return;
    
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('SWP Return Calculator Report', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    
    doc.autoTable({
      startY: 40,
      head: [['Input Parameter', 'Value']],
      body: [
        ['Lumpsum Investment', formatINR(lumpsumInvestment)],
        ['Monthly Withdrawal', formatINR(monthlyWithdrawal)],
        ['Expected Return', `${expectedReturn}%`],
        ['Duration', `${duration} years`],
        ['Inflation', `${inflation}%`],
        ['Risk Profile', RISK_PROFILES[riskProfile].label]
      ]
    });
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Output', 'Value']],
      body: [
        ['Total Withdrawals', formatINR(results.totalWithdrawals)],
        ['Returns Earned', formatINR(results.returnsEarned)],
        ['Remaining Portfolio Value', formatINR(results.remainingValue)],
        ['Exhaustion Status', results.exhausted ? `Exhausted in ${Math.floor(results.exhaustionMonth / 12)} years ${results.exhaustionMonth % 12} months` : 'Not Exhausted'],
        ['Exhaustion Probability', `${results.exhaustionProbability}%`]
      ]
    });
    
    doc.save('swp-calculator-report.pdf');
    toast.success('PDF exported successfully');
  };

  const exportToExcel = () => {
    if (!results) return;
    
    const data = [
      ['SWP Return Calculator Report'],
      ['Generated on:', new Date().toLocaleString()],
      [],
      ['Input Parameter', 'Value'],
      ['Lumpsum Investment', lumpsumInvestment],
      ['Monthly Withdrawal', monthlyWithdrawal],
      ['Expected Return', `${expectedReturn}%`],
      ['Duration', `${duration} years`],
      ['Inflation', `${inflation}%`],
      ['Risk Profile', RISK_PROFILES[riskProfile].label],
      [],
      ['Output', 'Value'],
      ['Total Withdrawals', results.totalWithdrawals],
      ['Returns Earned', results.returnsEarned],
      ['Remaining Portfolio Value', results.remainingValue],
      ['Exhaustion Status', results.exhausted ? `Exhausted in ${Math.floor(results.exhaustionMonth / 12)} years ${results.exhaustionMonth % 12} months` : 'Not Exhausted'],
      ['Exhaustion Probability', `${results.exhaustionProbability}%`]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SWP Report');
    XLSX.writeFile(wb, 'swp-calculator-report.xlsx');
    toast.success('Excel exported successfully');
  };

  const chartData = results ? [
    { name: 'Total Withdrawals', value: results.totalWithdrawals, color: COLORS.withdrawals },
    { name: 'Returns Earned', value: results.returnsEarned, color: COLORS.returns },
    { name: 'Remaining Value', value: results.remainingValue, color: COLORS.remaining }
  ] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      {/* Input Section */}
      <Card className="p-6 md:p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-xl" data-testid="swp-input-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100" style={{fontFamily: 'Manrope, sans-serif'}}>
            SWP Calculator
          </h2>
          <TrendingDown className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="space-y-6">
          {/* Import from SIP */}
          {sipData && sipData.outputs && !sipImported && (
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800" data-testid="swp-sip-import-alert">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                <div className="flex items-center justify-between">
                  <span>SIP Portfolio Available: {formatINR(sipData.outputs.totalValue)}</span>
                  <Button 
                    size="sm" 
                    onClick={importFromSIP}
                    className="ml-4 bg-blue-600 hover:bg-blue-700"
                    data-testid="swp-import-from-sip-btn"
                  >
                    Import from SIP
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {sipImported && (
            <Alert className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" data-testid="swp-imported-alert">
              <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription className="text-emerald-800 dark:text-emerald-300">
                SIP portfolio imported successfully
              </AlertDescription>
            </Alert>
          )}

          {/* Lumpsum Investment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lumpsum Investment (₹)</Label>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total amount you want to invest initially</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
            <Input
              type="number"
              value={lumpsumInvestment}
              onChange={(e) => {
                setLumpsumInvestment(Number(e.target.value));
                setSipImported(false);
              }}
              className="text-lg font-semibold h-12 bg-white dark:bg-slate-900"
              data-testid="swp-lumpsum-investment-input"
            />
            <Slider
              value={[lumpsumInvestment]}
              onValueChange={([value]) => {
                setLumpsumInvestment(value);
                setSipImported(false);
              }}
              min={100000}
              max={10000000}
              step={50000}
              className="mt-2"
              data-testid="swp-lumpsum-investment-slider"
            />
          </div>

          {/* Withdrawal Mode */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Withdrawal Mode</Label>
            <Select value={withdrawalMode} onValueChange={setWithdrawalMode}>
              <SelectTrigger className="h-12 bg-white dark:bg-slate-900" data-testid="swp-withdrawal-mode-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Monthly Amount</SelectItem>
                <SelectItem value="percentage">Yearly % of Total</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional: Fixed Monthly Withdrawal OR Yearly % */}
          {withdrawalMode === 'fixed' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Monthly Withdrawal (₹)</Label>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fixed amount you want to withdraw every month</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <Input
                type="number"
                value={monthlyWithdrawal}
                onChange={(e) => setMonthlyWithdrawal(Number(e.target.value))}
                className="text-lg font-semibold h-12 bg-white dark:bg-slate-900"
                data-testid="swp-monthly-withdrawal-input"
              />
              <Slider
                value={[monthlyWithdrawal]}
                onValueChange={([value]) => setMonthlyWithdrawal(value)}
                min={5000}
                max={200000}
                step={1000}
                className="mt-2"
                data-testid="swp-monthly-withdrawal-slider"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Yearly Withdrawal (%)</Label>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{yearlyWithdrawalPercent}%</span>
              </div>
              <Slider
                value={[yearlyWithdrawalPercent]}
                onValueChange={([value]) => setYearlyWithdrawalPercent(value)}
                min={1}
                max={20}
                step={0.5}
                data-testid="swp-yearly-withdrawal-slider"
              />
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Calculated Monthly Withdrawal</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400" data-testid="swp-calculated-monthly">
                  {formatINR(getActualMonthlyWithdrawal())}
                </p>
              </div>
            </div>
          )}

          {/* Inflation-Adjusted Withdrawal Toggle */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <Label className="text-sm font-bold text-slate-800 dark:text-slate-100">Inflation-Adjusted Withdrawals</Label>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Automatically increase withdrawals yearly to keep pace with inflation</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <Switch
                checked={inflationAdjustedWithdrawal}
                onCheckedChange={setInflationAdjustedWithdrawal}
                data-testid="swp-inflation-adjusted-switch"
              />
            </div>
            
            {inflationAdjustedWithdrawal && (
              <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-xs text-blue-800 dark:text-blue-300">
                  Your withdrawals will increase by {inflation}% each year to maintain purchasing power. 
                  Starting: {formatINR(getActualMonthlyWithdrawal())}/month → 
                  Year {duration}: {formatINR(Math.round(getActualMonthlyWithdrawal() * Math.pow(1 + inflation/100, duration)))}/month
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Expected Return */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Expected Return (%)</Label>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{expectedReturn}%</span>
            </div>
            <Slider
              value={[expectedReturn]}
              onValueChange={([value]) => setExpectedReturn(value)}
              min={1}
              max={25}
              step={0.5}
              data-testid="swp-expected-return-slider"
            />
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Duration (Years)</Label>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{duration} years</span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={([value]) => setDuration(value)}
              min={1}
              max={40}
              step={1}
              data-testid="swp-duration-slider"
            />
          </div>

          {/* Inflation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Inflation (%)</Label>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{inflation}%</span>
            </div>
            <Slider
              value={[inflation]}
              onValueChange={([value]) => setInflation(value)}
              min={0}
              max={15}
              step={0.5}
              data-testid="swp-inflation-slider"
            />
          </div>

          {/* Risk Profile */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Risk Profile</Label>
            <Select value={riskProfile} onValueChange={setRiskProfile}>
              <SelectTrigger className="h-12 bg-white dark:bg-slate-900" data-testid="swp-risk-profile-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={calculateSWP}
            className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            data-testid="swp-calculate-btn"
          >
            Calculate Withdrawals
          </Button>
        </div>
      </Card>

      {/* Results Section */}
      <div className="space-y-6">
        <Card className="p-6 md:p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-xl" data-testid="swp-results-card">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6" style={{fontFamily: 'Manrope, sans-serif'}}>
            Results
          </h2>

          {results ? (
            <div className="space-y-6">
              {/* Warning if exhausted */}
              {results.exhausted && (
                <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" data-testid="swp-exhaustion-alert">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-300">
                    Portfolio will be exhausted in {Math.floor(results.exhaustionMonth / 12)} years {results.exhaustionMonth % 12} months
                  </AlertDescription>
                </Alert>
              )}

              {/* Output Values */}
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {results.inflationAdjustedWithdrawal ? 'Starting Monthly Withdrawal' : 'Monthly Withdrawal'}
                  </p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100" data-testid="swp-monthly-withdrawal-result">
                    {formatINR(results.monthlyWithdrawal)}
                  </p>
                  {results.inflationAdjustedWithdrawal && results.finalMonthlyWithdrawal !== results.monthlyWithdrawal && (
                    <p className="text-xs text-slate-500 mt-1">
                      Final (Year {duration}): {formatINR(results.finalMonthlyWithdrawal)}/month
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Withdrawals</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="swp-total-withdrawals">
                    {formatINR(results.totalWithdrawals)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Returns Earned</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="swp-returns-earned">
                    {formatINR(results.returnsEarned)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Remaining Portfolio Value</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="swp-remaining-value">
                    {formatINR(results.remainingValue)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Exhaustion Probability</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="swp-exhaustion-probability">
                    {results.exhaustionProbability}%
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatINR(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Withdrawal Schedule Button (if inflation-adjusted) */}
              {results.inflationAdjustedWithdrawal && results.withdrawalSchedule && results.withdrawalSchedule.length > 0 && (
                <Dialog open={showWithdrawalSchedule} onOpenChange={setShowWithdrawalSchedule}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" data-testid="swp-view-schedule-btn">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Year-Wise Withdrawal Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-slate-800 max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Inflation-Adjusted Withdrawal Schedule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Alert className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
                        <Info className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <AlertDescription className="text-xs text-orange-800 dark:text-orange-300">
                          Withdrawals increase by {inflation}% annually to maintain purchasing power against inflation
                        </AlertDescription>
                      </Alert>
                      
                      {/* Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                              <th className="text-left p-2 font-bold text-slate-800 dark:text-slate-100">Year</th>
                              <th className="text-right p-2 font-bold text-slate-800 dark:text-slate-100">Monthly Withdrawal</th>
                              <th className="text-right p-2 font-bold text-slate-800 dark:text-slate-100">Yearly Withdrawal</th>
                              <th className="text-right p-2 font-bold text-slate-800 dark:text-slate-100">Portfolio Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.withdrawalSchedule.map((item) => (
                              <tr key={item.year} className="border-b border-slate-100 dark:border-slate-800">
                                <td className="p-2 text-slate-700 dark:text-slate-300">Year {item.year}</td>
                                <td className="p-2 text-right text-slate-800 dark:text-slate-100 font-semibold">
                                  {formatINR(item.monthlyWithdrawal)}
                                </td>
                                <td className="p-2 text-right text-slate-800 dark:text-slate-100">
                                  {formatINR(item.yearlyWithdrawal)}
                                </td>
                                <td className="p-2 text-right text-blue-600 dark:text-blue-400 font-semibold">
                                  {formatINR(item.portfolioBalance)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={exportToPDF} className="flex-1" data-testid="swp-export-pdf-btn">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={exportToExcel} className="flex-1" data-testid="swp-export-excel-btn">
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <TrendingDown className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Enter your withdrawal details and click Calculate Withdrawals</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}