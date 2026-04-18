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

const competitionConfig: Record<string, { label: string; accentColor: string; textColor: string }> = {
  UCL:       { label: "UEFA Champions League", accentColor: "#1A56FF", textColor: "#7CB3FF" },
  UEL:       { label: "UEFA Europa League",    accentColor: "#F68E1E", textColor: "#FBBD74" },
  Euro:      { label: "UEFA Euro",             accentColor: "#003087", textColor: "#5B9BFF" },
  AFCON:     { label: "Africa Cup of Nations", accentColor: "#009639", textColor: "#4FD87C" },
  "World Cup": { label: "FIFA World Cup",      accentColor: "#C8102E", textColor: "#FF6B6B" },
  League:    { label: "Domestic League",       accentColor: "#444466", textColor: "#A0A0C0" },
}

function TeamShieldPlaceholder({ color, shortName }: { color: string; shortName: string }) {
  return (
    <svg viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path
        d="M14 1L2 6V16C2 23.2 7.4 29.8 14 31C20.6 29.8 26 23.2 26 16V6L14 1Z"
        fill={`${color}30`}
        stroke={color}
        strokeWidth="1.5"
      />
      <text
        x="14"
        y="20"
        textAnchor="middle"
        fill={color}
        fontSize="8"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        {shortName.slice(0, 3)}
      </text>
    </svg>
  )
}

export function MatchScoreboard({
  teamA,
  teamB,
  timer,
  phase,
  competition = "League",
  format = "9:16",
  showDetails = false,
}: MatchScoreboardProps) {
  const comp = competitionConfig[competition] || competitionConfig.League
  const isFullTime = phase === "Full Time"

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Competition badge — always shown when showDetails, always shown on mobile too */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[8px] font-semibold uppercase tracking-wider"
        style={{
          backgroundColor: `${comp.accentColor}22`,
          color: comp.textColor,
          border: `1px solid ${comp.accentColor}50`,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: comp.textColor }}
        />
        <span>{competition}</span>
        {showDetails && (
          <>
            <span className="opacity-40">|</span>
            <span className="font-mono opacity-70">{format}</span>
          </>
        )}
      </div>

      {/* Main scoreboard pill */}
      <div className="inline-flex items-center bg-black/85 backdrop-blur-xl rounded-lg lg:rounded-full border border-white/[0.08] shadow-xl shadow-black/40">
        {/* Team A */}
        <div className="flex items-center gap-1.5 lg:gap-2 pl-2 pr-1.5 lg:pl-3 lg:pr-2 py-1.5 lg:py-2">
          <div
            className="w-7 h-8 shrink-0 transition-transform hover:scale-105"
            title={teamA.name}
          >
            {teamA.logo ? (
              <Image src={teamA.logo} alt={teamA.name} width={28} height={32} className="object-contain w-full h-full" />
            ) : (
              <TeamShieldPlaceholder color={teamA.color} shortName={teamA.shortName} />
            )}
          </div>
          <span className="hidden lg:block text-[10px] font-semibold text-white/80 max-w-[64px] truncate">
            {teamA.shortName}
          </span>
          <span
            className="text-xl lg:text-2xl font-bold text-white tabular-nums min-w-[24px] text-center"
            style={{ textShadow: `0 0 20px ${teamA.color}70` }}
          >
            {teamA.score}
          </span>
        </div>

        {/* Center — Timer & Phase */}
        <div className="flex flex-col items-center justify-center px-3 lg:px-4 py-1 bg-white/[0.04] border-x border-white/[0.08] min-w-[58px] lg:min-w-[72px]">
          <div className="flex items-center gap-1.5 mb-0.5">
            {!isFullTime ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[7px] uppercase tracking-wider text-white/40 font-medium">Live</span>
              </>
            ) : (
              <span className="text-[7px] uppercase tracking-wider text-white/40 font-medium">FT</span>
            )}
          </div>
          <span className="text-sm lg:text-base font-mono font-bold text-primary tabular-nums leading-none">
            {timer}
          </span>
          <span className="text-[7px] lg:text-[8px] uppercase tracking-wide text-white/50 font-medium mt-0.5 truncate max-w-[56px] text-center">
            {phase}
          </span>
        </div>

        {/* Team B */}
        <div className="flex items-center gap-1.5 lg:gap-2 pr-2 pl-1.5 lg:pr-3 lg:pl-2 py-1.5 lg:py-2">
          <span
            className="text-xl lg:text-2xl font-bold text-white tabular-nums min-w-[24px] text-center"
            style={{ textShadow: `0 0 20px ${teamB.color}70` }}
          >
            {teamB.score}
          </span>
          <span className="hidden lg:block text-[10px] font-semibold text-white/80 max-w-[64px] truncate">
            {teamB.shortName}
          </span>
          <div
            className="w-7 h-8 shrink-0 transition-transform hover:scale-105"
            title={teamB.name}
          >
            {teamB.logo ? (
              <Image src={teamB.logo} alt={teamB.name} width={28} height={32} className="object-contain w-full h-full" />
            ) : (
              <TeamShieldPlaceholder color={teamB.color} shortName={teamB.shortName} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
