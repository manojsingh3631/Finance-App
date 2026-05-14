import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ComparisonView({ sipData, swpData }) {
  if (!sipData && !swpData) {
    return (
      <Card className="p-8 md:p-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-xl" data-testid="comparison-empty-state">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2" style={{fontFamily: 'Manrope, sans-serif'}}>
            No Data to Compare
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Calculate both SIP and SWP returns to see a comparison
          </p>
        </div>
      </Card>
    );
  }

  const getSuitabilityAnalysis = () => {
    if (!sipData || !swpData) return null;

    const sipFinalValue = sipData.outputs.totalValue;
    const swpRemainingValue = swpData.outputs.remainingValue;
    const swpExhausted = swpData.outputs.exhausted;

    let recommendation = "";
    let suitability = "";

    if (swpExhausted) {
      recommendation = "SIP is recommended as your SWP strategy will exhaust funds before the planned duration.";
      suitability = "SIP";
    } else if (sipFinalValue > swpRemainingValue * 2) {
      recommendation = "SIP strategy shows significantly better wealth accumulation for long-term goals.";
      suitability = "SIP";
    } else if (swpRemainingValue > sipFinalValue) {
      recommendation = "SWP strategy maintains higher portfolio value while providing regular income.";
      suitability = "SWP";
    } else {
      recommendation = "Both strategies show comparable results. Choose based on your income needs.";
      suitability = "Balanced";
    }

    return { recommendation, suitability };
  };

  const analysis = getSuitabilityAnalysis();

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-xl" data-testid="comparison-card">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100" style={{fontFamily: 'Manrope, sans-serif'}}>
            SIP vs SWP Comparison
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SIP Summary */}
          {sipData ? (
            <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-800" data-testid="comparison-sip-summary">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-600">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">SIP Strategy</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Monthly Investment</span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100 text-right break-words" data-testid="comparison-sip-monthly">
                    {formatINR(sipData.inputs.monthlyInvestment)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Invested</span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100 text-right break-words" data-testid="comparison-sip-invested">
                    {formatINR(sipData.outputs.totalInvested)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Returns Earned</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 text-right break-words" data-testid="comparison-sip-returns">
                    {formatINR(sipData.outputs.estimatedReturns)}
                  </span>
                </div>
                <div className="pt-3 border-t-2 border-blue-300 dark:border-blue-700">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Final Portfolio Value</span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400 text-right break-words" data-testid="comparison-sip-final">
                      {formatINR(sipData.outputs.totalValue)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Inflation-Adjusted</span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100 text-right break-words" data-testid="comparison-sip-inflation-adjusted">
                    {formatINR(sipData.outputs.inflationAdjustedValue)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center" data-testid="comparison-sip-missing">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-400 opacity-50" />
                <p className="text-slate-600 dark:text-slate-400">Calculate SIP first</p>
              </div>
            </div>
          )}

          {/* SWP Summary */}
          {swpData ? (
            <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800" data-testid="comparison-swp-summary">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-600">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">SWP Strategy</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Initial Investment</span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100 text-right break-words" data-testid="comparison-swp-initial">
                    {formatINR(swpData.inputs.lumpsumInvestment)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Monthly Withdrawal</span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100 text-right break-words" data-testid="comparison-swp-monthly">
                    {formatINR(swpData.inputs.monthlyWithdrawal)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Withdrawals</span>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400 text-right break-words" data-testid="comparison-swp-withdrawals">
                    {formatINR(swpData.outputs.totalWithdrawals)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Returns Earned</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 text-right break-words" data-testid="comparison-swp-returns">
                    {formatINR(swpData.outputs.returnsEarned)}
                  </span>
                </div>
                <div className="pt-3 border-t-2 border-emerald-300 dark:border-emerald-700">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Remaining Value</span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 text-right break-words" data-testid="comparison-swp-remaining">
                      {formatINR(swpData.outputs.remainingValue)}
                    </span>
                  </div>
                </div>
                {swpData.outputs.exhausted && (
                  <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-xs text-red-800 dark:text-red-300">
                      Portfolio exhausted in {Math.floor(swpData.outputs.exhaustionMonth / 12)}y {swpData.outputs.exhaustionMonth % 12}m
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center" data-testid="comparison-swp-missing">
              <div className="text-center">
                <TrendingDown className="w-12 h-12 mx-auto mb-3 text-slate-400 opacity-50" />
                <p className="text-slate-600 dark:text-slate-400">Calculate SWP first</p>
              </div>
            </div>
          )}
        </div>

        {/* Suitability Analysis */}
        {analysis && (
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/20 border-2 border-purple-200 dark:border-purple-800" data-testid="comparison-analysis">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Suitability Analysis</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-600 mt-1">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Recommended Strategy</p>
                  <p className="text-base font-bold text-purple-600 dark:text-purple-400" data-testid="comparison-recommended-strategy">{analysis.suitability}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed" data-testid="comparison-recommendation">
                {analysis.recommendation}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}