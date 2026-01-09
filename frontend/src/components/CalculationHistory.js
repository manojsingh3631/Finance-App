import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Trash2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
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
  }\n\n  return (\n    <div className=\"space-y-6\">\n      <div className=\"text-center mb-8\">\n        <h2 className=\"text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 mb-3\" style={{fontFamily: 'Manrope, sans-serif'}}>\n          Calculation History\n        </h2>\n        <p className=\"text-lg text-slate-600 dark:text-slate-400\">Your saved financial calculations</p>\n      </div>\n\n      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n        {calculations.map((calc) => (\n          <Card\n            key={calc.id}\n            className=\"p-6 bg-white dark:bg-slate-900 shadow-xl border-2 border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300\"\n            data-testid={`calculation-${calc.id}`}\n          >\n            <div className=\"flex items-start justify-between mb-4\">\n              <div className=\"flex items-center gap-3\">\n                {getCalculatorIcon(calc.calculator_type)}\n                <div>\n                  <h3 className=\"text-lg font-bold text-slate-800 dark:text-slate-100\">\n                    {calc.name || calc.calculator_type.toUpperCase()}\n                  </h3>\n                  <p className=\"text-xs text-slate-500\">\n                    {new Date(calc.timestamp).toLocaleDateString('en-IN', {\n                      year: 'numeric',\n                      month: 'short',\n                      day: 'numeric',\n                      hour: '2-digit',\n                      minute: '2-digit',\n                    })}\n                  </p>\n                </div>\n              </div>\n              <Button\n                variant=\"ghost\"\n                size=\"sm\"\n                onClick={() => deleteCalculation(calc.id)}\n                className=\"text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30\"\n                data-testid={`delete-calculation-${calc.id}`}\n              >\n                <Trash2 className=\"w-4 h-4\" />\n              </Button>\n            </div>\n\n            <div className=\"space-y-2 text-sm\">\n              {calc.calculator_type === 'sip' && (\n                <>\n                  <div className=\"flex justify-between\">\n                    <span className=\"text-slate-600 dark:text-slate-400\">Monthly Investment:</span>\n                    <span className=\"font-bold text-slate-800 dark:text-slate-100\">\n                      {formatINR(calc.inputs.monthlyInvestment)}\n                    </span>\n                  </div>\n                  <div className=\"flex justify-between\">\n                    <span className=\"text-slate-600 dark:text-slate-400\">Duration:</span>\n                    <span className=\"font-bold text-slate-800 dark:text-slate-100\">\n                      {calc.inputs.duration} years\n                    </span>\n                  </div>\n                  <div className=\"flex justify-between border-t pt-2 mt-2\">\n                    <span className=\"text-slate-600 dark:text-slate-400\">Total Value:</span>\n                    <span className=\"font-bold text-blue-600 dark:text-blue-400\">\n                      {formatINR(calc.outputs.totalValue)}\n                    </span>\n                  </div>\n                </>\n              )}\n\n              {calc.calculator_type === 'swp' && (\n                <>\n                  <div className=\"flex justify-between\">\n                    <span className=\"text-slate-600 dark:text-slate-400\">Lumpsum:</span>\n                    <span className=\"font-bold text-slate-800 dark:text-slate-100\">\n                      {formatINR(calc.inputs.lumpsumInvestment)}\n                    </span>\n                  </div>\n                  <div className=\"flex justify-between\">\n                    <span className=\"text-slate-600 dark:text-slate-400\">Duration:</span>\n                    <span className=\"font-bold text-slate-800 dark:text-slate-100\">\n                      {calc.inputs.duration} years\n                    </span>\n                  </div>\n                  <div className=\"flex justify-between border-t pt-2 mt-2\">\n                    <span className=\"text-slate-600 dark:text-slate-400\">Remaining Value:</span>\n                    <span className=\"font-bold text-emerald-600 dark:text-emerald-400\">\n                      {formatINR(calc.outputs.remainingValue)}\n                    </span>\n                  </div>\n                </>\n              )}\n            </div>\n          </Card>\n        ))}\n      </div>\n    </div>\n  );\n}"