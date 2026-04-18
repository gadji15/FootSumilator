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

      {/* Mobile-first main content wrapper */}
      <div className="flex-1 flex flex-col min-h-0 lg:p-0">
        {/* Mobile: Ultra-compact scoreboard bar at the very top */}
        <div className="lg:hidden shrink-0 flex items-center justify-center py-2 bg-black/50 backdrop-blur-md border-b border-white/5">
          <MatchScoreboard
            teamA={teamA}
            teamB={teamB}
            timer={timer}
            phase={phase}
            competition={competition}
            format={format}
          />
        </div>

        {/* Stage container - maximized on mobile */}
        <div className="flex-1 relative min-h-0">
          {/* Desktop scoreboard - floating */}
          <div className="hidden lg:block absolute top-3 left-1/2 -translate-x-1/2 z-20">
            <MatchScoreboard
              teamA={teamA}
              teamB={teamB}
              timer={timer}
              phase={phase}
              competition={competition}
              format={format}
              showDetails={true}
            />
          </div>

          {/* Arena Stage - THE HERO - minimal padding on mobile */}
          <div className="h-full p-1 lg:p-3">
            <MatchArenaStage
              teamAColor={teamA.color}
              teamBColor={teamB.color}
              isPlaying={isPlaying}
              phase={phase}
              format={format}
              competition={competition}
            />
          </div>

          {/* Desktop playback controls - overlaid */}
          <div className="hidden lg:block absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-lg">
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

        {/* Mobile timeline and info - directly below stage */}
        <div className="lg:hidden shrink-0 px-3 py-2.5 bg-black/60 backdrop-blur-md border-t border-white/8">
          {/* Match info badges */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold uppercase tracking-wide">
              {competition}
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
              {format}
            </span>
            {allowExtraTime && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                +ET
              </span>
            )}
            {allowPenalties && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                PK
              </span>
            )}
          </div>
          
          {/* Timeline */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-white/60 tabular-nums w-8 text-right">
              {currentMinute}&apos;
            </span>
            <div className="flex-1 relative h-2 bg-white/10 rounded-full overflow-hidden">
              {/* Progress */}
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-300"
                style={{ width: `${Math.min((currentMinute / totalMinutes) * 100, 100)}%` }}
              />
              {/* HT marker */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                style={{ left: `${(45 / totalMinutes) * 100}%` }}
              />
              {/* FT marker for extra time */}
              {allowExtraTime && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400/50"
                  style={{ left: `${(90 / totalMinutes) * 100}%` }}
                />
              )}
            </div>
            <span className="text-[10px] font-mono text-white/60 tabular-nums w-8">
              {totalMinutes}&apos;
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
