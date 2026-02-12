import { GoogleGenAI } from "@google/genai";
import { PourRecord, Supplier, Location, ConcreteType } from '../types';

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzePourData = async (
  pours: PourRecord[],
  suppliers: Supplier[],
  locations: Location[],
  concreteTypes: ConcreteType[]
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "API Key not configured.";

  // Prepare a summarized context for the AI
  const dataContext = JSON.stringify({
    pours: pours.slice(0, 50), // Limit to recent 50 for context window optimization if needed
    suppliers,
    locations,
    concreteTypes
  });

  const prompt = `
    Atue como um engenheiro civil sênior especialista em controle de custos e produção.
    Analise os seguintes dados de concretagem da obra (em formato JSON).
    
    Dados:
    ${dataContext}

    Por favor, forneça um relatório conciso em português (Markdown) abordando:
    1. **Análise de Volume:** Identifique locais com maior consumo de concreto e padrões diários.
    2. **Desempenho de Fornecedores:** Baseado nos comentários (notes) e avaliações (ratings), indique fornecedores com problemas.
    3. **Logística:** Comente sobre horários ou consistência dos lançamentos (se houver dados suficientes).
    4. **Recomendações:** Sugira 3 ações para melhorar o controle logístico ou negociação de insumos.

    Seja direto e use bullet points. Ignore análises sobre Slump ou Volume Programado, pois não estamos controlando mais essas variáveis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar a análise.";
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    return "Erro ao conectar com a inteligência artificial. Verifique sua conexão ou chave de API.";
  }
};