import React, { useState } from 'react';
import { Sparkles, Send, Bot, FileText } from 'lucide-react';
import { Document } from '../types';
import { askKnowledgeBase } from '../services/geminiService';

interface AISearchProps {
  documents: Document[];
}

const AISearch: React.FC<AISearchProps> = ({ documents }) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{q: string, a: string}[]>([]);

  const handleAsk = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setAnswer('');
    
    const result = await askKnowledgeBase(query, documents);
    
    setAnswer(result);
    setHistory(prev => [{q: query, a: result}, ...prev]);
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <Sparkles className="w-6 h-6 mr-2" />
          AI 智慧知識助理
        </h2>
        <p className="text-indigo-100 mb-6">
          直接提問，我會閱讀所有內部文件並為您統整答案。
        </p>
        
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="例如：員工報到流程是什麼？ 2025年的產品重點？"
            className="w-full px-5 py-4 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/50 shadow-xl"
            disabled={isLoading}
          />
          <button
            onClick={handleAsk}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto space-y-4 pb-4">
        {answer && (
           <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-sm animate-fade-in">
             <div className="flex items-center mb-3 text-indigo-600 font-semibold">
               <Bot className="w-5 h-5 mr-2" />
               Current Answer
             </div>
             <div className="prose prose-indigo max-w-none text-slate-700 whitespace-pre-wrap">
               {answer}
             </div>
           </div>
        )}

        {history.length > 0 && (
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">近期問答記錄</h3>
            {history.slice(answer ? 0 : 0, 5).map((item, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-4 mb-3 border border-slate-100">
                <p className="font-medium text-slate-800 mb-2 flex items-start">
                   <span className="text-indigo-400 mr-2">Q:</span> {item.q}
                </p>
                <p className="text-sm text-slate-600 flex items-start">
                   <span className="text-slate-400 mr-2">A:</span> {item.a.substring(0, 150)}{item.a.length > 150 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
        
        {history.length === 0 && !answer && (
          <div className="text-center py-12">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-600 font-medium">還沒有問答記錄</h3>
            <p className="text-slate-400 text-sm mt-1">試著問問關於公司政策、流程或專案的問題。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISearch;