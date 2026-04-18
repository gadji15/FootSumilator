"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download, Film, Zap } from "lucide-react"

interface AppHeaderProps {
  matchLabel: string
  phase: string
  format: string
  status: "ready" | "rendering" | "exported"
  onExport?: () => void
  onRender?: () => void
}

export function AppHeader({ matchLabel, phase, format, status, onExport, onRender }: AppHeaderProps) {
  const statusConfig = {
    ready: { label: "Ready", className: "bg-primary/20 text-primary border-primary/30" },
    rendering: { label: "Rendering", className: "bg-studio-goal-gold/20 text-studio-goal-gold border-studio-goal-gold/30 animate-pulse" },
    exported: { label: "Exported", className: "bg-accent/20 text-accent border-accent/30" },
  }

  const currentStatus = statusConfig[status]

  return (
    <header className="h-12 border-b border-border/30 bg-card/40 backdrop-blur-md flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xs font-semibold text-foreground leading-tight">Football Simulation Studio</h1>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">match simulation renderer</p>
          </div>
        </div>

        <div className="hidden md:block w-px h-5 bg-border/40" />

        {/* Match Info */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">{matchLabel}</span>
          <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-medium">{phase}</Badge>
          <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-mono">{format}</Badge>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Badge variant="outline" className={`text-[9px] h-4 px-1.5 font-medium ${currentStatus.className}`}>
          {currentStatus.label}
        </Badge>

        <div className="hidden sm:flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1">
            <Eye className="w-3 h-3" />
            Preview
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1" onClick={onExport}>
            <Download className="w-3 h-3" />
            Export
          </Button>
          <Button size="sm" className="h-7 px-2.5 text-[10px] gap-1 bg-primary text-primary-foreground" onClick={onRender}>
            <Film className="w-3 h-3" />
            Render
          </Button>
        </div>
      </div>
    </header>
  )
}
