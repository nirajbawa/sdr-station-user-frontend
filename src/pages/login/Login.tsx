import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Shield, Lock, AlertCircle, TrendingUp, Database, ArrowRight, Cpu } from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../components/ui/input-otp"
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'
import { cn } from '../../lib/utils'

export default function Login(): React.JSX.Element {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [otpRequested, setOtpRequested] = useState(false)
  const [otp, setOtp] = useState('')
  const navigate = useNavigate()

  // Background image is served from public folder
  const bgImage = '/login_bg.png'

  const handleAuthSuccess = async (data: any): Promise<void> => {
    // The response data contains { user: {...}, access_token: "..." }
    const token = data.access_token
    const refreshToken = data.refresh_token || "" // Use empty string if not provided
    const user = data.user || {}

    if (token) {
      if (user.role !== 'station_user') {
        setErrorMsg('Access Restricted: Only Station Users are authorized to access this dashboard.')
        setIsLoading(false)
        return
      }

      if (window.api) {
        try {
          await window.api.registerLogin(user.email)
          await window.api.switchUserDatabase(user.email)
        } catch (err) {
          console.error('[Login] Electron API error:', err)
        }
      }
      useAuthStore.getState().setCredentials(token, refreshToken, user)
      navigate('/dashboard')
    } else {
      throw new Error('Authentication failed: No token received from server.')
    }
  }

  const handleRequestOtp = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')
    try {
      await api.post('/auth/request-otp', { email, password })
      setOtpRequested(true)
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')
    try {
      const response = await api.post('/auth/login-otp', { email, otp })
      await handleAuthSuccess(response.data)
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Invalid verification code.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden lg:selection:bg-primary/30 transition-colors duration-500">
      <div className="w-full h-full flex flex-col md:flex-row animate-in fade-in duration-700">
        
        {/* BRAND PANEL - Always Dark for consistent Brand Authority */}
        <div className="relative hidden md:flex md:w-[50%] lg:w-[60%] h-full bg-slate-950 overflow-hidden group border-r border-white/5 shadow-2xl z-10">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-10000"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-slate-950/90" />
          
          <div className="relative z-10 w-full flex flex-col justify-between p-16">
            <div className="space-y-12">
              <div>
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 backdrop-blur-xl mb-10 animate-float shadow-2xl">
                  <Shield className="w-10 h-10 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.6)]" />
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter leading-[1.1]">
                  Secure Data <br />
                  <span className="text-gradient">Repository</span>
                </h1>
                <p className="text-slate-400 mt-6 max-w-[450px] text-lg leading-relaxed">
                  <span className="text-blue-400/90 font-bold tracking-wide uppercase text-sm mt-2 inline-block">SDR Station User Dashboard</span>
                </p>
              </div>
            </div>

            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white text-base font-semibold">Uptime Optimized</h4>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">Deterministic sync node protocol.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Database className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white text-base font-semibold">Hyper-Secure</h4>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">Multi-layer AES-256 vaulting.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <Cpu className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white text-base font-semibold">Edge Computing</h4>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">Local-first data processing.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-white text-base font-semibold">FIPS Compliant</h4>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">Federal encryption standards.</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-10 border-t border-white/5 flex justify-between items-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                  Developed SRD Core v1.0 • Neuronex Developers
                </p>
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-400/50" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LOGIN FORM PANEL - Theme Responsive */}
        <div className="w-full md:w-[50%] lg:w-[40%] flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 py-12 bg-background transition-colors duration-500 relative overflow-y-auto">
          {/* Mobile Branding - Only visible on small screens */}
          <div className="md:hidden flex flex-col items-center mb-10 space-y-3">
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">SDR Intelligence</h1>
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Station Control Node</p>
            </div>
          </div>

          <div className="max-w-[400px] w-full mx-auto space-y-8">
            
            {/* Header */}
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">
                {otpRequested ? "Neural Verification" : "Station Access"}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {otpRequested 
                  ? "Enter the verification code sent to your station-registered device." 
                  : "Access the decentralized station node repository."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={otpRequested ? handleOtpLogin : handleRequestOtp} className="space-y-6">
              {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 items-center animate-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0" />
                  <p className="text-xs font-medium text-red-900 dark:text-red-100">{errorMsg}</p>
                </div>
              )}              {!otpRequested ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest">Administrator Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@district.gov"
                      className="h-12 bg-muted/30 border-border rounded-xl focus:ring-0 focus:border-primary/20 text-foreground placeholder:text-muted-foreground/30 transition-all font-bold"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" title="password" className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest">Intelligence Key</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 bg-muted/30 border-border rounded-xl focus:ring-0 focus:border-primary/20 text-foreground placeholder:text-muted-foreground/30 transition-all font-bold"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center ml-1">
                    <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Protocol Code</Label>
                    <button 
                      type="button" 
                      onClick={() => setOtpRequested(false)}
                      className="text-primary hover:opacity-80 text-[10px] font-black uppercase tracking-widest underline-offset-4 hover:underline transition-all"
                    >
                      Reset Auth
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup className="gap-2 md:gap-3">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot 
                            key={i} 
                            index={i} 
                            className="w-10 h-12 md:w-12 md:h-14 bg-muted/30 border-border text-foreground text-lg md:text-xl font-black rounded-xl focus:ring-0" 
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
              )}
 
              <Button 
                type="submit" 
                className={cn(
                  "w-full h-14 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-2xl active:scale-[0.98]",
                  otpRequested 
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20" 
                    : "bg-btn text-btn-text hover:opacity-90 shadow-lg"
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{otpRequested ? "Verify & Enter" : "Continue"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="pt-8 flex flex-col items-center gap-6">
              <div className="text-[10px] text-muted-foreground text-center uppercase tracking-widest leading-relaxed">
                Emergency Hotline: 9359839551 <br />
                Technical Support: nirajbava222@gmail.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
