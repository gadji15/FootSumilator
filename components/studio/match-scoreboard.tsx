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
}

export function MatchScoreboard({ teamA, teamB, timer, phase }: MatchScoreboardProps) {
  return (
    <div className="inline-flex items-center bg-black/70 backdrop-blur-xl rounded-full border border-white/[0.08] shadow-2xl shadow-black/50">
      {/* Team A */}
      <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 pr-1 sm:pl-2.5 sm:pr-1.5 py-1 sm:py-1.5">
        <div 
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${teamA.color}30`, border: `1.5px solid ${teamA.color}` }}
        >
          {teamA.logo ? (
            <Image src={teamA.logo} alt={teamA.name} width={14} height={14} className="object-contain" />
          ) : (
            <span className="text-[7px] sm:text-[8px] font-bold" style={{ color: teamA.color }}>
              {teamA.shortName.slice(0, 2)}
            </span>
          )}
        </div>
        <span className="hidden sm:block text-[10px] font-semibold text-white/90 min-w-[28px]">
          {teamA.shortName}
        </span>
        <span className="text-base sm:text-lg font-bold text-white tabular-nums">
          {teamA.score}
        </span>
      </div>

      {/* Center - Timer & Phase */}
      <div className="flex flex-col items-center justify-center px-2 sm:px-3 py-0.5 bg-white/[0.04] border-x border-white/[0.08] min-w-[44px] sm:min-w-[56px]">
        <span className="text-[11px] sm:text-sm font-mono font-bold text-primary tabular-nums leading-none">
          {timer}
        </span>
        <span className="text-[6px] sm:text-[7px] uppercase tracking-wide text-white/50 font-medium">
          {phase}
        </span>
      </div>

      {/* Team B */}
      <div className="flex items-center gap-1 sm:gap-1.5 pr-1.5 pl-1 sm:pr-2.5 sm:pl-1.5 py-1 sm:py-1.5">
        <span className="text-base sm:text-lg font-bold text-white tabular-nums">
          {teamB.score}
        </span>
        <span className="hidden sm:block text-[10px] font-semibold text-white/90 min-w-[28px] text-right">
          {teamB.shortName}
        </span>
        <div 
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${teamB.color}30`, border: `1.5px solid ${teamB.color}` }}
        >
          {teamB.logo ? (
            <Image src={teamB.logo} alt={teamB.name} width={14} height={14} className="object-contain" />
          ) : (
            <span className="text-[7px] sm:text-[8px] font-bold" style={{ color: teamB.color }}>
              {teamB.shortName.slice(0, 2)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
