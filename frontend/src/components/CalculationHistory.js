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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedCalc, setSelectedCalc] = useState(null);

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

  // Get all unique tags
  const allTags = [...new Set(calculations.flatMap(calc => calc.tags || []))];

  // Filter calculations
  const filteredCalculations = calculations.filter(calc => {
    const matchesSearch = !searchTerm || 
      calc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calc.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !selectedTag || (calc.tags && calc.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
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

      {/* Search and Filter Bar */}
      <Card className="p-4 bg-white dark:bg-slate-900 shadow-xl border-2 border-slate-200 dark:border-slate-800">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by name or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
              data-testid="search-calculations"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Tag className="w-4 h-4" />
                Filter by tag:
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedTag === null ? "default" : "outline"}
                  className={`cursor-pointer ${selectedTag === null ? 'bg-purple-600 text-white' : ''}`}
                  onClick={() => setSelectedTag(null)}
                  data-testid="tag-filter-all"
                >
                  All ({calculations.length})
                </Badge>
                {allTags.map((tag) => {
                  const count = calculations.filter(c => c.tags && c.tags.includes(tag)).length;
                  return (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      className={`cursor-pointer ${selectedTag === tag ? 'bg-purple-600 text-white' : ''}`}
                      onClick={() => setSelectedTag(tag)}
                      data-testid={`tag-filter-${tag}`}
                    >
                      {tag} ({count})
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Showing {filteredCalculations.length} of {calculations.length} calculations
      </div>

      {filteredCalculations.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-slate-900 shadow-xl border-2 border-slate-200 dark:border-slate-800">
          <History className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {calculations.length === 0 ? 'No Calculations Yet' : 'No Matching Calculations'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {calculations.length === 0 
              ? 'Your saved calculations will appear here'
              : 'Try adjusting your search or filters'
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCalculations.map((calc) => (
          <Card
            key={calc.id}
            className="p-6 bg-white dark:bg-slate-900 shadow-xl border-2 border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300"
            data-testid={`calculation-${calc.id}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
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
                
                {/* Tags */}
                {calc.tags && calc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {calc.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        data-testid={`calc-tag-${tag}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
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

            {/* Notes Preview */}
            {calc.notes && (
              <div className="mb-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <StickyNote className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                    {calc.notes}
                  </p>
                </div>
              </div>
            )}

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