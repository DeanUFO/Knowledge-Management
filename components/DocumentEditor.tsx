
import React, { useState, useEffect, useRef } from 'react';
import { Save, Tag, Sparkles, AlertCircle, Upload, X, File, Paperclip } from 'lucide-react';
import { Document, UserRole, Attachment } from '../types';
import { generateDocMetadata } from '../services/geminiService';
import { getCurrentUser } from '../services/storageService';

interface DocumentEditorProps {
  initialDoc?: Document;
  onSave: (doc: Partial<Document>) => void;
  onCancel: () => void;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ initialDoc, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialDoc?.title || '');
  const [content, setContent] = useState(initialDoc?.content || '');
  const [category, setCategory] = useState(initialDoc?.category || 'General');
  const [tags, setTags] = useState<string[]>(initialDoc?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [accessLevel, setAccessLevel] = useState<UserRole>(initialDoc?.accessLevel || UserRole.VIEWER);
  const [attachments, setAttachments] = useState<Attachment[]>(initialDoc?.attachments || []);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = getCurrentUser();

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter(tag => tag !== t));
  };

  const handleAISuggest = async () => {
    if (!content || !title) return;
    setIsGenerating(true);
    const result = await generateDocMetadata(content, title);
    if (result) {
        // Merge tags
        const mergedTags = Array.from(new Set([...tags, ...result.tags]));
        setTags(mergedTags);
    }
    setIsGenerating(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Limit file size to 500KB for LocalStorage safety
    if (file.size > 500 * 1024) {
      alert("檔案大小超過限制 (500KB)。請使用小檔案以上傳至瀏覽器儲存空間。");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: result,
        uploadedAt: new Date().toISOString()
      };
      setAttachments([...attachments, newAttachment]);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleSave = () => {
    if (!title || !content) {
      alert("Title and content are required");
      return;
    }
    onSave({
      id: initialDoc?.id,
      title,
      content,
      category,
      tags,
      accessLevel,
      attachments
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-6rem)]">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800">
          {initialDoc ? '編輯文件' : '新增文件'}
        </h2>
        <div className="flex space-x-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            儲存文件
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Title & Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">文件標題</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              placeholder="輸入標題..."
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">分類 (Category)</label>
             <select 
               value={category} 
               onChange={(e) => setCategory(e.target.value)}
               className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
             >
               <option value="General">General</option>
               <option value="HR">Human Resources</option>
               <option value="Engineering">Engineering</option>
               <option value="Product">Product</option>
               <option value="Sales">Sales</option>
             </select>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">權限管控 (誰可以編輯)</label>
             <select 
               value={accessLevel} 
               onChange={(e) => setAccessLevel(e.target.value as UserRole)}
               className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
             >
               <option value={UserRole.VIEWER}>全員 (Open to all)</option>
               <option value={UserRole.EDITOR}>編輯者 (Editors Only)</option>
               <option value={UserRole.ADMIN}>管理員 (Admins Only)</option>
             </select>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col h-96 md:h-[400px]">
          <div className="flex justify-between items-center mb-1">
             <label className="block text-sm font-medium text-slate-700">內文 (Markdown 支援)</label>
             <button 
               onClick={handleAISuggest}
               disabled={isGenerating || !content}
               className={`flex items-center text-xs px-2 py-1 rounded border transition-colors
                 ${isGenerating ? 'bg-indigo-50 text-indigo-400 border-indigo-100' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}
               `}
             >
               <Sparkles className="w-3 h-3 mr-1" />
               {isGenerating ? 'AI 分析中...' : 'AI 自動標籤'}
             </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm leading-relaxed resize-none"
            placeholder="# 開始撰寫文件...\n\n- 支援 Markdown 語法"
          />
        </div>
        
        {/* Attachments */}
        <div>
           <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700">附件檔案</label>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <Paperclip className="w-3 h-3 mr-1" /> 上傳檔案 (Max 500KB)
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload}
              />
           </div>
           
           <div className="border border-slate-200 rounded-lg bg-slate-50 p-2 min-h-[50px] space-y-2">
              {attachments.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">無附件檔案</p>
              )}
              {attachments.map(file => (
                <div key={file.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                   <div className="flex items-center overflow-hidden">
                      <File className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                      <div className="truncate text-sm text-slate-700">{file.name}</div>
                      <span className="ml-2 text-xs text-slate-400">({Math.round(file.size / 1024)} KB)</span>
                   </div>
                   <button 
                     onClick={() => removeAttachment(file.id)}
                     className="text-slate-400 hover:text-red-500 p-1"
                   >
                     <X className="w-4 h-4" />
                   </button>
                </div>
              ))}
           </div>
        </div>

        {/* Tags */}
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">標籤 (Tags)</label>
           <div className="flex flex-wrap items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50 min-h-[42px]">
              {tags.map(tag => (
                <span key={tag} className="flex items-center px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700">
                  <Tag className="w-3 h-3 mr-1 text-slate-400" />
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 text-slate-400 hover:text-red-500">×</button>
                </span>
              ))}
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                className="bg-transparent border-none text-sm focus:ring-0 w-24 placeholder-slate-400"
                placeholder="+ Add tag"
              />
           </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;