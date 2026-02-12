import React, { useState } from 'react';
import { Sparkles, RefreshCw, AlertOctagon } from 'lucide-react';
import { analyzePourData } from '../services/geminiService';
import { PourRecord, Supplier, Location, ConcreteType } from '../types';
import ReactMarkdown from 'react-markdown';

interface AIReportProps {
  pours: PourRecord[];
  suppliers: Supplier[];
  locations: Location[];
  concreteTypes: ConcreteType[];
}

export const AIReport: React.FC<AIReportProps> = ({ pours, suppliers, locations, concreteTypes }) => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
        setReport("⚠️ Erro: API Key do Google Gemini não encontrada. Por favor, configure o ambiente.");
        return;
    }

    setLoading(true);
    setReport('');
    
    try {
        const result = await analyzePourData(pours, suppliers, locations, concreteTypes);
        setReport(result);
    } catch (err) {
        setReport("Erro ao gerar relatório. Tente novamente.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[50vh]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">IA Engenheiro</h2>
            <p className="text-xs text-gray-500">Análise inteligente de dados</p>
          </div>
        </div>
      </div>

      {!report && !loading && (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Use a inteligência artificial do Gemini para analisar padrões de desperdício, 
            avaliar fornecedores e receber sugestões de melhoria baseadas no histórico da sua obra.
          </p>
          <button 
            onClick={handleGenerate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-purple-200 transition-all active:scale-95 flex items-center gap-2 mx-auto"
          >
            <Sparkles size={18} />
            Gerar Relatório de Análise
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <RefreshCw className="animate-spin text-purple-600" size={32} />
          <p className="text-sm text-gray-500 animate-pulse">Analisando volumes, slumps e fornecedores...</p>
        </div>
      )}

      {report && (
        <div className="animate-fade-in">
          <div className="prose prose-sm prose-purple max-w-none bg-gray-50 p-4 rounded-lg border border-gray-100">
             <ReactMarkdown>{report}</ReactMarkdown>
          </div>
          <button 
            onClick={handleGenerate}
            className="mt-4 text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
          >
            <RefreshCw size={14} />
            Gerar Nova Análise
          </button>
        </div>
      )}
    </div>
  );
};