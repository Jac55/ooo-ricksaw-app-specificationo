'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bike, CarFront, Check, ChevronDown, Clock3, Crosshair, LocateFixed, MapPin, Menu, Navigation, ShieldCheck, Star, UserRound, WalletCards, X } from 'lucide-react'

const places = ['Central Station', 'City Center', 'Airport Terminal', 'University District', 'Main Market', 'Residential Area']
const rides = [
  { name: 'Rickshaw', meta: '4 min away', price: 180, icon: CarFront },
  { name: 'Express Bike', meta: '2 min away', price: 120, icon: Bike },
  { name: 'Mini Car', meta: '6 min away', price: 260, icon: CarFront },
]

type Ride = { id: string; status: string; pickup_text: string; dropoff_text: string; ride_type: string; fare_pkr: number; eta_minutes: number; captain_id: string | null }

export default function Page() {
  const supabase = useMemo<any>(() => typeof window === 'undefined' ? null : createClient(), [])
  const [user, setUser] = useState<any>(null)
  const [pickup, setPickup] = useState('My current location')
  const [dropoff, setDropoff] = useState('')
  const [selectedRide, setSelectedRide] = useState('Rickshaw')
  const [showPlaces, setShowPlaces] = useState(false)
  const [activeRide, setActiveRide] = useState<Ride | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [captainOpen, setCaptainOpen] = useState(false)
  const [online, setOnline] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [locationState, setLocationState] = useState<'idle' | 'locating' | 'ready' | 'denied'>('idle')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [captainProgress, setCaptainProgress] = useState(0)
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminRides, setAdminRides] = useState<Ride[]>([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [profileRole, setProfileRole] = useState<'rider' | 'captain' | 'owner'>('rider')
  const [accountRole, setAccountRole] = useState<'rider' | 'captain' | 'owner'>('rider')
  const isOwner = profileRole === 'owner'

  async function openAdmin() {
    if (!isOwner || !supabase) return
    setAdminOpen(true)
    setAdminLoading(true)
    const { data } = await supabase.from('rides').select('id,status,pickup_text,dropoff_text,ride_type,fare_pkr,eta_minutes,captain_id').order('created_at', { ascending: false }).limit(30)
    setAdminRides((data as Ride[] | null) ?? [])
    setAdminLoading(false)
  }

  async function updateRideStatus(id: string, status: string) {
    await supabase.from('rides').update({ status }).eq('id', id)
    setAdminRides((rides) => rides.map((ride) => ride.id === id ? { ...ride, status } : ride))
  }

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(async ({ data }: { data: { user: any } }) => {
      setUser(data.user)
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
        setProfileRole(profile?.role ?? 'rider')
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event: string, session: { user: any } | null) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
        setProfileRole(profile?.role ?? 'rider')
      } else setProfileRole('rider')
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!activeRide || activeRide.status === 'searching' || activeRide.status === 'completed' || activeRide.status === 'cancelled') return
    setCaptainProgress(0)
    const timer = window.setInterval(() => setCaptainProgress((value) => Math.min(value + 4, 92)), 2500)
    return () => window.clearInterval(timer)
  }, [activeRide?.id, activeRide?.status])

  useEffect(() => {
    if (!user || !supabase) return
    supabase.from('rides').select('id,status,pickup_text,dropoff_text,ride_type,fare_pkr,eta_minutes,captain_id').eq('rider_id', user.id).in('status', ['searching', 'accepted', 'arriving', 'in_progress']).order('created_at', { ascending: false }).limit(1).maybeSingle().then(({ data }: { data: Ride | null }) => setActiveRide(data))
    const channel = supabase.channel(`rider-${user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'rides', filter: `rider_id=eq.${user.id}` }, (payload: any) => setActiveRide(payload.eventType === 'DELETE' || (payload.new as Ride).status === 'completed' || (payload.new as Ride).status === 'cancelled' ? null : payload.new as Ride)).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  const fare = rides.find((ride) => ride.name === selectedRide)?.price ?? 180

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault(); if (!supabase) return; setBusy(true); setAuthMessage('')
    const result = authMode === 'signup'
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`, data: { full_name: fullName, role: accountRole } } })
      : await supabase.auth.signInWithPassword({ email, password })
    if (result.error) setAuthMessage(result.error.message.includes('confirm') ? 'Check your email to confirm your account.' : 'Invalid email or password.')
    else { setAuthMessage(authMode === 'signup' ? 'Check your email to confirm your account.' : 'Welcome back.'); if (authMode === 'login') setAuthOpen(false) }
    setBusy(false)
  }

  async function requestRide() {
    if (!dropoff) return
    if (!user || !supabase) { setAuthOpen(true); return }
    setBusy(true)
    const { data, error } = await supabase.from('rides').insert({ rider_id: user.id, pickup_text: pickup.trim() || 'My current location', dropoff_text: dropoff.trim(), ride_type: selectedRide, fare_pkr: fare, distance_km: 4.8, eta_minutes: 14, payment_method: 'cash' }).select('id,status,pickup_text,dropoff_text,ride_type,fare_pkr,eta_minutes,captain_id').single()
    if (!error) setActiveRide(data)
    setBusy(false)
  }

  async function cancelRide() {
    if (!activeRide || !supabase || !user) return
    await supabase.from('rides').update({ status: 'cancelled', cancellation_reason: 'Cancelled by rider' }).eq('id', activeRide.id).eq('rider_id', user.id)
    setActiveRide(null)
  }

  async function signOut() { if (supabase) await supabase.auth.signOut(); setUser(null); setProfileRole('rider'); setCaptainOpen(false); setAdminOpen(false) }

  return <main className="min-h-screen bg-[#0b0c0f] text-[#f7f3ea] selection:bg-[#d7aa45]/30">
    <header className="relative z-30 flex min-h-20 items-center justify-between gap-3 border-b border-white/[0.07] bg-[#0b0c0f]/90 px-4 py-3 backdrop-blur-xl sm:px-8 lg:px-12">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3"><button aria-label="Open menu" className="rounded-full p-1.5 text-white/55 lg:hidden"><Menu /></button><div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#d6a943]/45 bg-[#d6a943]/10 text-[#e4bd65] sm:size-10"><Navigation className="size-4 fill-current sm:size-5" /></div><div className="min-w-0"><div className="truncate font-serif text-[21px] font-bold tracking-tight text-[#f0c967] sm:text-2xl">Ooo <span className="text-white">Rickshaw</span></div><div className="-mt-1 truncate text-[8px] uppercase tracking-[.16em] text-white/40 sm:text-[9px] sm:tracking-[.25em]">Har sawari khaas hoti hai</div></div></div>
      <nav className="hidden items-center gap-8 text-sm text-white/55 lg:flex"><a className="text-[#e5be67]" href="#book">Book a ride</a><a href="#rides">My rides</a><button onClick={() => setCaptainOpen(true)}>Become a captain</button>{isOwner && <button onClick={openAdmin} className="text-[#e5be67]">Owner dashboard</button>}</nav>
      <div className="flex shrink-0 items-center gap-3">{user ? <button onClick={signOut} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] py-2 pl-2 pr-2.5 text-xs sm:gap-2 sm:pr-3 sm:text-sm"><span className="flex size-7 items-center justify-center rounded-full bg-[#d5a844]/20 text-[#e5bf69]"><UserRound className="size-4" /></span><span className="hidden sm:inline">Account</span><ChevronDown className="size-3.5 text-white/40" /></button> : <button onClick={() => setAuthOpen(true)} className="rounded-full bg-[#d8ad50] px-3 py-2 text-xs font-semibold text-[#17130a] sm:px-4 sm:text-sm">Sign in</button>}</div>
    </header>

    <div className="mx-auto grid max-w-[1500px] grid-cols-1 lg:grid-cols-[420px_1fr] xl:grid-cols-[465px_1fr]">
      <section id="book" className="relative z-20 border-r border-white/[0.07] bg-[#0f1014] px-5 py-7 sm:px-8 lg:min-h-[calc(100vh-5rem)] lg:px-10 lg:py-12"><div className="mb-9"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d4a63e]/20 bg-[#d4a63e]/[0.07] px-3 py-1.5 text-[11px] uppercase tracking-[.18em] text-[#e4bd65]"><span className="size-1.5 rounded-full bg-[#e4bd65]" /> Wherever you are</div><h1 className="max-w-sm font-serif text-[42px] leading-[1.04] tracking-tight text-white sm:text-5xl">Your city.<br /><span className="text-[#dfb45b]">Your ride.</span></h1><p className="mt-4 max-w-xs text-sm leading-6 text-white/45">Reliable rides for every journey, wherever life takes you. No surge, no surprises.</p></div><div className="mb-8 flex items-center gap-2 border-b border-white/[0.08] pb-4 text-xs text-white/40"><ShieldCheck className="size-4 text-[#d5aa51]" /> Safe, transparent fares · Trusted local captains</div>
        <div className="space-y-3"><div className="rounded-2xl border border-white/10 bg-white/[0.045] p-1 focus-within:border-[#d5aa51]/60"><div className="flex items-center gap-3 px-3 py-2.5"><span className="flex size-8 items-center justify-center rounded-full bg-[#d5aa51]/15 text-[#d5aa51]"><LocateFixed className="size-4" /></span><div className="min-w-0 flex-1"><label className="block text-[10px] uppercase tracking-widest text-white/35">Pickup</label><input value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none" /></div><button type="button" aria-label="Use my current location" title="Use my current location" onClick={() => { if (!navigator.geolocation) { setLocationState('denied'); return }; setLocationState('locating'); navigator.geolocation.getCurrentPosition(({ coords }) => { setUserLocation({ lat: coords.latitude, lng: coords.longitude }); setPickup('My current location'); setLocationState('ready') }, () => setLocationState('denied'), { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }) }} className="rounded-full p-1 text-white/35 transition hover:bg-white/10 hover:text-[#e5bd65]"><Crosshair className="size-4" /></button></div></div>{locationState === 'denied' && <p className="mt-1 px-3 text-[10px] text-amber-200/70">Location permission was blocked. Enter your pickup manually.</p>}{locationState === 'locating' && <p className="mt-1 px-3 text-[10px] text-white/40">Finding your location...</p>}<div className="flex justify-center -my-5 relative z-10"><div className="h-8 w-px border-l border-dashed border-[#d5aa51]/50" /></div><div className="relative rounded-2xl border border-white/10 bg-white/[0.045] p-1 focus-within:border-[#d5aa51]/60"><div className="flex items-center gap-3 px-3 py-2.5"><span className="flex size-8 items-center justify-center rounded-full bg-[#d5a844]/15 text-[#e5b856]"><MapPin className="size-4" /></span><div className="min-w-0 flex-1"><label className="block text-[10px] uppercase tracking-widest text-white/35">Where to?</label><input value={dropoff} onFocus={() => setShowPlaces(true)} onChange={(e) => { setDropoff(e.target.value); setShowPlaces(true) }} placeholder="Enter destination" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35" /></div></div>{showPlaces && <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1b20] p-2 shadow-2xl"><div className="flex justify-between px-3 py-2 text-[10px] uppercase tracking-widest text-white/35">Popular in Nawabshah <button onClick={() => setShowPlaces(false)}><X className="size-3.5" /></button></div>{places.filter((place) => place.toLowerCase().includes(dropoff.toLowerCase())).map((place) => <button key={place} onClick={() => { setDropoff(place); setShowPlaces(false) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/75 hover:bg-white/10"><MapPin className="size-4 text-[#d5aa51]" />{place}</button>)}</div>}</div></div>
        <div className="mt-9"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-medium text-white/75">Choose your ride</h2><span className="text-xs text-[#e0b45d]">Cash only</span></div><div className="grid grid-cols-3 gap-2">{rides.map(({ name, meta, price, icon: Icon }) => <button key={name} onClick={() => setSelectedRide(name)} className={`rounded-2xl border p-3 text-left transition ${selectedRide === name ? 'border-[#d5aa51] bg-[#d5aa51]/[0.11]' : 'border-white/10 bg-white/[0.035] hover:border-white/20'}`}><Icon className={`mb-5 size-6 ${selectedRide === name ? 'text-[#e3b85e]' : 'text-white/55'}`} /><span className="block text-xs font-medium text-white/85">{name}</span><span className="mt-1 block text-[10px] text-white/35">{meta}</span><span className="mt-3 block text-xs text-[#e4bd65]">Rs. {price}</span></button>)}</div></div>
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"><div><div className="flex items-center gap-2 text-xs text-white/45"><WalletCards className="size-4 text-[#d5aa51]" /> Estimated fare</div><div className="mt-1 font-serif text-2xl text-white">Rs. {fare}</div></div><div className="text-right text-[11px] leading-5 text-white/35">4.8 km · 14 min<br /><span className="text-[#cba654]">No surge pricing</span></div></div>
        <button onClick={requestRide} disabled={!dropoff || busy || !!activeRide} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d8ad50] py-4 text-sm font-semibold text-[#17130a] shadow-[0_8px_30px_rgba(216,173,80,.15)] hover:bg-[#edc66f] disabled:cursor-not-allowed disabled:opacity-45">{busy ? 'Requesting...' : activeRide ? 'Ride in progress' : <>Find a {selectedRide} <span className="text-base">→</span></>}</button><div className="mt-5 flex justify-center gap-5 text-[10px] uppercase tracking-widest text-white/25"><span>Cash payment</span><span>•</span><span>24/7 support</span></div>
      </section>
      <section aria-label="Live captain map" className="relative block h-64 min-h-0 overflow-hidden bg-[#17191c] sm:h-80 lg:min-h-[calc(100vh-5rem)] lg:h-auto"><div className="map-grid absolute inset-0 opacity-70" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_45%,rgba(203,162,71,.11),transparent_32%),linear-gradient(110deg,rgba(8,9,12,.3),transparent_45%,rgba(8,9,12,.25))]" /><div className="absolute left-[52%] top-[42%] flex size-4 items-center justify-center"><span className="absolute size-16 animate-ping rounded-full bg-[#d8ad50]/10" /><span className="relative size-4 rounded-full border-[3px] border-[#f3cc72] bg-[#d8ad50]" /></div>{userLocation && <div className="absolute left-[45%] top-[54%] flex size-4 items-center justify-center"><span className="absolute size-12 rounded-full bg-[#76a7d8]/15" /><span className="relative size-3 rounded-full border-2 border-white bg-[#76a7d8]" /></div>}<div className="absolute right-7 top-7 rounded-full border border-white/10 bg-[#101115]/75 px-3 py-2 text-xs text-white/55 backdrop-blur-xl"><span className="mr-2 inline-block size-2 rounded-full bg-[#83b77e]" /> {activeRide ? 'Tracking your captain' : '12 captains nearby'}</div><div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/10 bg-[#101115]/80 p-4 backdrop-blur-xl"><div className="flex items-center gap-2 text-xs text-white/60"><Crosshair className="size-4 text-[#d5aa51]" /> Live city pulse</div><p className="mt-2 text-sm leading-5 text-white/80">Captains are moving through your area right now.</p></div></section>
    </div>

    {activeRide && <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-[#d5aa51]/30 bg-[#191916]/95 p-4 shadow-2xl backdrop-blur-xl"><div className="flex items-start gap-3"><div className="flex size-10 items-center justify-center rounded-full bg-[#d5aa51]/15 text-[#e5bd65]"><Clock3 className="size-5 animate-pulse" /></div><div className="flex-1"><p className="text-sm font-medium">{activeRide.status === 'searching' ? 'Finding your captain' : 'Captain assigned'}</p><p className="mt-1 text-xs text-white/45">{activeRide.dropoff_text} · Cash · Rs. {activeRide.fare_pkr}</p></div><button onClick={cancelRide} className="text-xs text-white/45 hover:text-white">Cancel</button></div></div>}
    {authOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm"><form onSubmit={submitAuth} className="w-full max-w-md rounded-3xl border border-[#d5aa51]/30 bg-[#17181c] p-6 shadow-2xl"><div className="flex justify-between"><div><p className="text-[10px] uppercase tracking-[.2em] text-[#e5bd65]">Ooo Rickshaw account</p><h2 className="mt-2 font-serif text-3xl text-white">{authMode === 'login' ? 'Welcome back.' : 'Join Ooo Rickshaw.'}</h2></div><button type="button" onClick={() => setAuthOpen(false)}><X className="size-4 text-white/45" /></button></div>{authMode === 'signup' && <><input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" /><select value={accountRole} onChange={(e) => setAccountRole(e.target.value as typeof accountRole)} className="mt-3 w-full rounded-xl border border-white/10 bg-[#202126] px-4 py-3 text-sm text-white outline-none"><option value="rider">I need rides</option><option value="captain">I drive a vehicle</option><option value="owner">I operate a transportation company</option></select></>}<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" /><input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (6+ characters)" className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" />{authMessage && <p className="mt-3 text-sm text-[#e5bd65]">{authMessage}</p>}<button disabled={busy} className="mt-5 w-full rounded-xl bg-[#d8ad50] py-3 font-semibold text-[#17130a]">{busy ? 'Please wait...' : authMode === 'login' ? 'Sign in' : 'Create account'}</button><button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthMessage('') }} className="mt-4 w-full text-sm text-white/45 hover:text-white">{authMode === 'login' ? 'New to Ooo Rickshaw? Create an account' : 'Already have an account? Sign in'}</button></form></div>}
    {adminOpen && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:p-8"><section className="mx-auto max-w-5xl rounded-3xl border border-[#d5aa51]/30 bg-[#121318] p-5 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.2em] text-[#e5bd65]">Owner console</p><h2 className="mt-2 font-serif text-3xl text-white sm:text-4xl">Global operations</h2><p className="mt-2 text-sm text-white/45">Monitor rides and keep every city moving.</p></div><button aria-label="Close owner dashboard" onClick={() => setAdminOpen(false)}><X className="size-5 text-white/45" /></button></div><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-white/40">Total rides</p><p className="mt-2 text-2xl text-white">{adminRides.length}</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-white/40">Searching</p><p className="mt-2 text-2xl text-[#e5bd65]">{adminRides.filter((ride) => ride.status === 'searching').length}</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-white/40">Active</p><p className="mt-2 text-2xl text-[#83b77e]">{adminRides.filter((ride) => ['accepted','arriving','in_progress'].includes(ride.status)).length}</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-white/40">Cash value</p><p className="mt-2 text-2xl text-white">Rs. {adminRides.reduce((total, ride) => total + ride.fare_pkr, 0)}</p></div></div><div className="mt-7 overflow-hidden rounded-2xl border border-white/10"><div className="border-b border-white/10 px-4 py-3 text-sm text-white/70">Live ride dispatch</div>{adminLoading ? <p className="p-5 text-sm text-white/40">Loading operations...</p> : adminRides.length === 0 ? <p className="p-5 text-sm text-white/40">No rides have been requested yet.</p> : <div className="divide-y divide-white/[0.07]">{adminRides.map((ride) => <div key={ride.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm text-white">{ride.pickup_text} <span className="text-white/30">to</span> {ride.dropoff_text}</p><p className="mt-1 text-xs text-white/40">{ride.ride_type} · Cash · Rs. {ride.fare_pkr}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-white/[0.08] px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/55">{ride.status.replace('_', ' ')}</span>{ride.status === 'searching' && <button onClick={() => updateRideStatus(ride.id, 'accepted')} className="rounded-full bg-[#d8ad50] px-3 py-1.5 text-[10px] font-semibold text-[#17130a]">Assign</button>}{ride.status === 'accepted' && <button onClick={() => updateRideStatus(ride.id, 'arriving')} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-white/70">Mark arriving</button>}{ride.status === 'arriving' && <button onClick={() => updateRideStatus(ride.id, 'in_progress')} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-white/70">Start ride</button>}{ride.status === 'in_progress' && <button onClick={() => updateRideStatus(ride.id, 'completed')} className="rounded-full border border-[#83b77e]/40 px-3 py-1.5 text-[10px] text-[#a9d2a5]">Complete</button>}</div></div>)}</div>}</div></section></div>}
    {captainOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm"><div className="w-full max-w-md rounded-3xl border border-[#d5aa51]/30 bg-[#17181c] p-6 shadow-2xl"><div className="flex justify-between"><div><p className="text-[10px] uppercase tracking-[.2em] text-[#e5bd65]">Captain mode</p><h2 className="mt-2 font-serif text-3xl">Ready to earn?</h2></div><button onClick={() => setCaptainOpen(false)}><X className="size-4 text-white/45" /></button></div><p className="mt-3 text-sm leading-6 text-white/50">Go online to receive nearby ride requests wherever you operate.</p><div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div><div className="text-sm text-white/80">Available for rides</div><div className="mt-1 text-xs text-white/40">{online ? 'You are visible to riders' : 'You are currently offline'}</div></div><button onClick={() => setOnline(!online)} className={`rounded-full px-4 py-2 text-xs font-semibold ${online ? 'bg-[#83b77e] text-[#102012]' : 'bg-[#d8ad50] text-[#17130a]'}`}>{online ? 'Go offline' : 'Go online'}</button></div><button onClick={() => { setCaptainOpen(false); if (!user) setAuthOpen(true) }} className="mt-4 w-full rounded-2xl border border-white/10 py-3 text-sm text-white/70">Open captain dashboard</button></div></div>}
  </main>
}
