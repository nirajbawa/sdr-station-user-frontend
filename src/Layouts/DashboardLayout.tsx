import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Users, LogOut, ChevronLeft, ChevronRight, Shield, User, Search, Sparkles, Menu, X, Sun, Moon } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuthStore } from '../store/authStore'
import { useTheme } from '../hooks/useTheme'

const sidebarItems = [
  { icon: User, label: 'Station Profile', href: '/dashboard' },
  { icon: Search, label: 'Search Records', href: '/dashboard/search' },
  { icon: Sparkles, label: 'Prompt Search', href: '/dashboard/prompt-search' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-all duration-300 relative font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside 
        className={cn(
          "h-full border-r border-border hidden lg:flex flex-col transition-[width] duration-700 cubic-bezier(0.4, 0, 0.2, 1) z-20 bg-sidebar backdrop-blur-3xl overflow-x-hidden select-none",
          isExpanded ? "w-64" : "w-[72px]"
        )}
      >
        <div className="p-4 border-b border-border h-16 flex items-center shrink-0 overflow-hidden">
          <div className={cn(
            "flex items-center transition-all duration-300 w-full",
            isExpanded ? "justify-start gap-3" : "justify-center"
          )}>
            <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center shrink-0 border border-border">
              <Shield className="w-4 h-4 text-foreground" />
            </div>
            <h1 className={cn(
              "text-xl font-bold tracking-tight whitespace-nowrap transition-all duration-300",
              !isExpanded && "opacity-0 invisible w-0 -translate-x-4"
            )}>
              Station Admin
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center rounded-xl transition-all duration-400 ease-in-out group h-11 relative overflow-hidden",
                isExpanded ? "px-3 gap-3" : "justify-center px-0",
                location.pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
              )}
            >
              {location.pathname === item.href && (
                <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-500 ease-out group-hover:scale-110 shrink-0",
                location.pathname === item.href ? "text-blue-400" : "text-inherit"
              )} />
              <div className={cn(
                "overflow-hidden transition-[width,opacity,margin] duration-500 ease-in-out",
                isExpanded ? "w-auto opacity-100 ml-0" : "w-0 opacity-0 ml-0 invisible"
              )}>
                <span className="text-sm font-semibold whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-2 shrink-0 overflow-hidden">
          <button 
            onClick={handleLogout}
            className={cn(
              "flex items-center rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-300 group h-11 w-full",
              isExpanded ? "px-3 gap-3" : "justify-center px-0"
            )}
          >
            <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0" />
            <div className={cn(
              "overflow-hidden transition-all duration-300",
              isExpanded ? "w-auto opacity-100 ml-0" : "w-0 opacity-0 ml-0 invisible"
            )}>
              <span className="text-sm font-semibold whitespace-nowrap">
                Logout
              </span>
            </div>
          </button>

          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "w-full flex items-center rounded-xl bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 border border-border group h-10",
              isExpanded ? "px-3 justify-center" : "justify-center px-0"
            )}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <div className="flex items-center justify-center">
              {isExpanded ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                    Minimal
                  </span>
                </div>
              ) : (
                <ChevronRight className="w-5 h-5 animate-in fade-in slide-in-from-right-2 duration-300 transition-transform group-hover:translate-x-0.5" />
              )}
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer Content */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-[60] w-[280px] bg-background border-r border-border lg:hidden transition-transform duration-500 ease-in-out transform flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center border border-border">
              <Shield className="w-4 h-4 text-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Station Admin</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-muted-foreground hover:text-foreground transition-colors focus:ring-2 focus:ring-blue-500/50 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative group",
                location.pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {location.pathname === item.href && (
                <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-full" />
              )}
              <item.icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", location.pathname === item.href ? "text-blue-400" : "text-inherit")} />
              <span className="text-lg font-bold">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10">
          <button 
            onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-4 p-4 rounded-2xl w-full text-rose-500 hover:bg-rose-500/10 transition-all font-bold group"
          >
            <LogOut className="w-6 h-6 transition-transform group-hover:scale-110" />
            <span className="text-lg">Logout Session</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-8 bg-card backdrop-blur-3xl shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest truncate max-w-[150px] md:max-w-none">
              {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-primary/50 transition-all duration-300 shadow-sm relative group"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              )}
            </button>

            <div 
              className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center group cursor-pointer hover:border-primary/50 transition-all duration-300 shadow-sm relative"
              title={user?.email || 'User Session'}
            >
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              <User className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 min-h-0 bg-background/50">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
