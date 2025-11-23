import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { TrendingUp, Target, Download, Info } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  invested: '#3b82f6',
  returns: '#10b981',
  inflationImpact: '#f59e0b'
};

const RISK_PROFILES = {
  conservative: { label: 'Conservative', returnAdjustment: -1, confidence: 75 },
  moderate: { label: 'Moderate', returnAdjustment: 0, confidence: 85 },
  aggressive: { label: 'Aggressive', returnAdjustment: 1, confidence: 70 }
};

export default function SIPCalculator({ onCalculate }) {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [duration, setDuration] = useState(10);
  const [stepUp, setStepUp] = useState(0);
  const [inflation, setInflation] = useState(6);
  const [riskProfile, setRiskProfile] = useState('moderate');
  const [results, setResults] = useState(null);
  const [showGoalPlanner, setShowGoalPlanner] = useState(false);
  const [targetAmount, setTargetAmount] = useState(5000000);

  const calculateSIP = () => {
    const adjustedReturn = expectedReturn + RISK_PROFILES[riskProfile].returnAdjustment;
    const monthlyRate = adjustedReturn / 100 / 12;
    const months = duration * 12;
    const stepUpRate = stepUp / 100;
    
    let totalInvested = 0;
    let futureValue = 0;
    let currentMonthlyInvestment = monthlyInvestment;
    
    for (let month = 1; month <= months; month++) {
      totalInvested += currentMonthlyInvestment;
      futureValue = (futureValue + currentMonthlyInvestment) * (1 + monthlyRate);
      
      if (month % 12 === 0) {
        currentMonthlyInvestment = currentMonthlyInvestment * (1 + stepUpRate);
      }
    }
    
    const estimatedReturns = futureValue - totalInvested;
    const inflationRate = inflation / 100;
    const inflationAdjustedValue = futureValue / Math.pow(1 + inflationRate, duration);
    const inflationImpact = futureValue - inflationAdjustedValue;
    
    const calculatedResults = {
      totalInvested: Math.round(totalInvested),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(futureValue),
      inflationAdjustedValue: Math.round(inflationAdjustedValue),
      inflationImpact: Math.round(inflationImpact),
      confidence: RISK_PROFILES[riskProfile].confidence
    };
    
    setResults(calculatedResults);
    onCalculate && onCalculate({
      type: 'sip',
      inputs: { monthlyInvestment, expectedReturn: adjustedReturn, duration, stepUp, inflation, riskProfile },
      outputs: calculatedResults
    });
  };

  const calculateGoalSIP = () => {
    const adjustedReturn = expectedReturn + RISK_PROFILES[riskProfile].returnAdjustment;
    const monthlyRate = adjustedReturn / 100 / 12;
    const months = duration * 12;
    
    const requiredMonthlySIP = (targetAmount * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
    
    return {
      requiredMonthlySIP: Math.round(requiredMonthlySIP),
      probability: RISK_PROFILES[riskProfile].confidence
    };
  };

  const exportToPDF = () => {
    if (!results) return;
    
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('SIP Return Calculator Report', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    
    doc.autoTable({
      startY: 40,
      head: [['Input Parameter', 'Value']],
      body: [
        ['Monthly Investment', formatINR(monthlyInvestment)],
        ['Expected Return', `${expectedReturn}%`],
        ['Duration', `${duration} years`],
        ['Step-up', `${stepUp}%`],
        ['Inflation', `${inflation}%`],
        ['Risk Profile', RISK_PROFILES[riskProfile].label]
      ]
    });
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Output', 'Value']],
      body: [
        ['Total Invested', formatINR(results.totalInvested)],
        ['Estimated Returns', formatINR(results.estimatedReturns)],
        ['Total Portfolio Value', formatINR(results.totalValue)],
        ['Inflation-Adjusted Value', formatINR(results.inflationAdjustedValue)],
        ['Confidence Level', `${results.confidence}%`]
      ]
    });
    
    doc.save('sip-calculator-report.pdf');
    toast.success('PDF exported successfully');
  };

  const exportToExcel = () => {
    if (!results) return;
    
    const data = [
      ['SIP Return Calculator Report'],
      ['Generated on:', new Date().toLocaleString()],
      [],
      ['Input Parameter', 'Value'],
      ['Monthly Investment', monthlyInvestment],
      ['Expected Return', `${expectedReturn}%`],
      ['Duration', `${duration} years`],
      ['Step-up', `${stepUp}%`],
      ['Inflation', `${inflation}%`],
      ['Risk Profile', RISK_PROFILES[riskProfile].label],
      [],
      ['Output', 'Value'],
      ['Total Invested', results.totalInvested],
      ['Estimated Returns', results.estimatedReturns],
      ['Total Portfolio Value', results.totalValue],
      ['Inflation-Adjusted Value', results.inflationAdjustedValue],
      ['Confidence Level', `${results.confidence}%`]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SIP Report');
    XLSX.writeFile(wb, 'sip-calculator-report.xlsx');
    toast.success('Excel exported successfully');
  };

  const chartData = results ? [
    { name: 'Invested Amount', value: results.totalInvested, color: COLORS.invested },
    { name: 'Returns Earned', value: results.estimatedReturns, color: COLORS.returns },
    { name: 'Inflation Impact', value: results.inflationImpact, color: COLORS.inflationImpact }
  ] : [];

  const goalPlannerData = showGoalPlanner ? calculateGoalSIP() : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      {/* Input Section */}
      <Card className="p-6 md:p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-xl" data-testid="sip-input-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100" style={{fontFamily: 'Manrope, sans-serif'}}>
            SIP Calculator
          </h2>
          <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="space-y-6">
          {/* Monthly Investment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Monthly Investment (₹)</Label>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Amount you plan to invest every month</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
            <Input
              type="number"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="text-lg font-semibold h-12 bg-white dark:bg-slate-900"
              data-testid="sip-monthly-investment-input"
            />
            <Slider
              value={[monthlyInvestment]}
              onValueChange={([value]) => setMonthlyInvestment(value)}
              min={500}
              max={100000}
              step={500}
              className="mt-2"
              data-testid="sip-monthly-investment-slider"
            />
          </div>

          {/* Expected Return */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Expected Return (%)</Label>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{expectedReturn}%</span>
            </div>
            <Slider
              value={[expectedReturn]}
              onValueChange={([value]) => setExpectedReturn(value)}
              min={1}
              max={30}
              step={0.5}
              data-testid="sip-expected-return-slider"
            />
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Duration (Years)</Label>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{duration} years</span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={([value]) => setDuration(value)}
              min={1}
              max={40}
              step={1}
              data-testid="sip-duration-slider"
            />
          </div>

          {/* Step-up */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Step-up (%)</Label>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{stepUp}%</span>
            </div>
            <Slider
              value={[stepUp]}
              onValueChange={([value]) => setStepUp(value)}
              min={0}
              max={20}
              step={1}
              data-testid="sip-stepup-slider"
            />
          </div>

          {/* Inflation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Inflation (%)</Label>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{inflation}%</span>
            </div>
            <Slider
              value={[inflation]}
              onValueChange={([value]) => setInflation(value)}
              min={0}
              max={15}
              step={0.5}
              data-testid="sip-inflation-slider"
            />
          </div>

          {/* Risk Profile */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Risk Profile</Label>
            <Select value={riskProfile} onValueChange={setRiskProfile}>
              <SelectTrigger className="h-12 bg-white dark:bg-slate-900" data-testid="sip-risk-profile-select">
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
            onClick={calculateSIP}
            className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            data-testid="sip-calculate-btn"
          >
            Calculate Returns
          </Button>
        </div>
      </Card>

      {/* Results Section */}
      <div className="space-y-6">
        <Card className="p-6 md:p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-xl" data-testid="sip-results-card">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6" style={{fontFamily: 'Manrope, sans-serif'}}>
            Results
          </h2>

          {results ? (
            <div className="space-y-6">
              {/* Output Values */}
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Invested</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="sip-total-invested">
                    {formatINR(results.totalInvested)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Estimated Returns</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="sip-estimated-returns">
                    {formatINR(results.estimatedReturns)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="sip-total-value">
                    {formatINR(results.totalValue)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Inflation-Adjusted Value</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="sip-inflation-adjusted">
                    {formatINR(results.inflationAdjustedValue)}
                  </p>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confidence Level</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100" data-testid="sip-confidence-level">{results.confidence}%</p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${results.confidence}%` }}
                  ></div>
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

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Dialog open={showGoalPlanner} onOpenChange={setShowGoalPlanner}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1" data-testid="sip-goal-planner-btn">
                      <Target className="w-4 h-4 mr-2" />
                      Goal Planner
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-slate-800">
                    <DialogHeader>
                      <DialogTitle>Goal Planner</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Target Amount (₹)</Label>
                        <Input
                          type="number"
                          value={targetAmount}
                          onChange={(e) => setTargetAmount(Number(e.target.value))}
                          className="mt-2"
                          data-testid="goal-target-amount-input"
                        />
                      </div>
                      {goalPlannerData && (
                        <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Required Monthly SIP</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="goal-required-sip">
                              {formatINR(goalPlannerData.requiredMonthlySIP)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Probability of Achievement</p>
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="goal-probability">
                              {goalPlannerData.probability}%
                            </p>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Based on your risk profile and expected returns, you need to invest {formatINR(goalPlannerData.requiredMonthlySIP)} monthly to reach your target of {formatINR(targetAmount)} in {duration} years.
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={exportToPDF} data-testid="sip-export-pdf-btn">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" onClick={exportToExcel} data-testid="sip-export-excel-btn">
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Enter your investment details and click Calculate Returns</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}