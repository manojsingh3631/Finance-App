import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const COLORS = { principal: '#3b82f6', interest: '#ef4444' };

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(10);
  const [results, setResults] = useState(null);

  const calculate = () => {
    const monthlyRate = interestRate / 100 / 12;
    const months = tenure * 12;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - loanAmount;
    
    setResults({
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      principal: Math.round(loanAmount)
    });
  };

  const chartData = results ? [
    { name: 'Principal', value: results.principal, color: COLORS.principal },
    { name: 'Interest', value: results.totalInterest, color: COLORS.interest }
  ] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-8 bg-white dark:bg-slate-900 shadow-2xl border-2 border-slate-200 dark:border-slate-800" data-testid="emi-input-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100" style={{fontFamily: 'Manrope, sans-serif'}}>
            EMI Calculator
          </h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Loan Amount (₹)</Label>
            <Input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="text-lg font-bold h-14 bg-slate-50 dark:bg-slate-800 border-2"
              data-testid="emi-loan-amount-input"
            />
            <Slider
              value={[loanAmount]}
              onValueChange={([value]) => setLoanAmount(value)}
              min={100000}
              max={10000000}
              step={50000}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Interest Rate (% p.a.)</Label>
              <span className="text-sm font-black text-purple-600 dark:text-purple-400">{interestRate}%</span>
            </div>
            <Slider
              value={[interestRate]}
              onValueChange={([value]) => setInterestRate(value)}
              min={1}
              max={20}
              step={0.1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Loan Tenure (Years)</Label>
              <span className="text-sm font-black text-purple-600 dark:text-purple-400">{tenure} years</span>
            </div>
            <Slider
              value={[tenure]}
              onValueChange={([value]) => setTenure(value)}
              min={1}
              max={30}
              step={1}
            />
          </div>

          <Button
            onClick={calculate}
            className="w-full h-14 text-lg font-black bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl shadow-xl"
            data-testid="emi-calculate-btn"
          >
            Calculate EMI
          </Button>
        </div>
      </Card>

      <Card className="p-8 bg-white dark:bg-slate-900 shadow-2xl border-2 border-slate-200 dark:border-slate-800" data-testid="emi-results-card">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6" style={{fontFamily: 'Manrope, sans-serif'}}>
          Results
        </h2>

        {results ? (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-semibold">Monthly EMI</p>
                <p className="text-4xl font-black text-purple-600 dark:text-purple-400" data-testid="emi-monthly">
                  {formatINR(results.emi)}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-semibold">Total Payment</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100" data-testid="emi-total-payment">
                  {formatINR(results.totalPayment)}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-semibold">Total Interest</p>
                <p className="text-2xl font-black text-red-600 dark:text-red-400" data-testid="emi-total-interest">
                  {formatINR(results.totalInterest)}
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
            <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Enter loan details to calculate EMI</p>
          </div>
        )}
      </Card>
    </div>
  );
}