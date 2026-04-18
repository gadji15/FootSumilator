"use client"

import { useState, useCallback, useEffect } from "react"
import { AppHeader } from "@/components/studio/app-header"
import { SimulationViewer } from "@/components/studio/simulation-viewer"
import { ControlSidebar } from "@/components/studio/control-sidebar"
import { MobileControlsDrawer } from "@/components/studio/mobile-controls-drawer"
import { MobileControlsContent } from "@/components/studio/mobile-controls-content"

interface Team {
  name: string
  shortName: string
  color: string
  score: number
}

export default function FootballSimulationStudio() {
  const [teamA, setTeamA] = useState<Team>({
    name: "Real Madrid",
    shortName: "RMA",
    color: "#FEBE10",
    score: 1,
  })

  const [teamB, setTeamB] = useState<Team>({
    name: "Arsenal",
    shortName: "ARS",
    color: "#EF0107",
    score: 0,
  })

  const [currentMinute, setCurrentMinute] = useState(27)
  const [phase, setPhase] = useState("First Half")
  const [isPlaying, setIsPlaying] = useState(true)

  const [competition, setCompetition] = useState("ucl")
  const [simulationMode, setSimulationMode] = useState("free")
  const [allowExtraTime, setAllowExtraTime] = useState(false)
  const [allowPenalties, setAllowPenalties] = useState(false)
  const [tempo, setTempo] = useState(75)
  const [outputFormat, setOutputFormat] = useState("9:16")
  const [resolution, setResolution] = useState("1080p")
  const [renderStatus, setRenderStatus] = useState<"ready" | "rendering" | "exported">("ready")

  const totalMinutes = allowExtraTime ? 120 : 90

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentMinute(prev => {
        const maxMin = totalMinutes
        if (prev >= maxMin) {
          setPhase(allowPenalties ? "Penalties" : "Full Time")
          setIsPlaying(false)
          return maxMin
        }
        if (prev >= 45 && prev < 46 && phase === "First Half") {
          setPhase("Half Time")
          return prev + 1
        }
        if (prev >= 46 && prev < 90 && phase !== "Second Half") {
          setPhase("Second Half")
        }
        if (prev >= 90 && prev < 91 && allowExtraTime) {
          setPhase("Extra Time")
        }
        return prev + 1
      })
    }, Math.max(500, 2500 - tempo * 20))

    return () => clearInterval(interval)
  }, [isPlaying, phase, totalMinutes, tempo, allowExtraTime, allowPenalties])

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const handleRestart = useCallback(() => {
    setCurrentMinute(0)
    setPhase("First Half")
    setTeamA(prev => ({ ...prev, score: 0 }))
    setTeamB(prev => ({ ...prev, score: 0 }))
    setIsPlaying(true)
  }, [])

  const handleJumpToHalfTime = useCallback(() => {
    setCurrentMinute(45)
    setPhase("Half Time")
    setIsPlaying(false)
  }, [])

  const handleJumpToFullTime = useCallback(() => {
    setCurrentMinute(90)
    setPhase("Full Time")
    setIsPlaying(false)
  }, [])

  const handleTeamAChange = useCallback((updates: Partial<Team>) => {
    setTeamA(prev => ({ ...prev, ...updates }))
  }, [])

  const handleTeamBChange = useCallback((updates: Partial<Team>) => {
    setTeamB(prev => ({ ...prev, ...updates }))
  }, [])

  const handleExport = useCallback(() => {
    setRenderStatus("exported")
    setTimeout(() => setRenderStatus("ready"), 2000)
  }, [])

  const handleRender = useCallback(() => {
    setRenderStatus("rendering")
    setTimeout(() => {
      setRenderStatus("exported")
      setTimeout(() => setRenderStatus("ready"), 2000)
    }, 3000)
  }, [])

  const formatTimer = (minute: number) => {
    const mins = Math.floor(minute)
    return `${mins.toString().padStart(2, "0")}:00`
  }

  const getCompetitionLabel = () => {
    switch (competition) {
      case "ucl": return "UCL"
      case "europa": return "UEL"
      case "euro": return "Euro"
      case "afcon": return "AFCON"
      case "worldcup": return "World Cup"
      default: return "League"
    }
  }

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      <div className="hidden lg:block shrink-0">
        <AppHeader
          matchLabel={`${teamA.name} vs ${teamB.name}`}
          phase={phase}
          format={outputFormat}
          status={renderStatus}
          onExport={handleExport}
          onRender={handleRender}
        />
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0 flex flex-col">
          <SimulationViewer
            teamA={teamA}
            teamB={teamB}
            timer={formatTimer(currentMinute)}
            phase={phase}
            currentMinute={currentMinute}
            totalMinutes={totalMinutes}
            competition={getCompetitionLabel()}
            format={outputFormat}
            isPlaying={isPlaying}
            allowExtraTime={allowExtraTime}
            allowPenalties={allowPenalties}
            onPlayPause={handlePlayPause}
            onRestart={handleRestart}
            onJumpToHalfTime={handleJumpToHalfTime}
            onJumpToFullTime={handleJumpToFullTime}
          />
        </div>

        <div className="hidden lg:flex w-[300px] xl:w-[340px] shrink-0 border-l border-border/20">
          <ControlSidebar
            teamA={teamA}
            teamB={teamB}
            onTeamAChange={handleTeamAChange}
            onTeamBChange={handleTeamBChange}
            competition={competition}
            onCompetitionChange={setCompetition}
            simulationMode={simulationMode}
            onSimulationModeChange={setSimulationMode}
            allowExtraTime={allowExtraTime}
            onAllowExtraTimeChange={setAllowExtraTime}
            allowPenalties={allowPenalties}
            onAllowPenaltiesChange={setAllowPenalties}
            tempo={tempo}
            onTempoChange={setTempo}
            phase={phase}
            currentMinute={currentMinute}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onRestart={handleRestart}
            outputFormat={outputFormat}
            onOutputFormatChange={setOutputFormat}
            resolution={resolution}
            onResolutionChange={setResolution}
            onExport={handleExport}
            onRender={handleRender}
            renderStatus={renderStatus}
          />
        </div>
      </div>

      <MobileControlsDrawer onExport={handleExport} onRender={handleRender}>
        <MobileControlsContent
          teamA={teamA}
          teamB={teamB}
          onTeamAChange={handleTeamAChange}
          onTeamBChange={handleTeamBChange}
          competition={competition}
          onCompetitionChange={setCompetition}
          simulationMode={simulationMode}
          onSimulationModeChange={setSimulationMode}
          allowExtraTime={allowExtraTime}
          onAllowExtraTimeChange={setAllowExtraTime}
          allowPenalties={allowPenalties}
          onAllowPenaltiesChange={setAllowPenalties}
          tempo={tempo}
          onTempoChange={setTempo}
          outputFormat={outputFormat}
          onOutputFormatChange={setOutputFormat}
          resolution={resolution}
          onResolutionChange={setResolution}
        />
      </MobileControlsDrawer>
    </div>
  )
}
