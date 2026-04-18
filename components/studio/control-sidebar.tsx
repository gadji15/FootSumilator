"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Users,
  Trophy,
  Settings,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Download,
  Film,
  Upload,
  TrendingUp
} from "lucide-react"

interface Team {
  name: string
  shortName: string
  color: string
  score: number
}

interface ControlSidebarProps {
  teamA: Team
  teamB: Team
  onTeamAChange: (team: Partial<Team>) => void
  onTeamBChange: (team: Partial<Team>) => void
  competition: string
  onCompetitionChange: (comp: string) => void
  simulationMode: string
  onSimulationModeChange: (mode: string) => void
  winnerBias: "teamA" | "teamB" | "none"
  onWinnerBiasChange: (bias: "teamA" | "teamB" | "none") => void
  allowExtraTime: boolean
  onAllowExtraTimeChange: (allow: boolean) => void
  allowPenalties: boolean
  onAllowPenaltiesChange: (allow: boolean) => void
  tempo: number
  onTempoChange: (tempo: number) => void
  phase: string
  currentMinute: number
  isPlaying: boolean
  onPlayPause: () => void
  onRestart: () => void
  outputFormat: string
  onOutputFormatChange: (format: string) => void
  resolution: string
  onResolutionChange: (res: string) => void
  onExport: () => void
  onRender: () => void
  renderStatus: "ready" | "rendering" | "exported"
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-3.5 h-3.5 text-primary" />
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-foreground">{title}</h3>
    </div>
  )
}

