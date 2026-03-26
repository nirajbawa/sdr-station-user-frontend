import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Shield, Lock, Wifi, AlertCircle, TrendingUp, Database, ArrowRight, Cpu } from 'lucide-react'
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
    const token = data.access_token || data?.data?.access_token
    const refreshToken = data.refresh_token || data?.data?.refreshToken || data?.data?.refresh_token
    const user = data.user || data?.data?.user || {}

    if (token) {
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
      throw new Error('Authentication failed: No token received')
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
    <div className="h-screen w-full bg-slate-50 dark:bg-[#020617] flex overflow-hidden lg:selection:bg-primary/30 transition-colors duration-500">
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
        <div className="w-full md:w-[50%] lg:w-[40%] flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 py-12 bg-white dark:bg-zinc-950/20 backdrop-blur-3xl transition-colors duration-500">
          <div className="max-w-[380px] w-full mx-auto space-y-8">
            
            {/* Header */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {otpRequested ? "Verify Station ID" : "Station Login"}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm leading-relaxed">
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
              )}

              {!otpRequested ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-600 dark:text-slate-300 ml-1 text-xs font-semibold">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@district.gov"
                      className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all font-medium"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" title="password" className="text-slate-600 dark:text-slate-300 ml-1 text-xs font-semibold">Access Key</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all font-medium"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center ml-1">
                    <Label className="text-slate-600 dark:text-slate-300 text-xs font-semibold">OTP Verification</Label>
                    <button 
                      type="button" 
                      onClick={() => setOtpRequested(false)}
                      className="text-blue-600 dark:text-primary hover:text-blue-700 dark:hover:text-primary/80 text-xs font-semibold underline-offset-4 hover:underline transition-all"
                    >
                      Use different account
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup className="gap-3">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot 
                            key={i} 
                            index={i} 
                            className="w-12 h-14 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xl font-bold rounded-xl ring-offset-white dark:ring-offset-slate-950 focus:ring-blue-500" 
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
                  "w-full h-12 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg active:scale-[0.98]",
                  otpRequested 
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20" 
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
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
              <div className="flex items-center gap-8 text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Offline Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-none">AES-256</span>
                </div>
              </div>
              
              <div className="text-[10px] text-slate-400 dark:text-slate-600 text-center uppercase tracking-widest leading-relaxed">
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
