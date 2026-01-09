import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Coins } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const COLORS = { invested: '#3b82f6', returns: '#10b981' };

export default function LumpsumCalculator() {
  const [investment, setInvestment] = useState(100000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [duration, setDuration] = useState(5);
  const [results, setResults] = useState(null);

  const calculate = () => {
    const futureValue = investment * Math.pow(1 + expectedReturn / 100, duration);
    const totalReturns = futureValue - investment;
    
    setResults({
      totalInvested: Math.round(investment),
      estimatedReturns: Math.round(totalReturns),
      totalValue: Math.round(futureValue)
    });
  };

  const chartData = results ? [
    { name: 'Invested', value: results.totalInvested, color: COLORS.invested },
    { name: 'Returns', value: results.estimatedReturns, color: COLORS.returns }
  ] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-8 bg-white dark:bg-slate-900 shadow-2xl border-2 border-slate-200 dark:border-slate-800" data-testid="lumpsum-input-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100" style={{fontFamily: 'Manrope, sans-serif'}}>
            Lumpsum Calculator
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
              data-testid="lumpsum-investment-input"
            />
            <Slider
              value={[investment]}
              onValueChange={([value]) => setInvestment(value)}
              min={10000}
              max={10000000}
              step={10000}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Expected Return (%)</Label>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">{expectedReturn}%</span>
            </div>
            <Slider
              value={[expectedReturn]}
              onValueChange={([value]) => setExpectedReturn(value)}
              min={1}
              max={30}
              step={0.5}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Duration (Years)</Label>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">{duration} years</span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={([value]) => setDuration(value)}
              min={1}
              max={30}
              step={1}
            />
          </div>

          <Button
            onClick={calculate}
            className="w-full h-14 text-lg font-black bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-xl"
            data-testid="lumpsum-calculate-btn"
          >
            Calculate
          </Button>
        </div>
      </Card>

      <Card className="p-8 bg-white dark:bg-slate-900 shadow-2xl border-2 border-slate-200 dark:border-slate-800" data-testid="lumpsum-results-card">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6" style={{fontFamily: 'Manrope, sans-serif'}}>
          Results
        </h2>

        {results ? (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-semibold">Total Invested</p>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400" data-testid="lumpsum-total-invested">
                  {formatINR(results.totalInvested)}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-semibold">Estimated Returns</p>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400" data-testid="lumpsum-estimated-returns">
                  {formatINR(results.estimatedReturns)}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-semibold">Total Value</p>
                <p className="text-3xl font-black text-purple-600 dark:text-purple-400" data-testid="lumpsum-total-value">
                  {formatINR(results.totalValue)}
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
            <Coins className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Enter investment details and click Calculate</p>
          </div>
        )}
      </Card>
    </div>
  );
}