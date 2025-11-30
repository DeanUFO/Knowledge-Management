import React, { useState } from 'react';
import { Clock, Edit, ArrowLeft, Calendar, Tag, User, ShieldAlert } from 'lucide-react';
import { Document, UserRole, DocVersion } from '../types';
import { getCurrentUser } from '../services/storageService';

interface DocumentViewProps {
  doc: Document;
  onBack: () => void;
  onEdit: (doc: Document) => void;
}

const DocumentView: React.FC<DocumentViewProps> = ({ doc, onBack, onEdit }) => {
  const [activeVersion, setActiveVersion] = useState<string | null>(null);
  const currentUser = getCurrentUser();

  // Simple permission check
  const canEdit = currentUser.role === UserRole.ADMIN || 
                  (currentUser.role === UserRole.EDITOR && doc.accessLevel !== UserRole.ADMIN);

  const displayedContent = activeVersion 
    ? doc.history.find(v => v.versionId === activeVersion)?.content 
    : doc.content;

  const displayedDate = activeVersion
    ? doc.history.find(v => v.versionId === activeVersion)?.updatedAt
    : doc.updatedAt;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[calc(100vh-6rem)] flex flex-col md:flex-row overflow-hidden">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
           <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
             <ArrowLeft className="w-4 h-4 mr-1" />
             Back
           </button>
           
           <div className="flex gap-2">
             {!canEdit && (
               <span className="flex items-center px-3 py-1 bg-amber-50 text-amber-600 text-xs rounded-full border border-amber-200">
                 <ShieldAlert className="w-3 h-3 mr-1" />
                 唯讀 (Read Only)
               </span>
             )}
             {canEdit && !activeVersion && (
               <button 
                 onClick={() => onEdit(doc)}
                 className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
               >
                 <Edit className="w-4 h-4 mr-2" />
                 編輯文件
               </button>
             )}
             {activeVersion && (
                <button 
                  onClick={() => setActiveVersion(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm font-medium"
                >
                  回到最新版本
                </button>
             )}
           </div>
        </div>

        <div className="p-8 md:p-12 overflow-auto max-w-4xl mx-auto w-full">
           <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded uppercase tracking-wide">
                  {doc.category}
                </span>
                {activeVersion && (
                   <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                     歷史版本預覽
                   </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{doc.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 border-b border-slate-100 pb-6">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1.5" />
                  {doc.createdBy}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  {new Date(displayedDate || '').toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                   {doc.tags.map(t => (
                     <span key={t} className="flex items-center text-slate-400">
                       # {t}
                     </span>
                   ))}
                </div>
              </div>
           </div>

           <div className="prose prose-slate prose-lg max-w-none">
              {displayedContent?.split('\n').map((line, i) => (
                <div key={i} className="min-h-[1.5em]">
                  {line.startsWith('# ') ? <h1 className="text-2xl font-bold mt-6 mb-4">{line.replace('# ', '')}</h1> :
                   line.startsWith('## ') ? <h2 className="text-xl font-bold mt-5 mb-3">{line.replace('## ', '')}</h2> :
                   line.startsWith('- ') ? <li className="ml-4 list-disc">{line.replace('- ', '')}</li> :
                   <p className="mb-4">{line}</p>}
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Version Sidebar */}
      <div className="w-full md:w-72 bg-slate-50 border-l border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 font-semibold text-slate-700 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          版本歷史
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {/* Current Version */}
           <div 
             onClick={() => setActiveVersion(null)}
             className={`p-3 rounded-lg border cursor-pointer transition-all
               ${!activeVersion ? 'bg-white border-indigo-200 ring-1 ring-indigo-500 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300 opacity-60'}`}
           >
             <div className="flex justify-between items-start mb-1">
               <span className="text-xs font-bold text-indigo-600">最新版本</span>
               <span className="text-xs text-slate-400">{new Date(doc.updatedAt).toLocaleDateString()}</span>
             </div>
             <p className="text-xs text-slate-600">Current</p>
           </div>

           {/* History */}
           {doc.history.map((ver) => (
             <div 
               key={ver.versionId}
               onClick={() => setActiveVersion(ver.versionId)}
               className={`p-3 rounded-lg border cursor-pointer transition-all
                 ${activeVersion === ver.versionId ? 'bg-white border-indigo-200 ring-1 ring-indigo-500 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
             >
               <div className="flex justify-between items-start mb-1">
                 <span className="text-xs font-medium text-slate-700">歷史存檔</span>
                 <span className="text-xs text-slate-400">{new Date(ver.updatedAt).toLocaleDateString()}</span>
               </div>
               <p className="text-xs text-slate-500 truncate">Edited by {ver.updatedBy}</p>
             </div>
           ))}
           
           {doc.history.length === 0 && (
             <p className="text-xs text-slate-400 text-center py-4">無歷史版本</p>
           )}
        </div>
      </div>

    </div>
  );
};

export default DocumentView;