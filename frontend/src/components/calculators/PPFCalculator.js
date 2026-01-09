import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { PiggyBank } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const COLORS = { invested: '#3b82f6', returns: '#10b981' };

export default function PPFCalculator() {
  const [yearlyDeposit, setYearlyDeposit] = useState(150000);
  const [interestRate, setInterestRate] = useState(7.1);
  const [duration, setDuration] = useState(15);
  const [results, setResults] = useState(null);

  const calculate = () => {
    let balance = 0;
    let totalDeposited = 0;
    
    for (let year = 1; year <= duration; year++) {
      balance += yearlyDeposit;
      totalDeposited += yearlyDeposit;
      balance = balance * (1 + interestRate / 100);
    }
    
    const totalInterest = balance - totalDeposited;
    
    setResults({
      totalDeposited: Math.round(totalDeposited),
      totalInterest: Math.round(totalInterest),
      maturityValue: Math.round(balance)
    });
  };

  const chartData = results ? [
    { name: 'Total Deposited', value: results.totalDeposited, color: COLORS.invested },
    { name: 'Interest Earned', value: results.totalInterest, color: COLORS.returns }
  ] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-8 bg-white dark:bg-slate-900 shadow-2xl border-2 border-slate-200 dark:border-slate-800" data-testid="ppf-input-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100" style={{fontFamily: 'Manrope, sans-serif'}}>
            PPF Calculator
          </h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Yearly Deposit (₹)</Label>
            <Input
              type="number"
              value={yearlyDeposit}
              onChange={(e) => setYearlyDeposit(Number(e.target.value))}
              className="text-lg font-bold h-14 bg-slate-50 dark:bg-slate-800 border-2"
              data-testid="ppf-yearly-deposit-input"
            />
            <Slider
              value={[yearlyDeposit]}
              onValueChange={([value]) => setYearlyDeposit(value)}
              min={500}
              max={150000}
              step={500}
            />
            <p className="text-xs text-slate-500">Max: ₹1,50,000 per year</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Interest Rate (% p.a.)</Label>
              <span className="text-sm font-black text-pink-600 dark:text-pink-400">{interestRate}%</span>
            </div>
            <Slider
              value={[interestRate]}
              onValueChange={([value]) => setInterestRate(value)}
              min={7}
              max={9}
              step={0.1}
            />
            <p className="text-xs text-slate-500">Current rate: 7.1% (subject to change)</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Duration (Years)</Label>
              <span className="text-sm font-black text-pink-600 dark:text-pink-400">{duration} years</span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={([value]) => setDuration(value)}
              min={15}
              max={50}
              step={1}
            />
          </div>

          <Button
            onClick={calculate}
            className="w-full h-14 text-lg font-black bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-2xl shadow-xl"
            data-testid="ppf-calculate-btn"
          >
            Calculate PPF Returns
          </Button>
        </div>
      </Card>

      <Card className="p-8 bg-white dark:bg-slate-900 shadow-2xl border-2 border-slate-200 dark:border-slate-800" data-testid="ppf-results-card">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6" style={{fontFamily: 'Manrope, sans-serif'}}>
          Results
        </h2>

        {results ? (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-semibold">Total Deposited</p>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400" data-testid="ppf-total-deposited">
                  {formatINR(results.totalDeposited)}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-semibold">Interest Earned</p>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400" data-testid="ppf-interest-earned">
                  {formatINR(results.totalInterest)}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 border-2 border-pink-200 dark:border-pink-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-semibold">Maturity Value</p>
                <p className="text-4xl font-black text-pink-600 dark:text-pink-400" data-testid="ppf-maturity-value">
                  {formatINR(results.maturityValue)}
                </p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
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
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <PiggyBank className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Enter PPF details to calculate returns</p>
          </div>
        )}
      </Card>
    </div>
  );
}