export function ControlSidebar({
  teamA,
  teamB,
  onTeamAChange,
  onTeamBChange,
  competition,
  onCompetitionChange,
  simulationMode,
  onSimulationModeChange,
  winnerBias,
  onWinnerBiasChange,
  allowExtraTime,
  onAllowExtraTimeChange,
  allowPenalties,
  onAllowPenaltiesChange,
  tempo,
  onTempoChange,
  phase,
  currentMinute,
  isPlaying,
  onPlayPause,
  onRestart,
  outputFormat,
  onOutputFormatChange,
  resolution,
  onResolutionChange,
  onExport,
  onRender,
  renderStatus,
}: ControlSidebarProps) {
  const statusConfig = {
    ready: { label: "Ready", className: "bg-primary/20 text-primary" },
    rendering: { label: "Rendering...", className: "bg-studio-goal-gold/20 text-studio-goal-gold animate-pulse" },
    exported: { label: "Exported!", className: "bg-accent/20 text-accent" },
  }

  return (
    <div className="h-full flex flex-col bg-card/50">
      <div className="shrink-0 px-3 py-2.5 border-b border-border/30">
        <h2 className="text-xs font-semibold text-foreground">Controls</h2>
        <p className="text-[9px] text-muted-foreground">Configure your simulation</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Teams */}
          <section>
            <SectionHeader icon={Users} title="Teams" />
            <div className="space-y-2.5">
              <div className="space-y-1">
                <Label className="text-[9px] text-muted-foreground">Team A</Label>
                <div className="flex gap-1.5">
                  <Input
                    value={teamA.name}
                    onChange={(e) => onTeamAChange({ name: e.target.value, shortName: e.target.value.slice(0, 3).toUpperCase() })}
                    className="h-7 text-[11px] bg-input"
                    placeholder="Name"
                  />
                  <input
                    type="color"
                    value={teamA.color}
                    onChange={(e) => onTeamAChange({ color: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                </div>
                <Button variant="outline" size="sm" className="w-full h-5 text-[9px] gap-1">
                  <Upload className="w-2.5 h-2.5" />
                  Logo
                </Button>
              </div>

              <div className="space-y-1">
                <Label className="text-[9px] text-muted-foreground">Team B</Label>
                <div className="flex gap-1.5">
                  <Input
                    value={teamB.name}
                    onChange={(e) => onTeamBChange({ name: e.target.value, shortName: e.target.value.slice(0, 3).toUpperCase() })}
                    className="h-7 text-[11px] bg-input"
                    placeholder="Name"
                  />
                  <input
                    type="color"
                    value={teamB.color}
                    onChange={(e) => onTeamBChange({ color: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                </div>
                <Button variant="outline" size="sm" className="w-full h-5 text-[9px] gap-1">
                  <Upload className="w-2.5 h-2.5" />
                  Logo
                </Button>
              </div>
            </div>
          </section>

          <Separator className="bg-border/30" />

          {/* Competition */}
          <section>
            <SectionHeader icon={Trophy} title="Competition" />
            <Select value={competition} onValueChange={onCompetitionChange}>
              <SelectTrigger className="h-7 text-[11px] bg-input">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="league">League</SelectItem>
                <SelectItem value="ucl">Champions League</SelectItem>
                <SelectItem value="europa">Europa League</SelectItem>
                <SelectItem value="euro">Euro</SelectItem>
                <SelectItem value="afcon">AFCON</SelectItem>
                <SelectItem value="worldcup">World Cup</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center justify-center p-1.5 mt-1.5 rounded bg-muted/30">
              <Badge variant="secondary" className="text-[9px] font-medium">
                {competition === "ucl" ? "UEFA Champions League" : 
                 competition === "europa" ? "UEFA Europa League" :
                 competition === "euro" ? "UEFA Euro" :
                 competition === "afcon" ? "Africa Cup of Nations" :
                 competition === "worldcup" ? "FIFA World Cup" :
                 "Domestic League"}
              </Badge>
            </div>
          </section>

          <Separator className="bg-border/30" />

          {/* Match Rules */}
          <section>
            <SectionHeader icon={Settings} title="Match Rules" />
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-[9px] text-muted-foreground">Simulation Mode</Label>
                <Select value={simulationMode} onValueChange={onSimulationModeChange}>
                  <SelectTrigger className="h-6 text-[10px] bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="oriented">Oriented</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <Label className="text-[9px] text-muted-foreground">Extra Time</Label>
                <Switch
                  checked={allowExtraTime}
                  onCheckedChange={onAllowExtraTimeChange}
                  className="scale-75"
                />
              </div>

              <div className="flex items-center justify-between py-0.5">
                <Label className="text-[9px] text-muted-foreground">Penalties</Label>
                <Switch
                  checked={allowPenalties}
                  onCheckedChange={onAllowPenaltiesChange}
                  className="scale-75"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[9px] text-muted-foreground">Tempo</Label>
                  <span className="text-[9px] font-mono text-foreground">{tempo}%</span>
                </div>
                <Slider
                  value={[tempo]}
                  onValueChange={([v]) => onTempoChange(v)}
                  min={25}
                  max={100}
                  step={5}
                  className="h-4"
                />
              </div>
            </div>
          </section>

          <Separator className="bg-border/30" />

          {/* Winner Bias */}
          <section>
            <SectionHeader icon={TrendingUp} title="Predicted Winner" />
            <div className="grid grid-cols-3 gap-1">
              {(["teamA", "none", "teamB"] as const).map((bias) => {
                const label = bias === "teamA" ? teamA.shortName : bias === "teamB" ? teamB.shortName : "None"
                const color = bias === "teamA" ? teamA.color : bias === "teamB" ? teamB.color : null
                const isActive = winnerBias === bias
                return (
                  <button
                    key={bias}
                    onClick={() => onWinnerBiasChange(bias)}
                    className={`h-7 rounded text-[9px] font-semibold transition-all border ${
                      isActive
                        ? "text-black border-transparent"
                        : "bg-muted/30 text-muted-foreground border-border/30 hover:bg-muted/50"
                    }`}
                    style={isActive && color ? { backgroundColor: color, borderColor: color } : undefined}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            {winnerBias !== "none" && (
              <p className="text-[8px] text-muted-foreground mt-1 text-center">
                {winnerBias === "teamA" ? teamA.name : teamB.name} has attacking advantage
              </p>
            )}
          </section>

          <Separator className="bg-border/30" />

          {/* Match State */}
          <section>
            <SectionHeader icon={Activity} title="Match State" />
            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-1.5 rounded bg-muted/30">
                <p className="text-[8px] text-muted-foreground">Phase</p>
                <p className="text-[10px] font-medium text-foreground">{phase}</p>
              </div>
              <div className="p-1.5 rounded bg-muted/30">
                <p className="text-[8px] text-muted-foreground">Minute</p>
                <p className="text-[10px] font-medium text-foreground font-mono">{currentMinute}&apos;</p>
              </div>
            </div>
            <div className="p-1.5 mt-1.5 rounded bg-muted/30">
              <p className="text-[8px] text-muted-foreground">Score</p>
              <p className="text-[10px] font-medium text-foreground">
                {teamA.shortName} {teamA.score} – {teamB.score} {teamB.shortName}
              </p>
            </div>
            {/* Active event summary */}
            <div className="mt-1.5 p-1.5 rounded bg-muted/20 border border-border/20">
              <p className="text-[8px] text-muted-foreground mb-1">Status</p>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPlaying ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                <p className="text-[9px] text-foreground">
                  {phase === "Full Time" || phase === "Penalties"
                    ? `${phase} — ${teamA.shortName} ${teamA.score}–${teamB.score} ${teamB.shortName}`
                    : phase === "Half Time"
                    ? "Break — resuming soon"
                    : isPlaying
                    ? `${phase} · min ${currentMinute}`
                    : "Paused"}
                </p>
              </div>
              {winnerBias !== "none" && (
                <p className="text-[8px] text-primary mt-0.5">
                  Bias: {winnerBias === "teamA" ? teamA.shortName : teamB.shortName} favoured
                </p>
              )}
            </div>
          </section>

          <Separator className="bg-border/30" />

          {/* Playback */}
          <section>
            <SectionHeader icon={Play} title="Playback" />
            <div className="flex gap-1.5">
              <Button
                variant={isPlaying ? "secondary" : "default"}
                size="sm"
                className="h-6 text-[9px] gap-1 flex-1"
                onClick={onPlayPause}
              >
                {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onRestart}
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </Button>
            </div>
          </section>

          <Separator className="bg-border/30" />

          {/* Export */}
          <section>
            <SectionHeader icon={Film} title="Export" />
            <div className="grid grid-cols-2 gap-1.5">
              <div className="space-y-0.5">
                <Label className="text-[8px] text-muted-foreground">Format</Label>
                <Select value={outputFormat} onValueChange={onOutputFormatChange}>
                  <SelectTrigger className="h-6 text-[9px] bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9:16">9:16</SelectItem>
                    <SelectItem value="16:9">16:9</SelectItem>
                    <SelectItem value="1:1">1:1</SelectItem>
                    <SelectItem value="4:5">4:5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-0.5">
                <Label className="text-[8px] text-muted-foreground">Resolution</Label>
                <Select value={resolution} onValueChange={onResolutionChange}>
                  <SelectTrigger className="h-6 text-[9px] bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="4k">4K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center justify-center p-1.5 mt-2 rounded bg-muted/30">
              <Badge variant="outline" className={`text-[9px] ${statusConfig[renderStatus].className}`}>
                {statusConfig[renderStatus].label}
              </Badge>
            </div>

            <div className="space-y-1.5 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-6 text-[9px] gap-1"
                onClick={onExport}
              >
                <Download className="w-2.5 h-2.5" />
                Export Frame
              </Button>
              <Button 
                size="sm" 
                className="w-full h-6 text-[9px] gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onRender}
                disabled={renderStatus === "rendering"}
              >
                <Film className="w-2.5 h-2.5" />
                {renderStatus === "rendering" ? "Rendering..." : "Render Video"}
              </Button>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  )
}
