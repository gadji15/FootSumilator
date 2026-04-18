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
    <div className="inline-flex items-center bg-black/80 backdrop-blur-xl rounded-lg lg:rounded-full border border-white/[0.08] shadow-xl shadow-black/40">
      {/* Team A */}
      <div className="flex items-center gap-1.5 lg:gap-2 pl-2 pr-1.5 lg:pl-3 lg:pr-2 py-1 lg:py-1.5">
        <div 
          className="w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${teamA.color}30`, border: `1.5px solid ${teamA.color}` }}
        >
          {teamA.logo ? (
            <Image src={teamA.logo} alt={teamA.name} width={14} height={14} className="object-contain" />
          ) : (
            <span className="text-[7px] lg:text-[8px] font-bold" style={{ color: teamA.color }}>
              {teamA.shortName.slice(0, 2)}
            </span>
          )}
        </div>
        <span className="text-lg lg:text-xl font-bold text-white tabular-nums">
          {teamA.score}
        </span>
      </div>

      {/* Center - Timer & Phase - ultra compact */}
      <div className="flex flex-col items-center justify-center px-2.5 lg:px-3 py-0.5 bg-white/[0.04] border-x border-white/[0.06] min-w-[50px] lg:min-w-[56px]">
        <span className="text-xs lg:text-sm font-mono font-bold text-primary tabular-nums leading-none">
          {timer}
        </span>
        <span className="text-[6px] lg:text-[7px] uppercase tracking-wide text-white/50 font-medium mt-0.5">
          {phase}
        </span>
      </div>

      {/* Team B */}
      <div className="flex items-center gap-1.5 lg:gap-2 pr-2 pl-1.5 lg:pr-3 lg:pl-2 py-1 lg:py-1.5">
        <span className="text-lg lg:text-xl font-bold text-white tabular-nums">
          {teamB.score}
        </span>
        <div 
          className="w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${teamB.color}30`, border: `1.5px solid ${teamB.color}` }}
        >
          {teamB.logo ? (
            <Image src={teamB.logo} alt={teamB.name} width={14} height={14} className="object-contain" />
          ) : (
            <span className="text-[7px] lg:text-[8px] font-bold" style={{ color: teamB.color }}>
              {teamB.shortName.slice(0, 2)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
