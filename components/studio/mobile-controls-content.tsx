"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Upload, Users, Trophy, Settings, Film } from "lucide-react"

interface Team {
  name: string
  shortName: string
  color: string
  score: number
}

interface MobileControlsContentProps {
  teamA: Team
  teamB: Team
  onTeamAChange: (team: Partial<Team>) => void
  onTeamBChange: (team: Partial<Team>) => void
  competition: string
  onCompetitionChange: (comp: string) => void
  simulationMode: string
  onSimulationModeChange: (mode: string) => void
  allowExtraTime: boolean
  onAllowExtraTimeChange: (allow: boolean) => void
  allowPenalties: boolean
  onAllowPenaltiesChange: (allow: boolean) => void
  tempo: number
  onTempoChange: (tempo: number) => void
  outputFormat: string
  onOutputFormatChange: (format: string) => void
  resolution: string
  onResolutionChange: (res: string) => void
}

export function MobileControlsContent({
  teamA,
  teamB,
  onTeamAChange,
  onTeamBChange,
  competition,
  onCompetitionChange,
  simulationMode,
  onSimulationModeChange,
  allowExtraTime,
  onAllowExtraTimeChange,
  allowPenalties,
  onAllowPenaltiesChange,
  tempo,
  onTempoChange,
  outputFormat,
  onOutputFormatChange,
  resolution,
  onResolutionChange,
}: MobileControlsContentProps) {
  return (
    <Accordion type="multiple" defaultValue={["teams"]} className="w-full">
      {/* Teams */}
      <AccordionItem value="teams" className="border-border/50">
        <AccordionTrigger className="py-3 text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>Teams</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Team A</Label>
              <div className="flex gap-2">
                <Input
                  value={teamA.name}
                  onChange={(e) => onTeamAChange({ name: e.target.value, shortName: e.target.value.slice(0, 3).toUpperCase() })}
                  className="h-10 text-sm"
                  placeholder="Team name"
                />
                <input
                  type="color"
                  value={teamA.color}
                  onChange={(e) => onTeamAChange({ color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent shrink-0"
                />
              </div>
              <Button variant="outline" size="sm" className="w-full h-9 text-xs gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                Upload Logo
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Team B</Label>
              <div className="flex gap-2">
                <Input
                  value={teamB.name}
                  onChange={(e) => onTeamBChange({ name: e.target.value, shortName: e.target.value.slice(0, 3).toUpperCase() })}
                  className="h-10 text-sm"
                  placeholder="Team name"
                />
                <input
                  type="color"
                  value={teamB.color}
                  onChange={(e) => onTeamBChange({ color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent shrink-0"
                />
              </div>
              <Button variant="outline" size="sm" className="w-full h-9 text-xs gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                Upload Logo
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Competition */}
      <AccordionItem value="competition" className="border-border/50">
        <AccordionTrigger className="py-3 text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span>Competition</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <Select value={competition} onValueChange={onCompetitionChange}>
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="Select style" />
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
          <div className="flex items-center justify-center p-3 mt-2 rounded-lg bg-muted/30">
            <Badge variant="secondary" className="text-xs">
              {competition === "ucl" ? "UEFA Champions League" : 
               competition === "europa" ? "UEFA Europa League" :
               competition === "euro" ? "UEFA Euro" :
               competition === "afcon" ? "Africa Cup of Nations" :
               competition === "worldcup" ? "FIFA World Cup" :
               "Domestic League"}
            </Badge>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Match Rules */}
      <AccordionItem value="rules" className="border-border/50">
        <AccordionTrigger className="py-3 text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <span>Match Rules</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Simulation Mode</Label>
              <Select value={simulationMode} onValueChange={onSimulationModeChange}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="oriented">Oriented</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-border/30" />

            <div className="flex items-center justify-between py-1">
              <Label className="text-sm">Allow Extra Time</Label>
              <Switch checked={allowExtraTime} onCheckedChange={onAllowExtraTimeChange} />
            </div>

            <div className="flex items-center justify-between py-1">
              <Label className="text-sm">Penalty Shootout</Label>
              <Switch checked={allowPenalties} onCheckedChange={onAllowPenaltiesChange} />
            </div>

            <Separator className="bg-border/30" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Tempo / Intensity</Label>
                <span className="text-sm font-mono">{tempo}%</span>
              </div>
              <Slider
                value={[tempo]}
                onValueChange={([v]) => onTempoChange(v)}
                min={25}
                max={100}
                step={5}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Export */}
      <AccordionItem value="export" className="border-border/50">
        <AccordionTrigger className="py-3 text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-primary" />
            <span>Export Settings</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Format</Label>
              <Select value={outputFormat} onValueChange={onOutputFormatChange}>
                <SelectTrigger className="h-10 text-sm">
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
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Resolution</Label>
              <Select value={resolution} onValueChange={onResolutionChange}>
                <SelectTrigger className="h-10 text-sm">
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
