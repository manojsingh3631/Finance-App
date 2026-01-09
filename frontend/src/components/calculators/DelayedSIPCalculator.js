import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DelayedSIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [duration, setDuration] = useState(20);
  const [delay, setDelay] = useState(5);
  const [results, setResults] = useState(null);

  const calculateSIP = (monthly, rate, years) => {
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    const futureValue = monthly * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
    const totalInvested = monthly * months;
    return { futureValue, totalInvested };
  };

  const calculate = () => {
    const onTime = calculateSIP(monthlyInvestment, expectedReturn, duration);
    const delayed = calculateSIP(monthlyInvestment, expectedReturn, duration - delay);
    
    const opportunityCost = onTime.futureValue - delayed.futureValue;
    const percentageLoss = (opportunityCost / onTime.futureValue) * 100;
    
    setResults({
      onTimeFV: Math.round(onTime.futureValue),
      delayedFV: Math.round(delayed.futureValue),
      opportunityCost: Math.round(opportunityCost),
      percentageLoss: percentageLoss.toFixed(2),
      onTimeInvested: Math.round(onTime.totalInvested),
      delayedInvested: Math.round(delayed.totalInvested)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-8 bg-white dark:bg-slate-900 shadow-2xl border-2 border-slate-200 dark:border-slate-800" data-testid="delayed-sip-input-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100" style={{fontFamily: 'Manrope, sans-serif'}}>
            Delayed SIP Cost
          </h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Monthly SIP (₹)</Label>
            <Input
              type="number"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="text-lg font-bold h-14 bg-slate-50 dark:bg-slate-800 border-2"
              data-testid="delayed-sip-monthly-input"
            />
            <Slider
              value={[monthlyInvestment]}
              onValueChange={([value]) => setMonthlyInvestment(value)}
              min={500}
              max={100000}
              step={500}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Expected Return (%)</Label>
              <span className="text-sm font-black text-orange-600 dark:text-orange-400">{expectedReturn}%</span>
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
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Investment Duration (Years)</Label>
              <span className="text-sm font-black text-orange-600 dark:text-orange-400">{duration} years</span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={([value]) => setDuration(value)}
              min={5}
              max={40}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Delay Period (Years)</Label>
              <span className="text-sm font-black text-red-600 dark:text-red-400">{delay} years</span>
            </div>
            <Slider
              value={[delay]}
              onValueChange={([value]) => setDelay(value)}
              min={1}
              max={Math.min(15, duration - 1)}
              step={1}
            />
          </div>

          <Button
            onClick={calculate}
            className="w-full h-14 text-lg font-black bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-xl"
            data-testid="delayed-sip-calculate-btn"
          >
            Calculate Impact
          </Button>
        </div>
      </Card>

      <Card className="p-8 bg-white dark:bg-slate-900 shadow-2xl border-2 border-slate-200 dark:border-slate-800" data-testid="delayed-sip-results-card">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6" style={{fontFamily: 'Manrope, sans-serif'}}>
          Results
        </h2>

        {results ? (
          <div className="space-y-6">
            <Alert className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800" data-testid="delayed-sip-warning">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-300 font-bold">
                Delaying by {delay} years costs you {formatINR(results.opportunityCost)} ({results.percentageLoss}% less)
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-2 border-green-200 dark:border-green-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-semibold">If Started Today</p>
                <p className="text-3xl font-black text-green-600 dark:text-green-400" data-testid="delayed-sip-ontime-value">
                  {formatINR(results.onTimeFV)}
                </p>
                <p className="text-xs text-slate-500 mt-2">Invested: {formatINR(results.onTimeInvested)}</p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-2 border-orange-200 dark:border-orange-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-semibold">If Delayed by {delay} Years</p>
                <p className="text-3xl font-black text-orange-600 dark:text-orange-400" data-testid="delayed-sip-delayed-value">
                  {formatINR(results.delayedFV)}
                </p>
                <p className="text-xs text-slate-500 mt-2">Invested: {formatINR(results.delayedInvested)}</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-2 border-red-200 dark:border-red-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-semibold">Opportunity Cost</p>
                <p className="text-4xl font-black text-red-600 dark:text-red-400" data-testid="delayed-sip-opportunity-cost">
                  {formatINR(results.opportunityCost)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>See the cost of delaying your investments</p>
          </div>
        )}
      </Card>
    </div>
  );
}