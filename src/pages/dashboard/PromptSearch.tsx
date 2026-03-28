import { useState } from 'react'
import {
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Database,
  X,
  MapPin,
  Calendar,
  Smartphone,
  Clipboard,
  Check,
  Filter as FilterIcon,
  Radio,
  Layers,
  Fingerprint
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { useAuthStore } from '@/store/authStore'
import * as api from '@/lib/api'
import { cn } from '@/lib/utils'

interface SearchResult {
  id?: string
  _id?: string
  number: string
  full_name: string
  operator: string
  dataset: string
  address?: string
  date?: string | Date
  alterno?: string
  idproof?: string
  timestamp?: string | Date
  vle_name?: string
  circle?: string
}

export default function PromptSearch(): React.JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [activeFilters, setActiveFilters] = useState<any>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [submittedPrompt, setSubmittedPrompt] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<SearchResult | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [limit, setLimit] = useState(10)

  const handlePromptSubmit = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault()
    if (!prompt.trim()) return

    setIsParsing(true)
    setResults([])
    setTotal(0)
    setActiveFilters(null)

    try {
      setSubmittedPrompt(prompt)
      await executeSearch(1, prompt)
    } catch (error) {
      console.error('Failed to parse prompt:', error)
    } finally {
      setIsParsing(false)
    }
  }

  const executeSearch = async (targetPage = 1, currentPrompt = submittedPrompt): Promise<void> => {
    if (!currentPrompt) return
    setIsSearching(true)
    setPage(targetPage)

    try {
      const { user } = useAuthStore.getState()
      
      const response = await api.promptSearch(
        {
          prompt: currentPrompt,
          page: targetPage,
          limit
        },
        user?.serverurl
      )

      if (response.success) {
        setResults(response.data)
        setTotal(response.total)
        setActiveFilters({ query: currentPrompt }) 
      } else {
        console.error('Search failed:', response.error)
      }
    } catch (error) {
      console.error('Global search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleCopyDetails = async (): Promise<void> => {
    if (!selectedRecord) return
    const details = `
Phone Number: ${selectedRecord.number}
Full Name: ${selectedRecord.full_name}
Operator: ${selectedRecord.operator}
Address: ${selectedRecord.address || 'N/A'}
Dataset: ${selectedRecord.dataset}
    `.trim()
    try {
      await navigator.clipboard.writeText(details)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleExportExcel = async (record?: SearchResult): Promise<void> => {
    // If a specific record is provided, export it directly on the frontend
    if (record) {
      try {
        const headers = ["Phone", "Full Name", "Operator", "Address", "Date", "Dataset", "ID Proof", "Circle", "Alternate No"]
        const row = [
          record.number,
          record.full_name,
          record.operator,
          record.address || "",
          record.date ? new Date(record.date).toLocaleDateString() : (record.timestamp ? new Date(record.timestamp).toLocaleDateString() : ""),
          record.dataset,
          record.idproof || "",
          record.circle || "",
          record.alterno || ""
        ]
        
        const csvContent = [headers.join(","), row.map(v => `"${v}"`).join(",")].join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `subscriber_${record.number}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      } catch (err) {
        console.error('Frontend export failed:', err)
      }
      return
    }

    // Default: Export the whole search result via backend
    if (!results.length) return
    try {
      const { user } = useAuthStore.getState()
      const data = { prompt: submittedPrompt, email: user?.email }
      const blob = await api.exportRecords(data, user?.serverurl)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `search_results_${new Date().getTime()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error: any) {
      console.error('Export error:', error)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="text-center space-y-4 px-4">
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
          What are you looking for?
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
          Ex: &quot;give the records whose number starts with 77&quot;, &quot;give records whose name includes niraj&quot; or &quot;give records whose address includes the city pune&quot;
        </p>
      </div>

      {/* Large Input Section */}
      <div className="max-w-3xl mx-auto px-4">
        <form onSubmit={handlePromptSubmit} className="relative group">
          <div className="relative bg-element backdrop-blur-3xl border border-element-border rounded-3xl md:rounded-4xl p-2 md:p-3 shadow-2xl flex flex-col md:flex-row items-center gap-2 md:gap-3 focus-within:border-primary/20 transition-all duration-500">
            <div className="flex items-center flex-1 w-full">
              <div className="pl-4 md:pl-6 text-muted-foreground transition-colors group-focus-within:text-foreground shrink-0">
                {isParsing ? <Loader2 className="w-5 h-5 md:w-8 md:h-8 animate-spin text-primary" /> : <Sparkles className="w-5 h-5 md:w-8 md:h-8" />}
              </div>
              <input
                type="text"
                placeholder="Query Intelligence Network..."
                className="flex-1 bg-transparent border-none outline-none text-sm md:text-xl py-4 md:py-5 px-3 text-foreground placeholder:text-muted-foreground/30 font-bold tracking-tight min-w-0"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isParsing}
              />
            </div>
            <Button
              type="submit"
              disabled={isParsing || !prompt.trim()}
              className="w-full md:w-auto rounded-2xl md:rounded-3xl px-8 py-5 md:py-7 bg-btn hover:opacity-90 text-btn-text font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] text-xs md:text-sm"
            >
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Active Filters Preview */}
      {activeFilters && (
        <div className="max-w-3xl mx-auto px-4 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-muted/30 backdrop-blur-xl border border-border rounded-3xl p-4 md:p-5 flex flex-wrap gap-2 md:gap-3 items-center">
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mr-2 md:mr-4">
              <FilterIcon className="w-4 h-4" />
              Neural Map:
            </div>
            <div className="flex flex-wrap gap-2 flex-1">
              {Object.entries(activeFilters).map(([key, value]) => {
                if (!value) return null
                return (
                  <div key={key} className="bg-muted px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-border flex items-center gap-2 md:gap-3">
                    <span className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">{key}:</span>
                    <span className="text-[10px] md:text-xs font-black text-foreground uppercase truncate max-w-[100px]">{String(value)}</span>
                  </div>
                )
              })}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setActiveFilters(null); setResults([]); setTotal(0); }}
              className="h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all w-full md:w-auto mt-2 md:mt-0"
            >
              <X className="w-4 h-4 mr-1" /> Clear Results
            </Button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {(results.length > 0 || isSearching) && (
        <div className="bg-element border border-element-border backdrop-blur-3xl rounded-3xl md:rounded-4xl shadow-xl animate-in slide-in-from-bottom-8 duration-700 mx-4">
          <div className="p-4 md:p-8 border-b border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <h2 className="font-bold text-foreground flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <Database className="w-4 h-4 text-primary/60" />
                {isSearching ? 'Fetching Records...' : `Results: ${total.toLocaleString()}`}
              </h2>
              <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/10 shrink-0">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest px-1">Limit:</span>
                {[10, 25, 50, 100].map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLimit(l); setTimeout(() => executeSearch(1), 0); }}
                    className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded transition-all",
                      limit === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {results.length > 0 && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => executeSearch(page - 1)}
                  disabled={page === 1 || isSearching}
                  className="rounded-xl w-10 h-10 border-border bg-muted/50 text-foreground disabled:opacity-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-xs font-black text-primary font-mono">
                  {page} | {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => executeSearch(page + 1)}
                  disabled={page === totalPages || isSearching}
                  className="rounded-xl w-10 h-10 border-border bg-muted/50 text-foreground disabled:opacity-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto custom-scrollbar min-h-[500px] relative">
            {isSearching && (
              <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-16 h-16 animate-spin text-white opacity-80" />
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white animate-pulse">Syncing Database...</p>
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/60 transition-colors border-b border-white/10">
                  <th className="hidden sm:table-cell px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Subscriber Info</th>
                  <th className="px-4 md:px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mobile Number</th>
                  <th className="px-4 md:px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">View Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((record, index) => (
                  <tr key={record.id || record._id || index} className="hover:bg-primary/5 transition-all duration-300 group">
                    <td className="hidden sm:table-cell px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary font-black shadow-lg group-hover:border-primary/50 transition-colors">
                          {record.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-black text-foreground leading-tight uppercase tracking-tight text-lg mb-1">{record.full_name}</p>
                          <p className="text-[9px] text-muted-foreground font-black tracking-[0.2em] uppercase opacity-60 italic">{record.dataset}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-6 font-mono font-black text-primary/80 text-base md:text-lg tracking-tighter">
                      {record.number}
                    </td>
                    <td className="px-4 md:px-8 py-6 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={async () => {
                          const { user } = useAuthStore.getState()
                          const targetId = record.id || record._id
                          if (!targetId) {
                            setSelectedRecord(record)
                            return
                          }
                          try {
                            const res = await api.getRecordById(targetId, user?.serverurl)
                            if (res.success && res.data) {
                              setSelectedRecord(res.data as SearchResult)
                            } else {
                              // Fallback to existing list data if fetch fails
                              setSelectedRecord(record)
                            }
                          } catch (err) {
                            console.error('Fetch error, falling back to local data:', err)
                            setSelectedRecord(record)
                          }
                        }}
                        className="rounded-lg h-9 px-4 text-[10px] font-bold uppercase tracking-widest bg-btn text-btn-text hover:opacity-90 border border-element-border transition-all"
                      >
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedRecord && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300 overflow-y-auto"
          onClick={() => setSelectedRecord(null)}
        >
          <div 
            className="bg-element rounded-4xl shadow-2xl w-full max-w-2xl my-auto overflow-hidden animate-in zoom-in-95 duration-300 border border-element-border flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative min-h-[120px] bg-linear-to-b from-muted to-element p-6 md:p-8 flex items-center border-b border-element-border shrink-0">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRecord(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl z-10 transition-all"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-6 relative z-10 w-full overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground shadow-lg shrink-0">
                   <Smartphone className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-widest rounded border border-primary/20">Profile Data</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest truncate">Dataset: {selectedRecord.dataset || 'N/A'}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tighter font-mono truncate">
                    {selectedRecord.number}
                  </h2>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-background/40 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <DetailItem icon={<Radio className="w-5 h-5 text-foreground" />} label="Full Name" value={selectedRecord.full_name} isLarge />
              <DetailItem icon={<Layers className="w-5 h-5 text-muted-foreground" />} label="Operator" value={selectedRecord.operator} />
              <DetailItem icon={<MapPin className="w-5 h-5 text-muted-foreground" />} label="Address" value={selectedRecord.address || 'Not Recorded'} isAddress />
              <DetailItem icon={<Smartphone className="w-5 h-5 text-muted-foreground" />} label="Alternate No" value={selectedRecord.alterno || 'N/A'} />
              <DetailItem icon={<Calendar className="w-5 h-5 text-muted-foreground" />} label="Registration Date" value={selectedRecord.date ? new Date(selectedRecord.date).toLocaleDateString() : (selectedRecord.timestamp ? new Date(selectedRecord.timestamp).toLocaleDateString() : 'N/A')} />
              <DetailItem icon={<Fingerprint className="w-5 h-5 text-muted-foreground" />} label="Identity Proof" value={selectedRecord.idproof || 'N/A'} />
              <DetailItem icon={<MapPin className="w-5 h-5 text-muted-foreground" />} label="Service Circle" value={selectedRecord.circle || 'Not Available'} />
              <DetailItem icon={<Database className="w-5 h-5 text-muted-foreground" />} label="Database ID" value={selectedRecord._id || selectedRecord.id || 'N/A'} />
            </div>

            {/* Modal Footer */}
            <div className="p-6 md:p-8 bg-element border-t border-element-border flex flex-wrap justify-between items-center gap-4 shrink-0 mt-auto">
              <div className="hidden sm:block">
                 <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Secure Environment</p>
                 <p className="text-[8px] font-medium text-muted-foreground/40 italic">Verification Protocol Active</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  onClick={handleCopyDetails}
                  className="flex-1 sm:flex-none rounded-xl h-12 px-6 border border-border text-foreground font-bold uppercase tracking-widest hover:bg-muted transition-all text-[10px]"
                >
                  {isCopied ? <><Check className="w-4 h-4 mr-2 text-primary" /> Copied</> : <><Clipboard className="w-4 h-4 mr-2" /> Copy Details</>}
                </Button>
                <Button
                  onClick={() => handleExportExcel(selectedRecord)}
                  className="flex-1 sm:flex-none rounded-xl h-12 px-8 font-bold uppercase tracking-widest bg-btn hover:opacity-90 text-btn-text transition-all text-[10px]"
                >
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailItem({ icon, label, value, isAddress, isLarge }: { icon: any, label: string, value: string, isAddress?: boolean, isLarge?: boolean }): React.JSX.Element {
  return (
    <div className="flex items-start gap-4 border-l border-white/5 pl-4 hover:border-white transition-colors py-1">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <Label className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-1 block">{label}</Label>
        <p className={cn(
          "text-white font-bold tracking-tight leading-tight uppercase truncate",
          isLarge ? "text-lg italic" : "text-sm",
          isAddress && "text-xs leading-relaxed opacity-80 normal-case italic font-medium whitespace-normal"
        )}>{value}</p>
      </div>
    </div>
  )
}
