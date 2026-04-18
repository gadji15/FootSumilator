"use client"

import { MatchArenaStage } from "./match-arena-stage"
import { MatchScoreboard } from "./match-scoreboard"
import { PlaybackControls } from "./playback-controls"

interface Team {
  name: string
  shortName: string
  color: string
  logo?: string
  score: number
}

interface SimulationViewerProps {
  teamA: Team
  teamB: Team
  timer: string
  phase: string
  currentMinute: number
  totalMinutes: number
  competition: string
  format: string
  isPlaying: boolean
  allowExtraTime: boolean
  allowPenalties: boolean
  onPlayPause: () => void
  onRestart: () => void
  onJumpToHalfTime: () => void
  onJumpToFullTime: () => void
}

export function SimulationViewer({
  teamA,
  teamB,
  timer,
  phase,
  currentMinute,
  totalMinutes,
  competition,
  format,
  isPlaying,
  allowExtraTime,
  allowPenalties,
  onPlayPause,
  onRestart,
  onJumpToHalfTime,
  onJumpToFullTime,
}: SimulationViewerProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      {/* Ambient team color reflections */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute w-[60%] h-[60%] -left-[20%] top-[20%] rounded-full blur-[100px] opacity-[0.08]"
          style={{ backgroundColor: teamA.color }}
        />
        <div 
          className="absolute w-[50%] h-[50%] -right-[10%] bottom-[10%] rounded-full blur-[80px] opacity-[0.06]"
          style={{ backgroundColor: teamB.color }}
        />
      </div>

      {/* Viewer Top Strip - Only on desktop */}
      <div className="hidden lg:flex items-center justify-between px-4 py-2 bg-black/30 backdrop-blur-sm border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-white/80">{teamA.name} vs {teamB.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">{competition}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/60 font-mono">{format}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/60">Preview</span>
        </div>
      </div>

      {/* Main Stage Area - Takes all available space */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Scoreboard - Integrated with stage, positioned at top */}
        <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 z-20">
          <MatchScoreboard
            teamA={teamA}
            teamB={teamB}
            timer={timer}
            phase={phase}
            competition={competition}
          />
        </div>

        {/* Arena Stage - The HERO - fills the space */}
        <div className="flex-1 p-1.5 sm:p-2 lg:p-3 min-h-0">
          <MatchArenaStage
            teamAColor={teamA.color}
            teamBColor={teamB.color}
            isPlaying={isPlaying}
            phase={phase}
          />
        </div>

        {/* Playback Controls - Overlaid at bottom of stage */}
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-lg">
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onRestart={onRestart}
            onJumpToHalfTime={onJumpToHalfTime}
            onJumpToFullTime={onJumpToFullTime}
            currentMinute={currentMinute}
            totalMinutes={totalMinutes}
            phase={phase}
            allowExtraTime={allowExtraTime}
            allowPenalties={allowPenalties}
          />
        </div>
      </div>
    </div>
  )
}
