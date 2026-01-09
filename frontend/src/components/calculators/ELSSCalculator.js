import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ELSSCalculator() {
  const [investment, setInvestment] = useState(150000);
  const [taxSlab, setTaxSlab] = useState(30);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [duration, setDuration] = useState(3);
  const [results, setResults] = useState(null);

  const calculate = () => {
    const maxDeduction = Math.min(investment, 150000);
    const taxSaved = (maxDeduction * taxSlab) / 100;
    const futureValue = investment * Math.pow(1 + expectedReturn / 100, duration);
    const totalReturns = futureValue - investment;
    const totalBenefit = taxSaved + totalReturns;
    
    setResults({
      investment: Math.round(investment),
      taxSaved: Math.round(taxSaved),
      futureValue: Math.round(futureValue),
      totalReturns: Math.round(totalReturns),
      totalBenefit: Math.round(totalBenefit)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-8 bg-white dark:bg-slate-900 shadow-2xl border-2 border-slate-200 dark:border-slate-800" data-testid="elss-input-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100" style={{fontFamily: 'Manrope, sans-serif'}}>
            ELSS Tax Saver
          </h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Investment Amount (₹)</Label>
            <Input
              type="number"
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              className="text-lg font-bold h-14 bg-slate-50 dark:bg-slate-800 border-2"
              data-testid="elss-investment-input"
            />
            <Slider
              value={[investment]}
              onValueChange={([value]) => setInvestment(value)}
              min={10000}
              max={500000}
              step={10000}
            />
            <p className="text-xs text-slate-500">Max deduction under 80C: ₹1,50,000</p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tax Slab (%)</Label>
            <Select value={String(taxSlab)} onValueChange={(v) => setTaxSlab(Number(v))}>
              <SelectTrigger className="h-14 font-bold bg-slate-50 dark:bg-slate-800 border-2" data-testid="elss-tax-slab-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5% (₹2.5L - ₹5L)</SelectItem>
                <SelectItem value="10">10% (₹5L - ₹7.5L)</SelectItem>
                <SelectItem value="15">15% (₹7.5L - ₹10L)</SelectItem>
                <SelectItem value="20">20% (₹10L - ₹12.5L)</SelectItem>
                <SelectItem value="25">25% (₹12.5L - ₹15L)</SelectItem>
                <SelectItem value="30">30% (Above ₹15L)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Expected Return (%)</Label>
              <span className="text-sm font-black text-green-600 dark:text-green-400">{expectedReturn}%</span>
            </div>
            <Slider
              value={[expectedReturn]}
              onValueChange={([value]) => setExpectedReturn(value)}
              min={1}
              max={25}
              step={0.5}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Lock-in Period (Years)</Label>
              <span className="text-sm font-black text-green-600 dark:text-green-400">{duration} years</span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={([value]) => setDuration(value)}
              min={3}
              max={15}
              step={1}
            />
          </div>

          <Button
            onClick={calculate}
            className="w-full h-14 text-lg font-black bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl shadow-xl"
            data-testid="elss-calculate-btn"
          >
            Calculate Tax Savings
          </Button>
        </div>
      </Card>

      <Card className="p-8 bg-white dark:bg-slate-900 shadow-2xl border-2 border-slate-200 dark:border-slate-800" data-testid="elss-results-card">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6" style={{fontFamily: 'Manrope, sans-serif'}}>
          Results
        </h2>

        {results ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-2 border-green-200 dark:border-green-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-semibold">Tax Saved</p>
              <p className="text-4xl font-black text-green-600 dark:text-green-400" data-testid="elss-tax-saved">
                {formatINR(results.taxSaved)}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-semibold">Investment Returns</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100" data-testid="elss-returns">
                {formatINR(results.totalReturns)}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-semibold">Future Value</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100" data-testid="elss-future-value">
                {formatINR(results.futureValue)}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-semibold">Total Benefit (Tax + Returns)</p>
              <p className="text-4xl font-black text-purple-600 dark:text-purple-400" data-testid="elss-total-benefit">
                {formatINR(results.totalBenefit)}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Enter details to calculate tax savings</p>
          </div>
        )}
      </Card>
    </div>
  );
}