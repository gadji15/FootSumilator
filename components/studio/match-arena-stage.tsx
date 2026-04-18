"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface BallState {
  x: number
  y: number
  vx: number
  vy: number
  intensity: number
  trail: { x: number; y: number; opacity: number }[]
  isAttacking: boolean
}

interface MatchArenaStageProps {
  teamAColor: string
  teamBColor: string
  isPlaying: boolean
  phase: string
  format?: string
  competition?: string
  winnerBias?: "teamA" | "teamB" | "none"
}

const GRASS_STRIPES = 10

export function MatchArenaStage({
  teamAColor,
  teamBColor,
  isPlaying,
  phase,
  format = "9:16",
  competition = "League",
  winnerBias = "none",
}: MatchArenaStageProps) {
  const [ballA, setBallA] = useState<BallState>({
    x: 52, y: 42, vx: 0.8, vy: 0.3, intensity: 0.7,
    trail: [], isAttacking: true
  })
  const [ballB, setBallB] = useState<BallState>({
    x: 46, y: 58, vx: 0.9, vy: -0.2, intensity: 0.65,
    trail: [], isAttacking: false
  })
  const [conflictIntensity, setConflictIntensity] = useState(0)
  const [goalThreat, setGoalThreat] = useState(0)
  const frameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const attackerRef = useRef<'A' | 'B'>('A')
  const switchTimerRef = useRef(0)

  const getBiasMultiplier = useCallback((isTeamA: boolean) => {
    if (winnerBias === "none") return 1.0
    if (winnerBias === "teamA") return isTeamA ? 1.35 : 0.75
    if (winnerBias === "teamB") return isTeamA ? 0.75 : 1.35
    return 1.0
  }, [winnerBias])

  const updateBall = useCallback((
    prev: BallState,
    other: BallState,
    isTeamA: boolean,
    deltaMs: number
  ): BallState => {
    let { x, y, vx, vy, intensity, trail, isAttacking } = prev
    const dt = deltaMs / 16
    const bias = getBiasMultiplier(isTeamA)

    x += vx * dt * 0.7
    y += vy * dt * 0.7

    const dx = other.x - x
    const dy = other.y - y
    const distToOpponent = Math.sqrt(dx * dx + dy * dy)

    const goalX = 95
    const goalY = 50

    if (distToOpponent < 25) {
      const repelStrength = (25 - distToOpponent) * 0.008
      vx -= (dx / distToOpponent) * repelStrength * dt
      vy -= (dy / distToOpponent) * repelStrength * dt
      intensity = Math.min(1, intensity + 0.03 * dt)
      if (isAttacking) {
        const angleToGoal = Math.atan2(goalY - y, goalX - x)
        vx += Math.cos(angleToGoal) * 0.06 * bias * dt
        vy += Math.sin(angleToGoal) * 0.04 * bias * dt
      }
    }

    const distToGoal = Math.sqrt((goalX - x) ** 2 + (goalY - y) ** 2)
    const goalAttraction = isAttacking ? 0.035 * bias : 0.018
    vx += ((goalX - x) / distToGoal) * goalAttraction * dt
    vy += ((goalY - y) / distToGoal) * goalAttraction * 0.4 * dt

    if (!isAttacking && distToOpponent < 30 && other.x > x) {
      const interceptY = other.y + other.vy * 5
      vy += (interceptY - y) * 0.02 * dt
    }

    const drift = isAttacking ? 0.15 : 0.12
    vx += (Math.random() - 0.48) * drift * dt
    vy += (Math.random() - 0.5) * drift * dt

    const margin = 5
    if (x < margin) { x = margin; vx = Math.abs(vx) * 0.85; intensity += 0.05 }
    if (x > 93) { x = 93; vx = -Math.abs(vx) * 0.85; intensity += 0.05 }
    if (y < margin + 2) { y = margin + 2; vy = Math.abs(vy) * 0.85; intensity += 0.04 }
    if (y > 95 - margin) { y = 95 - margin; vy = -Math.abs(vy) * 0.85; intensity += 0.04 }

    const maxSpeed = (isAttacking ? 2.2 : 1.9) * bias
    const minSpeed = 0.4
    const speed = Math.sqrt(vx * vx + vy * vy)
    if (speed > maxSpeed) {
      vx = (vx / speed) * maxSpeed
      vy = (vy / speed) * maxSpeed
    } else if (speed < minSpeed) {
      vx *= (minSpeed / speed) * 0.8
      vy *= (minSpeed / speed) * 0.8
    }

    vx *= 0.992
    vy *= 0.992

    if (x > 68) {
      intensity = Math.min(1, intensity + 0.02 * dt)
    } else {
      intensity = Math.max(0.5, intensity - 0.005 * dt)
    }

    const newTrail = [
      { x: prev.x, y: prev.y, opacity: 0.6 },
      ...trail.slice(0, 6).map(t => ({ ...t, opacity: t.opacity * 0.7 }))
    ].filter(t => t.opacity > 0.05)

    return { x, y, vx, vy, intensity, trail: newTrail, isAttacking }
  }, [getBiasMultiplier])

  const ballARef = useRef(ballA)
  const ballBRef = useRef(ballB)

  useEffect(() => {
    ballARef.current = ballA
    ballBRef.current = ballB
  }, [ballA, ballB])

  useEffect(() => {
    if (!isPlaying) return

    const animate = (currentTime: number) => {
      const deltaMs = lastTimeRef.current ? currentTime - lastTimeRef.current : 16

      if (deltaMs >= 25) {
        const currentBallA = ballARef.current
        const currentBallB = ballBRef.current

        setBallA(prev => {
          const newBall = updateBall(prev, currentBallB, true, deltaMs)
          return { ...newBall, isAttacking: attackerRef.current === 'A' }
        })
        setBallB(prev => {
          const newBall = updateBall(prev, currentBallA, false, deltaMs)
          return { ...newBall, isAttacking: attackerRef.current === 'B' }
        })

        switchTimerRef.current += deltaMs
        const switchInterval = winnerBias === "none"
          ? 4000 + Math.random() * 3000
          : 6000 + Math.random() * 2000

        if (switchTimerRef.current > switchInterval) {
          if (winnerBias === "teamA") {
            attackerRef.current = Math.random() < 0.7 ? 'A' : 'B'
          } else if (winnerBias === "teamB") {
            attackerRef.current = Math.random() < 0.7 ? 'B' : 'A'
          } else {
            attackerRef.current = attackerRef.current === 'A' ? 'B' : 'A'
          }
          switchTimerRef.current = 0
        }

        lastTimeRef.current = currentTime
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [isPlaying, updateBall, winnerBias])

  useEffect(() => {
    const dx = ballA.x - ballB.x
    const dy = ballA.y - ballB.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const conflict = Math.max(0, 1 - dist / 25)
    setConflictIntensity(conflict)

    const aInZone = ballA.x > 72 && ballA.y > 28 && ballA.y < 72
    const bInZone = ballB.x > 72 && ballB.y > 28 && ballB.y < 72
    const threatA = aInZone ? (ballA.x - 72) / 22 : 0
    const threatB = bInZone ? (ballB.x - 72) / 22 : 0
    setGoalThreat(Math.min(1, Math.max(threatA, threatB)))
  }, [ballA.x, ballA.y, ballB.x, ballB.y])

  const isPenaltyShootout = phase === "Penalties"
  const biasedTeamColor = winnerBias === "teamA" ? teamAColor : winnerBias === "teamB" ? teamBColor : null

  const grassStripes = Array.from({ length: GRASS_STRIPES }, (_, i) => ({
    y: (i * 100) / GRASS_STRIPES,
    height: 100 / GRASS_STRIPES,
    isLight: i % 2 === 0,
  }))

  return (
    <div
      className="relative w-full h-full rounded-xl lg:rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(178deg, oklch(0.10 0.012 150) 0%, oklch(0.115 0.018 145) 50%, oklch(0.095 0.012 148) 100%)`
      }}
    >
      {/* Premium Grass SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <filter id="grassGrain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.65 0.45" numOctaves="4" seed="2" result="noise"/>
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
            <feBlend in="SourceGraphic" in2="grayNoise" mode="soft-light" result="blended"/>
            <feComposite in="blended" in2="SourceGraphic" operator="in"/>
          </filter>
          <radialGradient id="vignetteGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="transparent"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.65)"/>
          </radialGradient>
          <radialGradient id="spotlightGrad" cx="75%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)"/>
            <stop offset="60%" stopColor="rgba(255,255,255,0.01)"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
          <radialGradient id="goalThreat" cx="96%" cy="50%" r="30%">
            <stop offset="0%" stopColor={`oklch(0.80 0.15 85 / ${0.04 + goalThreat * 0.12})`}/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
        </defs>

        {/* Mowing stripes */}
        {grassStripes.map((stripe, i) => (
          <rect
            key={i}
            x="0" y={stripe.y}
            width="100" height={stripe.height + 0.1}
            fill={stripe.isLight ? "oklch(0.285 0.092 145)" : "oklch(0.245 0.082 143)"}
          />
        ))}

        {/* Grain texture */}
        <rect x="0" y="0" width="100" height="100" fill="oklch(0.3 0.08 145 / 0.3)" filter="url(#grassGrain)"/>

        {/* Spotlight */}
        <rect x="0" y="0" width="100" height="100" fill="url(#spotlightGrad)"/>

        {/* Goal threat warm glow */}
        <rect x="0" y="0" width="100" height="100" fill="url(#goalThreat)"/>

        {/* Vignette */}
        <rect x="0" y="0" width="100" height="100" fill="url(#vignetteGrad)"/>

        {/* Pitch boundary */}
        <rect x="3" y="5" width="94" height="90" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.35" rx="0.3"/>

        {/* Left zone separator (implied center) */}
        <line x1="28" y1="5" x2="28" y2="95" stroke="rgba(255,255,255,0.07)" strokeWidth="0.15" strokeDasharray="1.5,2.5"/>

        {/* Penalty area */}
        <rect x="74" y="22" width="23" height="56"
          fill={`rgba(255,255,255,${0.008 + goalThreat * 0.015})`}
          stroke="rgba(255,255,255,0.18)" strokeWidth="0.3"
        />

        {/* Goal area (6-yard box) */}
        <rect x="87" y="34" width="10" height="32"
          fill="rgba(255,255,255,0.018)"
          stroke="rgba(255,255,255,0.14)" strokeWidth="0.25"
        />

        {/* Penalty spot */}
        <circle cx="82" cy="50" r="0.7" fill="rgba(255,255,255,0.38)"/>

        {/* Penalty arc */}
        <path d="M 74 39 A 10 10 0 0 0 74 61" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.25"/>

        {/* Top-right corner arc */}
        <path d="M 94 5 A 3 3 0 0 1 97 8" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.35"/>

        {/* Bottom-right corner arc */}
        <path d="M 97 92 A 3 3 0 0 1 94 95" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.35"/>

        {/* Corner flag circles */}
        <circle cx="97" cy="5" r="0.6" fill="rgba(255,255,255,0.55)"/>
        <circle cx="97" cy="95" r="0.6" fill="rgba(255,255,255,0.55)"/>

        {/* Partial center circle arc */}
        <path d="M 28 33 A 18 18 0 0 0 28 67" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.15"/>
      </svg>

      {/* THE GOAL */}
      <div className="absolute right-[1.5%] top-1/2 -translate-y-1/2 w-[5.5%] h-[26%]">
        <div
          className="absolute pointer-events-none transition-all duration-500"
          style={{
            inset: '-120% -60% -120% -200%',
            background: `radial-gradient(ellipse 80% 100% at 90% 50%, oklch(0.78 0.14 85 / ${0.05 + goalThreat * 0.22}) 0%, transparent 60%)`,
          }}
        />
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            borderTop: `2px solid oklch(0.80 0.10 85 / ${0.55 + goalThreat * 0.35})`,
            borderBottom: `2px solid oklch(0.80 0.10 85 / ${0.55 + goalThreat * 0.35})`,
            borderLeft: `2px solid oklch(0.80 0.10 85 / ${0.55 + goalThreat * 0.35})`,
            borderRight: 'none',
            borderRadius: '2px 0 0 2px',
            boxShadow: goalThreat > 0.25
              ? `0 0 ${20 + goalThreat * 30}px oklch(0.80 0.14 85 / ${goalThreat * 0.45}), inset 0 0 ${8 + goalThreat * 10}px oklch(0.80 0.14 85 / ${goalThreat * 0.12})`
              : `0 0 12px oklch(0.80 0.10 85 / 0.12)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(90deg, transparent, transparent 18%, oklch(0.75 0.08 85 / 0.12) 18%, oklch(0.75 0.08 85 / 0.12) 20%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(180deg, transparent, transparent 22%, oklch(0.75 0.08 85 / 0.10) 22%, oklch(0.75 0.08 85 / 0.10) 24%)`,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, oklch(0.75 0.08 85 / 0.06) 0%, oklch(0.80 0.12 85 / ${0.04 + goalThreat * 0.08}) 100%)`,
          }}
        />
      </div>

      {/* Winner bias atmospheric overlay */}
      {biasedTeamColor && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 80% 50%, ${biasedTeamColor}18 0%, transparent 65%)`,
          }}
        />
      )}

      {/* Conflict tension zone */}
      <div
        className="absolute rounded-full blur-[60px] pointer-events-none transition-opacity duration-300"
        style={{
          left: `${(ballA.x + ballB.x) / 2 - 18}%`,
          top: `${(ballA.y + ballB.y) / 2 - 18}%`,
          width: '36%',
          height: '36%',
          background: `radial-gradient(circle, oklch(0.6 0.2 330 / ${conflictIntensity * 0.22}) 0%, transparent 60%)`,
          opacity: conflictIntensity > 0.3 ? 1 : 0,
        }}
      />

      {/* Ball A heat zone */}
      <div
        className="absolute rounded-full blur-[50px] pointer-events-none"
        style={{
          left: `${ballA.x - 10}%`,
          top: `${ballA.y - 10}%`,
          width: '20%',
          height: '20%',
          background: `radial-gradient(circle, ${teamAColor} 0%, transparent 60%)`,
          opacity: 0.2 * ballA.intensity,
        }}
      />

      {/* Ball B heat zone */}
      <div
        className="absolute rounded-full blur-[40px] pointer-events-none"
        style={{
          left: `${ballB.x - 8}%`,
          top: `${ballB.y - 8}%`,
          width: '16%',
          height: '16%',
          background: `radial-gradient(circle, ${teamBColor} 0%, transparent 60%)`,
          opacity: 0.15 * ballB.intensity,
        }}
      />

      {/* Ball A Trail */}
      {ballA.trail.map((pos, i) => (
        <div
          key={`trail-a-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            width: `${28 - i * 3}px`,
            height: `${28 - i * 3}px`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: teamAColor,
            opacity: pos.opacity * 0.28,
            filter: `blur(${3 + i}px)`,
          }}
        />
      ))}

      {/* Ball A */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ left: `${ballA.x}%`, top: `${ballA.y}%` }}
      >
        {ballA.isAttacking && (
          <div
            className="absolute rounded-full animate-ping"
            style={{ inset: '-8px', backgroundColor: teamAColor, opacity: 0.2, animationDuration: '1.5s' }}
          />
        )}
        <div
          className="absolute rounded-full"
          style={{
            inset: '-10px',
            background: `radial-gradient(circle, ${teamAColor}50 0%, transparent 65%)`,
            opacity: 0.5 + ballA.intensity * 0.3,
            filter: `blur(${6 + ballA.intensity * 4}px)`,
          }}
        />
        <div
          className="relative rounded-full border-[2px] flex items-center justify-center"
          style={{
            width: 'clamp(36px, 8vw, 48px)',
            height: 'clamp(36px, 8vw, 48px)',
            backgroundColor: teamAColor,
            borderColor: `rgba(255,255,255,${0.5 + ballA.intensity * 0.25})`,
            boxShadow: `
              0 0 ${12 + ballA.intensity * 10}px ${teamAColor}bb,
              0 0 ${25 + ballA.intensity * 15}px ${teamAColor}66,
              inset 0 3px 5px rgba(255,255,255,0.45),
              inset 0 -3px 5px rgba(0,0,0,0.3)
            `,
          }}
        >
          <span className="font-bold text-white text-[11px] lg:text-xs select-none" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            A
          </span>
        </div>
      </div>

      {/* Ball B Trail */}
      {ballB.trail.map((pos, i) => (
        <div
          key={`trail-b-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            width: `${24 - i * 2.5}px`,
            height: `${24 - i * 2.5}px`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: teamBColor,
            opacity: pos.opacity * 0.22,
            filter: `blur(${2 + i}px)`,
          }}
        />
      ))}

      {/* Ball B */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ left: `${ballB.x}%`, top: `${ballB.y}%` }}
      >
        {ballB.isAttacking && (
          <div
            className="absolute rounded-full animate-ping"
            style={{ inset: '-6px', backgroundColor: teamBColor, opacity: 0.18, animationDuration: '1.5s' }}
          />
        )}
        <div
          className="absolute rounded-full"
          style={{
            inset: '-8px',
            background: `radial-gradient(circle, ${teamBColor}45 0%, transparent 65%)`,
            opacity: 0.45 + ballB.intensity * 0.25,
            filter: `blur(${5 + ballB.intensity * 3}px)`,
          }}
        />
        <div
          className="relative rounded-full border-[2px] flex items-center justify-center"
          style={{
            width: 'clamp(36px, 8vw, 48px)',
            height: 'clamp(36px, 8vw, 48px)',
            backgroundColor: teamBColor,
            borderColor: `rgba(255,255,255,${0.4 + ballB.intensity * 0.2})`,
            boxShadow: `
              0 0 ${10 + ballB.intensity * 7}px ${teamBColor}99,
              0 0 ${20 + ballB.intensity * 10}px ${teamBColor}55,
              inset 0 2px 4px rgba(255,255,255,0.4),
              inset 0 -2px 4px rgba(0,0,0,0.25)
            `,
          }}
        >
          <span className="font-bold text-white text-[11px] lg:text-xs select-none" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            B
          </span>
        </div>
      </div>

      {/* Conflict spark */}
      {conflictIntensity > 0.5 && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            left: `${(ballA.x + ballB.x) / 2}%`,
            top: `${(ballA.y + ballB.y) / 2}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              backgroundColor: 'white',
              boxShadow: `0 0 ${conflictIntensity * 15}px white, 0 0 ${conflictIntensity * 25}px oklch(0.8 0.15 60)`,
              opacity: conflictIntensity * 0.85,
            }}
          />
        </div>
      )}

      {/* Live indicator */}
      {isPlaying && (
        <div className="absolute top-2 left-2 lg:top-2.5 lg:left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 z-10">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[8px] font-semibold text-white/80 uppercase tracking-wider">Live</span>
        </div>
      )}

      {/* Winner bias pill */}
      {winnerBias !== "none" && (
        <div
          className="absolute top-2 left-[68px] lg:top-2.5 lg:left-[78px] flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 z-10"
          style={{ borderColor: `${biasedTeamColor}40` }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: biasedTeamColor || 'white' }}/>
          <span className="text-[7px] font-semibold text-white/70 uppercase tracking-wider">
            {winnerBias === "teamA" ? "A Favored" : "B Favored"}
          </span>
        </div>
      )}

      {/* Penalty mode indicator */}
      {isPenaltyShootout && (
        <div className="absolute top-2 right-2 lg:top-2.5 lg:right-2.5 px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30 backdrop-blur-sm z-10">
          <span className="text-[8px] font-bold text-red-400 uppercase tracking-wider">Penalties</span>
        </div>
      )}

      {/* Corner flags */}
      <div className="hidden lg:block absolute top-[4.2%] right-[2.5%] z-10">
        <div className="w-0.5 h-3 bg-white/35 mx-auto"/>
        <div className="w-2 h-1 bg-white/45 -mt-2.5 -ml-0.5"/>
      </div>
      <div className="hidden lg:block absolute bottom-[4.2%] right-[2.5%] z-10">
        <div className="w-0.5 h-3 bg-white/35 mx-auto"/>
        <div className="w-2 h-1 bg-white/45 -mt-2.5 -ml-0.5"/>
      </div>

      {/* Format + competition badge */}
      <div className="hidden lg:flex absolute bottom-2.5 left-2.5 items-center gap-2 z-10">
        <div className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm border border-white/10">
          <span className="text-[8px] font-mono text-white/50">{format}</span>
        </div>
        <div className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm border border-white/10">
          <span className="text-[8px] font-semibold text-white/50 uppercase tracking-wide">{competition}</span>
        </div>
      </div>

      {/* Team color legend */}
      <div className="hidden lg:flex absolute bottom-2.5 right-2.5 items-center gap-3 z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: teamAColor, borderColor: 'rgba(255,255,255,0.3)' }}/>
          <span className="text-[8px] text-white/50">Team A</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: teamBColor, borderColor: 'rgba(255,255,255,0.3)' }}/>
          <span className="text-[8px] text-white/50">Team B</span>
        </div>
      </div>
    </div>
  )
}
