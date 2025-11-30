

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DocumentList from './components/DocumentList';
import DocumentEditor from './components/DocumentEditor';
import DocumentView from './components/DocumentView';
import AISearch from './components/AISearch';
import ProjectBoard from './components/ProjectBoard';
import { Document, Project, UserRole } from './types';
import { getDocuments, saveDocument, getCurrentUser, getProjects, saveProject } from './services/storageService';
import { LayoutDashboard, Users, FileText, Activity, Briefcase, Plus, ArrowRight, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  // Refresh data on load
  useEffect(() => {
    setDocuments(getDocuments());
    setProjects(getProjects());
  }, [activeTab, isEditing, selectedProject]);

  const currentUser = getCurrentUser();

  const handleSaveDoc = (docData: Partial<Document>) => {
    if (!currentUser) return;
    saveDocument(docData as Document, currentUser);
    setIsEditing(false);
    setActiveTab('documents');
    setDocuments(getDocuments()); 
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const newProject: Project = {
       id: '', // Will be set by save
       name: newProjectName,
       description: 'New Project',
       status: 'ACTIVE',
       members: [currentUser.id],
       tasks: [],
       createdBy: currentUser.name,
       createdAt: '',
       updatedAt: ''
    };
    const saved = saveProject(newProject);
    setProjects(getProjects());
    setShowNewProjectModal(false);
    setNewProjectName('');
    setSelectedProject(saved);
    setActiveTab('project-view');
  };

  const handleExportDashboard = async () => {
    const dashboardElement = document.getElementById('dashboard-stats');
    if (!dashboardElement) return;

    try {
      const canvas = await html2canvas(dashboardElement, {
        backgroundColor: '#f8fafc', // match body background
      });
      const link = document.createElement('a');
      link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('圖表匯出失敗，請稍後再試。');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex justify-end">
               <button 
                 onClick={handleExportDashboard}
                 className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 font-medium px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm"
               >
                 <Download className="w-4 h-4" /> 匯出報表
               </button>
            </div>

            {/* ID used for html2canvas target */}
            <div id="dashboard-stats" className="grid grid-cols-1 md:grid-cols-4 gap-4 p-1">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-500 text-sm font-medium">總文件數</h3>
                  <FileText className="w-5 h-5 text-indigo-500" />
                </div>
                <p className="text-3xl font-bold text-slate-800">{documents.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-slate-500 text-sm font-medium">活躍專案</h3>
                   <Briefcase className="w-5 h-5 text-blue-500" />
                </div>
                 <p className="text-3xl font-bold text-slate-800">{projects.filter(p => p.status === 'ACTIVE').length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 text-sm font-medium">本週文件更新</h3>
                    <Activity className="w-5 h-5 text-amber-500" />
                 </div>
                 <p className="text-3xl font-bold text-slate-800">
                   {documents.filter(d => new Date(d.updatedAt) > new Date(Date.now() - 7 * 86400000)).length}
                 </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-slate-500 text-sm font-medium">團隊成員</h3>
                   <Users className="w-5 h-5 text-emerald-500" />
                </div>
                 <p className="text-3xl font-bold text-slate-800">3</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
               <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4">進行中的專案</h2>
                  <div className="space-y-3">
                    {projects.slice(0, 3).map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => { setSelectedProject(p); setActiveTab('project-view'); }}
                        className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all cursor-pointer flex justify-between items-center"
                      >
                         <div>
                            <h3 className="font-bold text-slate-800">{p.name}</h3>
                            <p className="text-xs text-slate-500">{p.tasks.filter(t => t.status !== 'DONE').length} tasks remaining</p>
                         </div>
                         <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
               </div>
               <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4">最近文件</h2>
                  <DocumentList 
                    documents={documents.slice(0, 3)} 
                    onSelect={(doc) => { setSelectedDoc(doc); setActiveTab('view'); }} 
                  />
               </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-slate-800">知識庫文件</h2>
              {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.EDITOR) && (
                 <button 
                  onClick={() => { setSelectedDoc(null); setIsEditing(true); setActiveTab('create'); }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                 >
                   + 新增文件
                 </button>
              )}
            </div>
            <DocumentList documents={documents} onSelect={(doc) => { setSelectedDoc(doc); setActiveTab('view'); }} />
          </div>
        );

      case 'projects':
         return (
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-800">專案管理</h2>
                  <button 
                    onClick={() => setShowNewProjectModal(true)}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" /> 新增專案
                  </button>
               </div>

               {showNewProjectModal && (
                 <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-lg animate-fade-in flex gap-2 items-center mb-4">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="輸入新專案名稱..." 
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                    />
                    <button onClick={handleCreateProject} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Create</button>
                    <button onClick={() => setShowNewProjectModal(false)} className="px-4 py-2 text-slate-500 text-sm">Cancel</button>
                 </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map(project => (
                     <div 
                       key={project.id}
                       onClick={() => { setSelectedProject(project); setActiveTab('project-view'); }}
                       className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer flex flex-col h-64"
                     >
                        <div className="flex justify-between items-start mb-4">
                           <div className="p-3 bg-blue-50 rounded-lg">
                              <Briefcase className="w-6 h-6 text-blue-600" />
                           </div>
                           <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                             {project.status}
                           </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">{project.description}</p>
                        
                        <div className="mt-auto border-t border-slate-100 pt-4 flex justify-between items-center">
                           <div className="flex -space-x-2">
                              {project.members.slice(0, 3).map(m => (
                                <div key={m} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] overflow-hidden">
                                  {/* In real app map ID to Avatar */}
                                  <Users className="w-3 h-3 text-slate-400" />
                                </div>
                              ))}
                           </div>
                           <div className="text-xs text-slate-500 font-medium">
                              {project.tasks.filter(t => t.status === 'DONE').length} / {project.tasks.length} tasks
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         );
      
      case 'project-view':
         if (!selectedProject) return <div>No project selected</div>;
         return (
            <ProjectBoard 
              project={selectedProject} 
              onUpdate={(updated) => {
                 setSelectedProject(updated);
                 setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
              }}
              onBack={() => setActiveTab('projects')}
            />
         );

      case 'search':
        return <AISearch documents={documents} />;

      case 'create':
      case 'edit':
        if (!isEditing && activeTab === 'create') {
           return <DocumentEditor onSave={handleSaveDoc} onCancel={() => setActiveTab('documents')} />;
        }
        return (
          <DocumentEditor 
            initialDoc={selectedDoc || undefined} 
            onSave={handleSaveDoc} 
            onCancel={() => { setIsEditing(false); setActiveTab(selectedDoc ? 'view' : 'documents'); }} 
          />
        );

      case 'view':
        if (!selectedDoc) return <div>No Document Selected</div>;
        return (
          <DocumentView 
            doc={selectedDoc} 
            onBack={() => setActiveTab('documents')}
            onEdit={(doc) => { setSelectedDoc(doc); setIsEditing(true); setActiveTab('edit'); }}
          />
        );

      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} onNavigate={(tab) => {
      if (tab === 'create') {
        setSelectedDoc(null);
        setIsEditing(true);
      } else {
        setIsEditing(false);
      }
      setActiveTab(tab);
    }}>
      {renderContent()}
    </Layout>
  );
};

export default App;