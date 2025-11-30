import React, { useState } from 'react';
import { FileText, Calendar, User, ArrowRight, Lock } from 'lucide-react';
import { Document, UserRole } from '../types';

interface DocumentListProps {
  documents: Document[];
  onSelect: (doc: Document) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onSelect }) => {
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(documents.map(d => d.category)))];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(filter.toLowerCase()) || 
                          doc.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜尋文件標題或標籤..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setCategoryFilter(cat)}
               className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                 ${categoryFilter === cat 
                   ? 'bg-indigo-600 text-white shadow-sm' 
                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
             >
               {cat}
             </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map(doc => (
          <div 
            key={doc.id}
            onClick={() => onSelect(doc)}
            className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all cursor-pointer flex flex-col h-full relative"
          >
            {/* Access Badge */}
            <div className="absolute top-4 right-4">
               {doc.accessLevel === UserRole.ADMIN && <Lock className="w-4 h-4 text-red-400" />}
               {doc.accessLevel === UserRole.EDITOR && <Lock className="w-4 h-4 text-yellow-400" />}
            </div>

            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded">
                {doc.category}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
              {doc.title}
            </h3>
            
            <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
              {doc.content.replace(/[#*`]/g, '')}
            </p>

            <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
               <div className="flex items-center text-xs text-slate-400 gap-3">
                 <div className="flex items-center">
                   <User className="w-3 h-3 mr-1" />
                   {doc.createdBy}
                 </div>
                 <div className="flex items-center">
                   <Calendar className="w-3 h-3 mr-1" />
                   {new Date(doc.updatedAt).toLocaleDateString()}
                 </div>
               </div>
               
               <div className="flex flex-wrap gap-1 mt-1">
                 {doc.tags.slice(0, 3).map(t => (
                   <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-slate-500">
                     #{t}
                   </span>
                 ))}
               </div>
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            <p>沒有找到符合的文件。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;