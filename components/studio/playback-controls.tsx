"use client"

import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react"

interface PlaybackControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onRestart: () => void
  onJumpToHalfTime?: () => void
  onJumpToFullTime: () => void
  currentMinute: number
  totalMinutes: number
  phase?: string
  allowExtraTime: boolean
  allowPenalties: boolean
}

export function PlaybackControls({
  isPlaying,
  onPlayPause,
  onRestart,
  onJumpToFullTime,
  currentMinute,
  totalMinutes,
  allowExtraTime,
  allowPenalties,
}: PlaybackControlsProps) {
  const progress = Math.min((currentMinute / totalMinutes) * 100, 100)

  // Timeline markers
  const markers = [
    { label: "KO", position: 0 },
    { label: "HT", position: 50 },
    { label: "FT", position: 100 },
  ]
  
  if (allowExtraTime) {
    markers.push({ label: "ET", position: 110 * (100/120) }) // Extra time at 110 if 120 total
  }
  if (allowPenalties) {
    markers.push({ label: "PEN", position: 95 })
  }

  return (
    <div className="bg-black/60 backdrop-blur-xl rounded-full border border-white/[0.08] px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 shadow-xl shadow-black/30">
      {/* Restart */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 sm:h-7 sm:w-7 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
        onClick={onRestart}
      >
        <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </Button>

      {/* Play/Pause */}
      <Button
        size="icon"
        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
        onClick={onPlayPause}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        ) : (
          <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" />
        )}
      </Button>

      {/* Timeline */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="text-[9px] sm:text-[10px] font-mono text-white/50 tabular-nums shrink-0">
          {currentMinute}&apos;
        </span>
        <div className="flex-1 relative h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-primary/80 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
          {/* Progress indicator dot */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50 transition-all duration-300"
            style={{ left: `calc(${progress}% - 4px)` }}
          />
          {/* Timeline markers - desktop only */}
          <div className="hidden sm:block">
            {markers.slice(0, 3).map((marker) => (
              <div 
                key={marker.label}
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2 bg-white/20"
                style={{ left: `${marker.position}%` }}
              />
            ))}
          </div>
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono text-white/50 tabular-nums shrink-0">
          {totalMinutes}&apos;
        </span>
      </div>

      {/* Skip to end */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 sm:h-7 sm:w-7 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
        onClick={onJumpToFullTime}
      >
        <SkipForward className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </Button>
    </div>
  )
}
