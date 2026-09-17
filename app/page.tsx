'use client'

import { useState } from 'react'
import {
  Bell,
  Bike,
  CarFront,
  ChevronDown,
  Clock3,
  Crosshair,
  Gauge,
  Heart,
  LocateFixed,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Siren,
  Star,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'

const places = ['Mohni Bazar', 'Sakrand Road', 'QUEST University', 'Peoples Medical College', 'Station Road', 'Housing Society']

const rideTypes = [
  { name: 'Rickshaw', meta: '4 min away', price: 'Rs. 180', icon: CarFront },
  { name: 'Express Bike', meta: '2 min away', price: 'Rs. 120', icon: Bike },
  { name: 'Mini Car', meta: '6 min away', price: 'Rs. 260', icon: CarFront },
]

export default function Page() {
  const [pickup, setPickup] = useState('My current location')
  const [dropoff, setDropoff] = useState('')
  const [selectedRide, setSelectedRide] = useState('Rickshaw')
  const [showPlaces, setShowPlaces] = useState(false)
  const [requested, setRequested] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [captainMode, setCaptainMode] = useState(false)
  const [isOnline, setIsOnline] = useState(false)

  return (
    <main className="min-h-screen bg-[#0b0c0f] text-[#f7f3ea] selection:bg-[#d7aa45]/30">
      <header className="relative z-30 flex h-20 items-center justify-between border-b border-white/[0.07] bg-[#0b0c0f]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <button aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)} className="rounded-full p-2 text-white/55 transition hover:bg-white/10 hover:text-white lg:hidden"><Menu /></button>
          <div className="flex size-10 items-center justify-center rounded-xl border border-[#d6a943]/45 bg-[#d6a943]/10 text-[#e4bd65] shadow-[0_0_28px_rgba(212,175,55,.12)]"><Navigation className="size-5 fill-current" /></div>
          <div><div className="font-serif text-2xl font-bold tracking-tight text-[#f0c967]">CHALO<span className="text-white">!</span></div><div className="-mt-1 text-[9px] uppercase tracking-[.25em] text-white/40">Har sawari khaas hoti hai</div></div>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-white/55 lg:flex"><a className="text-[#e5be67]" href="#book">Book a ride</a><a href="#rides" className="transition hover:text-white">My rides</a><button onClick={() => setCaptainMode(true)} className="transition hover:text-white">Become a captain</button></nav>
        <div className="flex items-center gap-3"><button aria-label="Notifications" className="relative rounded-full p-2.5 text-white/55 transition hover:bg-white/10 hover:text-white"><Bell className="size-[18px]" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#e2b553]" /></button><button className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-2 pl-2 pr-3 text-sm sm:flex"><span className="flex size-7 items-center justify-center rounded-full bg-[#d5a844]/20 text-[#e5bf69]"><UserRound className="size-4" /></span> Ahmed <ChevronDown className="size-3.5 text-white/40" /></button></div>
      </header>

      {captainMode && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"><div className="w-full max-w-md rounded-3xl border border-[#d5aa51]/30 bg-[#17181c] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><div className="text-[10px] uppercase tracking-[.2em] text-[#e5bd65]">Captain mode</div><h2 className="mt-2 font-serif text-3xl text-white">Ready to earn?</h2></div><button aria-label="Close captain mode" onClick={() => setCaptainMode(false)} className="rounded-full p-2 text-white/45 hover:bg-white/10 hover:text-white"><X className="size-4" /></button></div><p className="mt-3 text-sm leading-6 text-white/50">Go online to receive nearby ride requests around Nawabshah.</p><div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div><div className="text-sm text-white/80">Available for rides</div><div className="mt-1 text-xs text-white/40">{isOnline ? 'You are visible to riders' : 'You are currently offline'}</div></div><button onClick={() => setIsOnline(!isOnline)} className={`rounded-full px-4 py-2 text-xs font-semibold ${isOnline ? 'bg-[#83b77e] text-[#102012]' : 'bg-[#d8ad50] text-[#17130a]'}`}>{isOnline ? 'Go offline' : 'Go online'}</button></div><button onClick={() => setCaptainMode(false)} className="mt-4 w-full rounded-2xl border border-white/10 py-3 text-sm text-white/70 hover:bg-white/5">View captain dashboard</button></div></div>}

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 lg:grid-cols-[420px_1fr] xl:grid-cols-[465px_1fr]">
        <section id="book" className={`relative z-20 border-r border-white/[0.07] bg-[#0f1014] px-5 py-7 sm:px-8 lg:min-h-[calc(100vh-5rem)] lg:px-10 lg:py-12 ${menuOpen ? 'block' : 'block'}`}>
          <div className="mb-9"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d4a63e]/20 bg-[#d4a63e]/[0.07] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[.18em] text-[#e4bd65]"><span className="size-1.5 rounded-full bg-[#e4bd65] shadow-[0_0_8px_#e4bd65]" /> Nawabshah, Sindh</div><h1 className="max-w-sm font-serif text-[42px] leading-[1.04] tracking-tight text-white sm:text-5xl">Your city.<br /><span className="text-[#dfb45b]">Your ride.</span></h1><p className="mt-4 max-w-xs text-sm leading-6 text-white/45">Reliable rides for every corner of Nawabshah. No surge, no surprises.</p></div>
          <div className="mb-8 flex items-center gap-2 border-b border-white/[0.08] pb-4 text-xs text-white/40"><ShieldCheck className="size-4 text-[#d5aa51]" /> Safe, transparent fares · Trusted local captains</div>
          <div className="space-y-3">
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.045] p-1 transition focus-within:border-[#d5aa51]/60"><div className="flex items-center gap-3 px-3 py-2.5"><span className="flex size-8 items-center justify-center rounded-full bg-[#d5aa51]/15 text-[#d5aa51]"><LocateFixed className="size-4" /></span><div className="min-w-0 flex-1"><label className="block text-[10px] uppercase tracking-widest text-white/35">Pickup</label><input value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35" /></div><button aria-label="Use current location" className="text-white/35 hover:text-[#d5aa51]"><Crosshair className="size-4" /></button></div></div>
            <div className="flex justify-center -my-5 relative z-10"><div className="h-8 w-px border-l border-dashed border-[#d5aa51]/50" /></div>
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.045] p-1 transition focus-within:border-[#d5aa51]/60"><div className="flex items-center gap-3 px-3 py-2.5"><span className="flex size-8 items-center justify-center rounded-full bg-[#d5a844]/15 text-[#e5b856]"><MapPin className="size-4" /></span><div className="min-w-0 flex-1"><label className="block text-[10px] uppercase tracking-widest text-white/35">Where to?</label><input value={dropoff} onFocus={() => setShowPlaces(true)} onChange={(e) => { setDropoff(e.target.value); setShowPlaces(true) }} placeholder="Enter destination" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35" /></div><Search className="mr-2 size-4 text-white/25" /></div>
              {showPlaces && <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1b20] p-2 shadow-2xl"><div className="flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-widest text-white/35">Popular in Nawabshah <button onClick={() => setShowPlaces(false)} aria-label="Close destinations"><X className="size-3.5" /></button></div>{places.map((place) => <button key={place} onClick={() => { setDropoff(place); setShowPlaces(false) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/75 transition hover:bg-white/10 hover:text-white"><MapPin className="size-4 text-[#d5aa51]" />{place}</button>)}</div>}
            </div>
          </div>
          <div className="mt-9"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-medium text-white/75">Choose your ride</h2><button className="text-xs text-[#e0b45d]">See all</button></div><div className="grid grid-cols-3 gap-2">{rideTypes.map((ride) => { const Icon = ride.icon; return <button key={ride.name} onClick={() => setSelectedRide(ride.name)} className={`rounded-2xl border p-3 text-left transition ${selectedRide === ride.name ? 'border-[#d5aa51] bg-[#d5aa51]/[0.11] shadow-[0_0_20px_rgba(213,170,81,.08)]' : 'border-white/10 bg-white/[0.035] hover:border-white/20'}`}><Icon className={`mb-5 size-6 ${selectedRide === ride.name ? 'text-[#e3b85e]' : 'text-white/55'}`} /><span className="block text-xs font-medium text-white/85">{ride.name}</span><span className="mt-1 block text-[10px] text-white/35">{ride.meta}</span><span className="mt-3 block text-xs text-[#e4bd65]">{ride.price}</span></button> })}</div></div>
          <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"><div><div className="flex items-center gap-2 text-xs text-white/45"><WalletCards className="size-4 text-[#d5aa51]" /> Estimated fare</div><div className="mt-1 font-serif text-2xl text-white">Rs. {selectedRide === 'Rickshaw' ? '180' : selectedRide === 'Express Bike' ? '120' : '260'}</div></div><div className="text-right text-[11px] leading-5 text-white/35">4.8 km · 14 min<br /><span className="text-[#cba654]">No surge pricing</span></div></div>
          <button onClick={() => setRequested(true)} disabled={!dropoff || requested} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d8ad50] py-4 text-sm font-semibold text-[#17130a] shadow-[0_8px_30px_rgba(216,173,80,.15)] transition hover:bg-[#edc66f] disabled:cursor-not-allowed disabled:opacity-45">{requested ? <><Clock3 className="size-4 animate-pulse" /> Finding your captain...</> : <>Find a {selectedRide} <span className="text-base">→</span></>}</button>
          <div className="mt-5 flex justify-center gap-5 text-[10px] uppercase tracking-widest text-white/25"><span className="flex items-center gap-1.5"><Heart className="size-3" /> Made for Nawabshah</span><span>•</span><span>24/7 support</span></div>
        </section>

        <section className="relative hidden min-h-[calc(100vh-5rem)] overflow-hidden bg-[#17191c] lg:block">
          <div className="map-grid absolute inset-0 opacity-70" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_45%,rgba(203,162,71,.11),transparent_32%),linear-gradient(110deg,rgba(8,9,12,.3),transparent_45%,rgba(8,9,12,.25))]" />
          <div className="absolute left-[22%] top-[12%] h-[78%] w-px rotate-[35deg] bg-[#c6a354]/15" /><div className="absolute left-[49%] top-[7%] h-[100%] w-px rotate-[74deg] bg-[#c6a354]/15" /><div className="absolute left-[15%] top-[55%] h-px w-[78%] rotate-[-17deg] bg-[#c6a354]/20" /><div className="absolute left-[8%] top-[35%] h-px w-[85%] rotate-[11deg] bg-[#c6a354]/15" />
          <div className="absolute left-[28%] top-[26%] text-[10px] uppercase tracking-[.22em] text-white/20">Sakrand Road</div><div className="absolute left-[61%] top-[19%] rotate-[72deg] text-[10px] uppercase tracking-[.22em] text-white/20">Station Road</div><div className="absolute left-[67%] top-[67%] text-[10px] uppercase tracking-[.22em] text-white/20">Housing Society</div><div className="absolute left-[27%] top-[70%] text-[10px] uppercase tracking-[.22em] text-white/20">Mohni Bazar</div>
          <div className="absolute left-[52%] top-[42%] flex size-4 items-center justify-center"><span className="absolute size-16 animate-ping rounded-full bg-[#d8ad50]/10" /><span className="relative size-4 rounded-full border-[3px] border-[#f3cc72] bg-[#d8ad50] shadow-[0_0_22px_#d8ad50]" /></div>
          <div className="absolute left-[38%] top-[31%] flex flex-col items-center"><div className="rounded-full border border-[#d8ad50]/40 bg-[#2a2519] p-2 text-[#edc36a] shadow-[0_0_20px_rgba(216,173,80,.2)]"><CarFront className="size-4" /></div><div className="mt-1 text-[9px] text-white/45">3 min</div></div><div className="absolute left-[70%] top-[54%] flex flex-col items-center"><div className="rounded-full border border-[#d8ad50]/40 bg-[#2a2519] p-2 text-[#edc36a] shadow-[0_0_20px_rgba(216,173,80,.2)]"><Bike className="size-4" /></div><div className="mt-1 text-[9px] text-white/45">5 min</div></div><div className="absolute left-[30%] top-[61%] flex flex-col items-center"><div className="rounded-full border border-[#d8ad50]/40 bg-[#2a2519] p-2 text-[#edc36a] shadow-[0_0_20px_rgba(216,173,80,.2)]"><CarFront className="size-4" /></div><div className="mt-1 text-[9px] text-white/45">7 min</div></div>
          <div className="absolute right-7 top-7 flex items-center gap-2 rounded-full border border-white/10 bg-[#101115]/75 px-3 py-2 text-xs text-white/55 backdrop-blur-xl"><span className="size-2 rounded-full bg-[#83b77e] shadow-[0_0_8px_#83b77e]" /> 12 captains nearby</div><div className="absolute bottom-8 left-8 right-8 flex items-end justify-between"><div className="max-w-xs rounded-2xl border border-white/10 bg-[#101115]/80 p-4 backdrop-blur-xl"><div className="flex items-center gap-2 text-xs text-white/60"><Gauge className="size-4 text-[#d5aa51]" /> Live city pulse</div><p className="mt-2 text-sm leading-5 text-white/80">Most captains are around <span className="text-[#e5bd65]">Mohni Bazar</span> right now.</p></div><button className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-[#101115]/80 text-white/65 backdrop-blur-xl hover:text-white" aria-label="Center map"><Crosshair className="size-5" /></button></div>
        </section>
      </div>
      {requested && <div className="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border border-[#d5aa51]/30 bg-[#191916]/95 p-4 shadow-2xl backdrop-blur-xl"><div className="flex size-10 items-center justify-center rounded-full bg-[#d5aa51]/15 text-[#e5bd65]"><Clock3 className="size-5 animate-pulse" /></div><div className="flex-1"><p className="text-sm font-medium">Finding your captain</p><p className="text-xs text-white/45">Usually takes less than a minute</p></div><button aria-label="Cancel request" onClick={() => setRequested(false)} className="text-white/35 hover:text-white"><X className="size-4" /></button></div>}
    </main>
  )
}
