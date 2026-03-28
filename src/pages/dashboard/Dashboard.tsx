import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { User, Server, Globe, ShieldCheck, Activity, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'

export default function DashboardHome() {
  const { user } = useAuthStore()

  // Mock server info if not present in user object yet, 
  const isServerRunning = user?.isServerRunning ?? true

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header Block */}
      <div className="relative overflow-hidden rounded-3xl border border-element-border bg-element backdrop-blur-3xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl border border-white/20 transform hover:scale-105 transition-transform duration-500 group">
            <User className="w-12 h-12 text-white group-hover:animate-pulse" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight text-foreground mb-2">{user?.email || 'Authenticated User'}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                {user?.role || 'Station User'}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Session
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">User ID</span>
            <span className="text-sm font-mono font-bold text-muted-foreground bg-muted px-3 py-1 rounded-lg border border-border">
              #{user?.id || '0000'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* District Info */}
        <Card className="border border-element-border shadow-xl bg-element backdrop-blur-3xl overflow-hidden group hover:opacity-90 transition-all duration-500 hover:border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Assignment Context</CardTitle>
            <Globe className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">District ID</p>
              <p className="text-xs font-mono font-bold text-foreground/90 break-all leading-relaxed">
                {user?.districtId || 'a5b0329c-51e8-42ae-aa77-9934ced2c686'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Server Status Card */}
        <Card className="border border-element-border shadow-xl bg-element backdrop-blur-3xl overflow-hidden group hover:opacity-90 transition-all duration-500 hover:border-emerald-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Node Status</CardTitle>
            <Activity className={cn("w-4 h-4", isServerRunning ? "text-emerald-400" : "text-amber-400")} />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500",
                isServerRunning ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              )}>
                <Server className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-black tracking-tight">{isServerRunning ? 'RUNNING' : 'STANDBY'}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Local Node Instance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Encryption/Security Card */}
        <Card className="border border-element-border shadow-xl bg-element backdrop-blur-3xl overflow-hidden group hover:opacity-90 transition-all duration-500 hover:border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Security Protocol</CardTitle>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-sm font-bold text-foreground/80">AES-256 Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">SSL & Secure Tunnel Based</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
