import { useState, useCallback } from 'react'
import {
  Search,
  Filter,
  Phone,
  User as UserIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Database,
  ArrowRight,
  X,
  MapPin,
  Calendar,
  Layers,
  Smartphone,
  Fingerprint,
  Clipboard,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export default function SearchFilter(): React.JSX.Element {
  const { user } = useAuthStore()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    number: '',
    full_name: '',
    address: '',
    startDate: '',
    endDate: ''
  })
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState<SearchResult | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const limit = 10

  const handleSearch = useCallback(
    async (targetPage = 1) => {
      setLoading(true)
      setPage(targetPage)

      try {
        const searchData = {
          keyword: query || undefined,
          name: filters.full_name || undefined,
          number: filters.number || undefined,
          page: targetPage,
          limit
        }

        const response = await api.searchRecords(searchData, user?.serverurl)
        if (response.success) {
          setResults(response.data)
          setTotal(response.total)
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    },
    [query, filters, limit, user?.serverurl]
  )


  const resetFilters = (): void => {
    setFilters({
      number: '',
      full_name: '',
      address: '',
      startDate: '',
      endDate: ''
    })
    setQuery('')
  }

  const handleCopyDetails = async (): Promise<void> => {
    if (!selectedRecord) return
    
    const details = `
Phone Number: ${selectedRecord.number}
Full Name: ${selectedRecord.full_name}
Address: ${selectedRecord.address || 'N/A'}
ID Proof: ${selectedRecord.idproof || 'N/A'}
Alternate No: ${selectedRecord.alterno || 'N/A'}
Date: ${selectedRecord.timestamp ? new Date(selectedRecord.timestamp).toLocaleDateString() : 'N/A'}
Station: ${selectedRecord.vle_name}
    `.trim()

    try {
      await navigator.clipboard.writeText(details)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleExport = async (record?: SearchResult): Promise<void> => {
    // Single Record Frontend Export
    if (record) {
      try {
        const headers = ["Phone", "Full Name", "Address", "ID Proof", "Alternate No", "Date", "Station"]
        const row = [
          record.number,
          record.full_name,
          record.address || "",
          record.idproof || "",
          record.alterno || "",
          record.timestamp ? new Date(record.timestamp).toLocaleDateString() : "",
          record.vle_name
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

    if (!results.length) return
    try {
      const searchData = {
        keyword: query || undefined,
        name: filters.full_name || undefined,
        number: filters.number || undefined,
        email: user?.email
      }

      const blob = await api.exportRecords(searchData, user?.serverurl)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `records_export_${new Date().getTime()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err: any) {
      console.error('Export failed:', err)
      alert(`Export error: ${err.message}`)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-8 animate-in fade-in duration-500 pb-10 px-4 md:px-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2">
            Filter Based Search
          </h1>
          <p className="text-muted-foreground text-[10px] md:text-sm uppercase font-bold tracking-widest opacity-60">
            Search through millions of mobile records with precise filters.
          </p>
        </div>
        <div className="bg-blue-500/10 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-blue-500/20 flex items-center gap-2 self-start md:self-end">
          <Database className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
          <span className="text-[10px] md:text-sm font-bold text-blue-400">
            {total.toLocaleString()} Records Found
          </span>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <Button 
        variant="outline" 
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden w-full flex items-center justify-between rounded-xl border-border bg-element/40 py-6 text-xs font-bold uppercase tracking-widest text-foreground"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-400" />
          Search Filters
        </span>
        {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filters Sidebar */}
        <div className={cn("lg:col-span-4 xl:col-span-3", !showFilters && "hidden lg:block animate-in slide-in-from-top-4 duration-500")}>
          <div className="bg-element backdrop-blur-3xl rounded-3xl md:rounded-4xl border border-element-border p-4 md:p-8 shadow-2xl lg:sticky lg:top-24 transition-all overflow-hidden relative group">
            <div className="flex items-center justify-between mb-6 md:mb-8 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-muted flex items-center justify-center border border-border">
                  <Filter className="w-3.5 h-3.5 md:w-4 md:h-4 text-foreground" />
                </div>
                <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-black text-foreground/90">Search Intelligence</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-7 md:h-8 px-2 md:px-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
              >
                Clear
              </Button>
            </div>

            <div className="space-y-4 md:space-y-6 relative z-10">
              <div className="space-y-2">
                <Label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Neural Search
                </Label>
                <div className="relative group/input">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground group-focus-within/input:text-foreground transition-colors" />
                  <Input
                    placeholder="Keywords..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 md:pl-11 bg-muted/30 border-border text-xs md:text-sm text-foreground placeholder:text-muted-foreground/50 font-bold h-10 md:h-12 rounded-xl focus-visible:ring-0 focus-visible:border-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Identifier
                </Label>
                <div className="relative group/input">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground group-focus-within/input:text-foreground transition-colors" />
                  <Input
                    placeholder="Phone Number..."
                    value={filters.number}
                    onChange={(e) => setFilters({ ...filters, number: e.target.value })}
                    className="pl-10 md:pl-11 bg-muted/30 border-border text-xs md:text-sm text-foreground placeholder:text-muted-foreground/50 font-bold h-10 md:h-12 rounded-xl focus-visible:ring-0 focus-visible:border-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Subscriber Name
                </Label>
                <div className="relative group/input">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground group-focus-within/input:text-foreground transition-colors" />
                  <Input
                    placeholder="Full Name..."
                    value={filters.full_name}
                    onChange={(e) => setFilters({ ...filters, full_name: e.target.value })}
                    className="pl-10 md:pl-11 bg-muted/30 border-border text-xs md:text-sm text-foreground placeholder:text-muted-foreground/50 font-bold h-10 md:h-12 rounded-xl focus-visible:ring-0 focus-visible:border-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 md:pt-6">
                <Button 
                  onClick={() => handleSearch(1)} 
                  disabled={loading}
                  className="w-full bg-btn hover:opacity-90 text-btn-text rounded-xl h-12 md:h-14 font-black uppercase tracking-widest md:tracking-[0.2em] shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] text-[9px] md:text-[10px]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Run Intelligence <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Content */}
        <div className="lg:col-span-8 xl:col-span-9 max-w-full overflow-hidden">
          <div className="bg-element border border-element-border backdrop-blur-3xl rounded-2xl md:rounded-3xl shadow-xl flex flex-col h-[500px] md:h-[650px] overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-muted/50 backdrop-blur-md">
                    <th className="hidden sm:table-cell px-4 md:px-6 py-4 text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                      Subscriber Info
                    </th>
                    <th className="px-4 md:px-6 py-4 text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                      Mobile Number
                    </th>
                    <th className="px-4 md:px-6 py-4 text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right border-b border-border">
                      View Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={3} className="px-6 py-5">
                          <div className="h-12 bg-muted rounded-2xl" />
                        </td>
                      </tr>
                    ))
                  ) : results.length > 0 ? (
                    <>
                      {results.map((record, index) => (
                        <tr
                          key={record._id || index}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          <td className="hidden sm:table-cell px-4 md:px-6 py-4 md:py-5">
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black border border-blue-500/20 shrink-0 text-xs md:text-sm">
                                {record.full_name?.charAt(0) || '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-foreground text-xs md:text-sm leading-none mb-1 md:mb-1.5 uppercase tracking-tight truncate max-w-[120px] md:max-w-none">
                                  {record.full_name}
                                </p>
                                <p className="text-[8px] md:text-[10px] text-muted-foreground font-black tracking-widest uppercase opacity-60 truncate">
                                  {record.vle_name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 md:py-5 font-mono font-black text-foreground/80 tracking-tighter text-xs md:text-sm">
                            {record.number}
                          </td>
                          <td className="px-4 md:px-6 py-4 md:py-5 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={async () => {
                                try {
                                  const targetId = record.id || record._id
                                  if (!targetId) {
                                    setSelectedRecord(record)
                                    return
                                  }
                                  const res = await api.getRecordById(targetId, user?.serverurl)
                                  if (res.success && res.data) {
                                    setSelectedRecord(res.data as SearchResult)
                                  } else {
                                    setSelectedRecord(record)
                                  }
                                } catch (err) {
                                  console.error('Failed to fetch details:', err)
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
                    </>
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-32 text-center">
                        <div className="flex flex-col items-center justify-center space-y-6">
                          <div className="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center border border-border">
                            <Search className="w-10 h-10 text-muted-foreground/30" />
                          </div>
                          <div>
                            <p className="text-xl font-black text-foreground uppercase tracking-widest">No Intelligence Found</p>
                            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-50">
                              Adjust parameters to refine your search
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {results.length > 0 && (
              <div className="p-4 md:p-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950/40 backdrop-blur-3xl mt-auto">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center sm:text-left">
                  Showing Intelligence{' '}
                  <span className="text-primary/70">
                    {Math.min(total, (page - 1) * limit + 1)}-{Math.min(total, page * limit)}
                  </span>{' '}
                  of <span className="text-primary/70">{total.toLocaleString()}</span>
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleSearch(Math.max(1, page - 1))}
                    disabled={page === 1 || loading}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl border-border bg-muted/50 hover:bg-muted disabled:opacity-20"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center justify-center min-w-[40px] text-[10px] font-black text-foreground bg-muted h-9 md:h-10 rounded-lg md:rounded-xl border border-border">
                    {page}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleSearch(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages || loading}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl border-border bg-muted/50 hover:bg-muted disabled:opacity-20"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Intelligence Modal */}
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
              <DetailItem icon={<UserIcon className="w-5 h-5 text-foreground" />} label="Full Name" value={selectedRecord.full_name} isLarge />
              <DetailItem icon={<Layers className="w-5 h-5 text-muted-foreground" />} label="Operator" value={selectedRecord.operator} />
              <DetailItem icon={<MapPin className="w-5 h-5 text-muted-foreground" />} label="Address" value={selectedRecord.address || 'Not Recorded'} isAddress />
              <DetailItem icon={<Smartphone className="w-5 h-5 text-muted-foreground" />} label="Alternate No" value={selectedRecord.alterno || 'N/A'} />
              <DetailItem icon={<Calendar className="w-5 h-5 text-muted-foreground" />} label="Registration Date" value={selectedRecord.date ? new Date(selectedRecord.date).toLocaleDateString() : (selectedRecord.timestamp ? new Date(selectedRecord.timestamp).toLocaleDateString() : 'N/A')} />
              <DetailItem icon={<Fingerprint className="w-5 h-5 text-muted-foreground" />} label="Identity Proof" value={selectedRecord.idproof || 'N/A'} />
              <DetailItem icon={<MapPin className="w-5 h-5 text-muted-foreground" />} label="Service Circle" value={selectedRecord.circle || 'Not Available'} />
              <DetailItem icon={<Database className="w-5 h-5 text-muted-foreground" />} label="Source Station" value={selectedRecord.vle_name || 'N/A'} />
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
                onClick={() => handleExport(selectedRecord)}
                className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-900/20"
              >
                Export Unit
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
