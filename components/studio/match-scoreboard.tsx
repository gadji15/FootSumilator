"use client"

import Image from "next/image"

interface Team {
  name: string
  shortName: string
  color: string
  logo?: string
  score: number
}

interface MatchScoreboardProps {
  teamA: Team
  teamB: Team
  timer: string
  phase: string
  competition?: string
  format?: string
  showDetails?: boolean
}

// Competition badge configurations
const competitionConfig: Record<string, { label: string; color: string; icon: string }> = {
  ucl: { label: "UCL", color: "#0D1B3E", icon: "star" },
  europa: { label: "UEL", color: "#F68E1E", icon: "shield" },
  euro: { label: "EURO", color: "#003087", icon: "flag" },
  afcon: { label: "AFCON", color: "#009639", icon: "trophy" },
  worldcup: { label: "FIFA", color: "#5B0A91", icon: "globe" },
  league: { label: "LEAGUE", color: "#1A1A2E", icon: "circle" },
}

export function MatchScoreboard({ 
  teamA, 
  teamB, 
  timer, 
  phase, 
  competition = "league",
  format = "9:16",
  showDetails = false,
}: MatchScoreboardProps) {
  const compConfig = competitionConfig[competition] || competitionConfig.league
  
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Competition badge - visible on desktop or when showDetails */}
      {(showDetails) && (
        <div 
          className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-semibold uppercase tracking-wider"
          style={{ 
            backgroundColor: `${compConfig.color}40`,
            color: 'white',
            border: `1px solid ${compConfig.color}60`,
          }}
        >
          <span>{compConfig.label}</span>
          <span className="opacity-50">|</span>
          <span className="font-mono">{format}</span>
        </div>
      )}
      
      {/* Main scoreboard */}
      <div className="inline-flex items-center bg-black/85 backdrop-blur-xl rounded-lg lg:rounded-full border border-white/[0.08] shadow-xl shadow-black/40">
        {/* Team A */}
        <div className="flex items-center gap-1.5 lg:gap-2 pl-2 pr-1.5 lg:pl-3 lg:pr-2 py-1.5 lg:py-2">
          {/* Team badge */}
          <div 
            className="w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-105"
            style={{ 
              backgroundColor: `${teamA.color}25`, 
              border: `2px solid ${teamA.color}`,
              boxShadow: `0 0 12px ${teamA.color}40`,
            }}
          >
            {teamA.logo ? (
              <Image src={teamA.logo} alt={teamA.name} width={16} height={16} className="object-contain" />
            ) : (
              <span className="text-[8px] lg:text-[9px] font-bold" style={{ color: teamA.color }}>
                {teamA.shortName.slice(0, 2)}
              </span>
            )}
          </div>
          {/* Team name - desktop only */}
          <span className="hidden lg:block text-[10px] font-medium text-white/70 max-w-[60px] truncate">
            {teamA.shortName}
          </span>
          {/* Score */}
          <span 
            className="text-xl lg:text-2xl font-bold text-white tabular-nums min-w-[24px] text-center"
            style={{ textShadow: `0 0 20px ${teamA.color}60` }}
          >
            {teamA.score}
          </span>
        </div>

        {/* Center - Timer & Phase */}
        <div className="flex flex-col items-center justify-center px-3 lg:px-4 py-1 bg-white/[0.04] border-x border-white/[0.08] min-w-[56px] lg:min-w-[70px]">
          {/* Live indicator dot */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[7px] uppercase tracking-wider text-white/40 font-medium">Live</span>
          </div>
          {/* Timer */}
          <span className="text-sm lg:text-base font-mono font-bold text-primary tabular-nums leading-none">
            {timer}
          </span>
          {/* Phase */}
          <span className="text-[7px] lg:text-[8px] uppercase tracking-wide text-white/50 font-medium mt-0.5">
            {phase}
          </span>
        </div>

        {/* Team B */}
        <div className="flex items-center gap-1.5 lg:gap-2 pr-2 pl-1.5 lg:pr-3 lg:pl-2 py-1.5 lg:py-2">
          {/* Score */}
          <span 
            className="text-xl lg:text-2xl font-bold text-white tabular-nums min-w-[24px] text-center"
            style={{ textShadow: `0 0 20px ${teamB.color}60` }}
          >
            {teamB.score}
          </span>
          {/* Team name - desktop only */}
          <span className="hidden lg:block text-[10px] font-medium text-white/70 max-w-[60px] truncate">
            {teamB.shortName}
          </span>
          {/* Team badge */}
          <div 
            className="w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-105"
            style={{ 
              backgroundColor: `${teamB.color}25`, 
              border: `2px solid ${teamB.color}`,
              boxShadow: `0 0 12px ${teamB.color}40`,
            }}
          >
            {teamB.logo ? (
              <Image src={teamB.logo} alt={teamB.name} width={16} height={16} className="object-contain" />
            ) : (
              <span className="text-[8px] lg:text-[9px] font-bold" style={{ color: teamB.color }}>
                {teamB.shortName.slice(0, 2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
