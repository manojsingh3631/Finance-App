import { Card } from "@/components/ui/card";
import { Calculator, TrendingUp, Coins, Home, PiggyBank, CreditCard, Clock, Shield } from "lucide-react";
import { useState } from "react";
import LumpsumCalculator from "@/components/calculators/LumpsumCalculator";
import ELSSCalculator from "@/components/calculators/ELSSCalculator";
import DelayedSIPCalculator from "@/components/calculators/DelayedSIPCalculator";
import EMICalculator from "@/components/calculators/EMICalculator";
import PPFCalculator from "@/components/calculators/PPFCalculator";

const tools = [
  {
    id: "lumpsum",
    name: "Lumpsum",
    description: "Calculate returns on one-time investment",
    icon: Coins,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "elss",
    name: "ELSS Tax Saver",
    description: "Calculate tax savings with ELSS funds",
    icon: Shield,
    color: "from-green-500 to-green-600",
  },
  {
    id: "delayed-sip",
    name: "Delayed SIP Cost",
    description: "Impact of starting SIP later",
    icon: Clock,
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "emi",
    name: "EMI Calculator",
    description: "Calculate loan EMI and interest",
    icon: CreditCard,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "ppf",
    name: "PPF Calculator",
    description: "Public Provident Fund returns",
    icon: PiggyBank,
    color: "from-pink-500 to-pink-600",
  },
];

export default function MoreTools() {
  const [selectedTool, setSelectedTool] = useState(null);

  if (selectedTool) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedTool(null)}
          className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-2"
          data-testid="back-to-tools-btn"
        >
          ← Back to Tools
        </button>
        {selectedTool === "lumpsum" && <LumpsumCalculator />}
        {selectedTool === "elss" && <ELSSCalculator />}
        {selectedTool === "delayed-sip" && <DelayedSIPCalculator />}
        {selectedTool === "emi" && <EMICalculator />}
        {selectedTool === "ppf" && <PPFCalculator />}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 mb-3" style={{fontFamily: 'Manrope, sans-serif'}}>
          More Financial Tools
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">Explore additional calculators for comprehensive financial planning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className="p-6 cursor-pointer hover:scale-105 transition-all duration-300 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xl hover:shadow-2xl"
              data-testid={`tool-${tool.id}-card`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                {tool.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {tool.description}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}