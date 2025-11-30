
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  Search, 
  Settings, 
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Briefcase
} from 'lucide-react';
import { User, UserRole } from '../types';
import { getCurrentUser, setCurrentUserMock, getAvailableUsers } from '../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(getCurrentUser());
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleUserSwitch = (userId: string) => {
    const newUser = setCurrentUserMock(userId);
    setCurrentUser(newUser);
    setShowUserMenu(false);
    window.location.reload(); // Force reload to apply permission logic cleanly for demo
  };

  const NavItem = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <button
      onClick={() => {
        onNavigate(id);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1
        ${activeTab === id || activeTab.startsWith(id)
          ? 'bg-indigo-50 text-indigo-700' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-800">WikiFlow</span>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">
            Menu
          </div>
          <NavItem id="dashboard" label="儀表板" icon={LayoutDashboard} />
          <NavItem id="projects" label="專案管理" icon={Briefcase} />
          <NavItem id="documents" label="知識庫" icon={BookOpen} />
          <NavItem id="search" label="AI 智慧問答" icon={Search} />
          
          {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.EDITOR) && (
            <>
              <div className="mt-8 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">
                Manage
              </div>
              <NavItem id="create" label="新增文件" icon={PlusCircle} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200">
           <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center w-full p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <img 
                src={currentUser.avatar} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full bg-slate-200"
              />
              <div className="ml-3 text-left flex-1">
                <p className="text-sm font-medium text-slate-700 truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.role}</p>
              </div>
              <Settings className="w-4 h-4 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50">
                <div className="px-4 py-2 text-xs font-semibold text-slate-400 border-b border-slate-100">
                  切換使用者 (模擬權限)
                </div>
                {getAvailableUsers().map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleUserSwitch(u.id)}
                    className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-indigo-50 
                      ${currentUser.id === u.id ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}
                  >
                    <UserIcon className="w-3 h-3 mr-2" />
                    {u.name.split(' ')[0]} ({u.role})
                  </button>
                ))}
              </div>
            )}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 z-20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-slate-800">WikiFlow</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6 text-slate-600" /> : <Menu className="w-6 h-6 text-slate-600" />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 bg-slate-800 bg-opacity-50 z-10" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
               <div className="p-4 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800">Menu</h2>
               </div>
               <div className="p-4">
                  <NavItem id="dashboard" label="儀表板" icon={LayoutDashboard} />
                  <NavItem id="projects" label="專案管理" icon={Briefcase} />
                  <NavItem id="documents" label="知識庫" icon={BookOpen} />
                  <NavItem id="search" label="AI 智慧問答" icon={Search} />
                  {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.EDITOR) && (
                    <NavItem id="create" label="新增文件" icon={PlusCircle} />
                  )}
                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-2">Current: {currentUser.name}</p>
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="text-indigo-600 text-sm font-medium">
                      Switch User
                    </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
