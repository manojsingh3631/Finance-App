import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { History, Trash2, TrendingUp, TrendingDown, Loader2, Tag, Search, X, StickyNote } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getCalculatorIcon = (type) => {
  switch (type) {
    case 'sip':
      return <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    case 'swp':
      return <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    default:
      return <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
  }
};

export default function CalculationHistory() {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalculations();
  }, []);

  const fetchCalculations = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/calculations`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCalculations(data);
      } else {
        toast.error('Failed to load calculation history');
      }
    } catch (error) {
      console.error('Error fetching calculations:', error);
      toast.error('Error loading calculations');
    } finally {
      setLoading(false);
    }
  };

  const deleteCalculation = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/calculations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setCalculations(calculations.filter((calc) => calc.id !== id));
        toast.success('Calculation deleted');
      } else {
        toast.error('Failed to delete calculation');
      }
    } catch (error) {
      console.error('Error deleting calculation:', error);
      toast.error('Error deleting calculation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (calculations.length === 0) {
    return (
      <Card className="p-12 text-center bg-white dark:bg-slate-900 shadow-xl border-2 border-slate-200 dark:border-slate-800">
        <History className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No Calculations Yet</h3>
        <p className="text-slate-600 dark:text-slate-400">
          Your saved calculations will appear here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 mb-3" style={{fontFamily: 'Manrope, sans-serif'}}>
          Calculation History
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">Your saved financial calculations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {calculations.map((calc) => (
          <Card
            key={calc.id}
            className="p-6 bg-white dark:bg-slate-900 shadow-xl border-2 border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300"
            data-testid={`calculation-${calc.id}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getCalculatorIcon(calc.calculator_type)}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {calc.name || calc.calculator_type.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {new Date(calc.timestamp).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteCalculation(calc.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                data-testid={`delete-calculation-${calc.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 text-sm">
              {calc.calculator_type === 'sip' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Monthly Investment:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {formatINR(calc.inputs.monthlyInvestment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {calc.inputs.duration} years
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-slate-600 dark:text-slate-400">Total Value:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {formatINR(calc.outputs.totalValue)}
                    </span>
                  </div>
                </>
              )}

              {calc.calculator_type === 'swp' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Lumpsum:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {formatINR(calc.inputs.lumpsumInvestment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {calc.inputs.duration} years
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-slate-600 dark:text-slate-400">Remaining Value:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatINR(calc.outputs.remainingValue)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}