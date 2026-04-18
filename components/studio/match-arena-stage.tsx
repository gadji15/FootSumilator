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
    x: 40, y: 42, vx: 0.8, vy: 0.3, intensity: 0.7, 
    trail: [], isAttacking: true
  })
  const [ballB, setBallB] = useState<BallState>({ 
    x: 35, y: 58, vx: 0.9, vy: -0.2, intensity: 0.65, 
    trail: [], isAttacking: false
  })
  const [conflictIntensity, setConflictIntensity] = useState(0)
  const [goalThreat, setGoalThreat] = useState(0)
  const frameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const attackerRef = useRef<'A' | 'B'>('A')
  const switchTimerRef = useRef(0)
  const winnerBiasRef = useRef(winnerBias)

  useEffect(() => {
    winnerBiasRef.current = winnerBias
  }, [winnerBias])

  const updateBall = useCallback((
    prev: BallState, 
    other: BallState, 
    isTeamA: boolean,
    deltaMs: number
  ): BallState => {
    let { x, y, vx, vy, intensity, trail, isAttacking } = prev
    const dt = deltaMs / 16 // normalize to ~60fps equivalent

    // Core position update
    x += vx * dt * 0.7
    y += vy * dt * 0.7

    // Calculate distance to opponent - KEY for conflict
    const dx = other.x - x
    const dy = other.y - y
    const distToOpponent = Math.sqrt(dx * dx + dy * dy)

    // Goal target (right side, center) - single goal arena
    const goalX = 92
    const goalY = 50

    // Apply winner bias - affects aggression and goal-seeking
    const bias = winnerBiasRef.current
    const isFavored = (isTeamA && bias === "teamA") || (!isTeamA && bias === "teamB")
    const isUnfavored = (isTeamA && bias === "teamB") || (!isTeamA && bias === "teamA")
    const biasMultiplier = isFavored ? 1.3 : isUnfavored ? 0.75 : 1

    // CONFLICT PHYSICS: When balls are close, they jostle and compete
    if (distToOpponent < 25) {
      // Repulsion from opponent
      const repelStrength = (25 - distToOpponent) * 0.008 * biasMultiplier
      vx -= (dx / distToOpponent) * repelStrength * dt
      vy -= (dy / distToOpponent) * repelStrength * dt
      
      // Increase intensity when in conflict
      intensity = Math.min(1, intensity + 0.03 * dt)
      
      // Try to get ahead of opponent toward goal
      if (isAttacking) {
        const angleToGoal = Math.atan2(goalY - y, goalX - x)
        vx += Math.cos(angleToGoal) * 0.06 * biasMultiplier * dt
        vy += Math.sin(angleToGoal) * 0.04 * biasMultiplier * dt
      }
    }

    // Goal-seeking behavior - stronger for favored team
    const distToGoal = Math.sqrt((goalX - x) ** 2 + (goalY - y) ** 2)
    const goalAttraction = (isAttacking ? 0.04 : 0.02) * biasMultiplier
    vx += ((goalX - x) / distToGoal) * goalAttraction * dt
    vy += ((goalY - y) / distToGoal) * goalAttraction * 0.4 * dt

    // If not attacking, sometimes try to intercept
    if (!isAttacking && distToOpponent < 30 && other.x > x) {
      // Cut off the attacker's path
      const interceptY = other.y + other.vy * 5
      vy += (interceptY - y) * 0.02 * dt
    }

    // Organic movement - small directional changes
    const drift = isAttacking ? 0.15 : 0.12
    vx += (Math.random() - 0.48) * drift * dt
    vy += (Math.random() - 0.5) * drift * dt

    // Boundary handling - single goal arena layout (left side to right goal)
    const marginX = 6
    const marginY = 8
    if (x < marginX) { x = marginX; vx = Math.abs(vx) * 0.85; intensity += 0.05 }
    if (x > 90) { x = 90; vx = -Math.abs(vx) * 0.85; intensity += 0.05 }
    if (y < marginY) { y = marginY; vy = Math.abs(vy) * 0.85; intensity += 0.04 }
    if (y > 100 - marginY) { y = 100 - marginY; vy = -Math.abs(vy) * 0.85; intensity += 0.04 }

    // Speed limits - attacker slightly faster, favored team gets boost
    const maxSpeed = (isAttacking ? 2.2 : 1.9) * (isFavored ? 1.1 : 1)
    const minSpeed = 0.4
    const speed = Math.sqrt(vx * vx + vy * vy)
    if (speed > maxSpeed) {
      vx = (vx / speed) * maxSpeed
      vy = (vy / speed) * maxSpeed
    } else if (speed < minSpeed) {
      // Keep balls moving
      const boost = minSpeed / speed
      vx *= boost * 0.8
      vy *= boost * 0.8
    }

    // Friction
    vx *= 0.992
    vy *= 0.992

    // Intensity decay - higher in the attack zone (right side)
    if (x > 65) {
      intensity = Math.min(1, intensity + 0.02 * dt)
    } else {
      intensity = Math.max(0.5, intensity - 0.005 * dt)
    }

    // Trail with fading
    const newTrail = [
      { x: prev.x, y: prev.y, opacity: 0.6 },
      ...trail.slice(0, 6).map(t => ({ ...t, opacity: t.opacity * 0.7 }))
    ].filter(t => t.opacity > 0.05)

    return { x, y, vx, vy, intensity, trail: newTrail, isAttacking }
  }, [])

  // Store ball states in refs for animation loop to avoid dependency issues
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
      
      if (deltaMs >= 25) { // ~40fps for fluid motion
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
        
        // Periodically switch attacker for drama - biased team attacks more
        switchTimerRef.current += deltaMs
        const bias = winnerBiasRef.current
        const switchThreshold = bias === "teamA" ? 5000 : bias === "teamB" ? 3500 : 4000
        if (switchTimerRef.current > switchThreshold + Math.random() * 2500) {
          // Biased team gets more attack time
          if (bias === "teamA") {
            attackerRef.current = Math.random() > 0.35 ? 'A' : 'B'
          } else if (bias === "teamB") {
            attackerRef.current = Math.random() > 0.35 ? 'B' : 'A'
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
  }, [isPlaying, updateBall])

  // Calculate conflict and goal threat
  useEffect(() => {
    const dx = ballA.x - ballB.x
    const dy = ballA.y - ballB.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    // Conflict is high when balls are close (within 20%)
    const conflict = Math.max(0, 1 - dist / 25)
    setConflictIntensity(conflict)

    // Goal threat when either ball is near goal zone (right side)
    const aInZone = ballA.x > 70 && ballA.y > 30 && ballA.y < 70
    const bInZone = ballB.x > 70 && ballB.y > 30 && ballB.y < 70
    const threatA = aInZone ? (ballA.x - 70) / 22 : 0
    const threatB = bInZone ? (ballB.x - 70) / 22 : 0
    setGoalThreat(Math.min(1, Math.max(threatA, threatB)))
  }, [ballA.x, ballA.y, ballB.x, ballB.y])

  const isPenaltyShootout = phase === "Penalties"

  return (
    <div 
      className="relative w-full h-full rounded-xl lg:rounded-2xl overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% 105%, oklch(0.08 0.02 140 / 0.4) 0%, transparent 50%),
          radial-gradient(ellipse 35% 40% at 95% 50%, oklch(0.75 0.12 85 / ${0.03 + goalThreat * 0.1}) 0%, transparent 50%),
          radial-gradient(ellipse 50% 50% at ${(ballA.x + ballB.x) / 2}% ${(ballA.y + ballB.y) / 2}%, oklch(0.18 0.04 280 / ${conflictIntensity * 0.1}) 0%, transparent 40%),
          linear-gradient(178deg, oklch(0.12 0.025 145) 0%, oklch(0.15 0.035 140) 50%, oklch(0.11 0.02 145) 100%)
        `
      }}
    >
      {/* Premium grass texture with mowing stripes */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              oklch(0.18 0.04 140 / 0.15) 0px,
              oklch(0.18 0.04 140 / 0.15) 8%,
              oklch(0.14 0.035 140 / 0.12) 8%,
              oklch(0.14 0.035 140 / 0.12) 16%
            )
          `,
        }}
      />
      
      {/* Secondary diagonal grass texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent 0px,
              transparent 2px,
              oklch(0.20 0.04 145 / 0.08) 2px,
              oklch(0.20 0.04 145 / 0.08) 3px
            )
          `,
        }}
      />
      
      {/* Soft vignette for cinematic feel */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, oklch(0.08 0.02 250 / 0.5) 100%)`
        }}
      />
      
      {/* Stadium lights glow - top corners */}
      <div 
        className="absolute -top-20 left-1/4 w-40 h-40 rounded-full blur-[80px] pointer-events-none"
        style={{ background: 'oklch(0.95 0 0 / 0.04)' }}
      />
      <div 
        className="absolute -top-20 right-1/4 w-40 h-40 rounded-full blur-[80px] pointer-events-none"
        style={{ background: 'oklch(0.95 0 0 / 0.04)' }}
      />

      {/* Single-goal arena pitch markings */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {/* Pitch outline - single attacking side */}
        <rect x="4" y="6" width="92" height="88" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="0.25" rx="0.5"/>
        
        {/* Attack zone arc - marks the critical zone */}
        <path 
          d="M 65 6 Q 85 50 65 94" 
          fill="none" 
          stroke="white" 
          strokeOpacity="0.05" 
          strokeWidth="0.15"
          strokeDasharray="2 2"
        />
        
        {/* Penalty area - right side */}
        <rect x="78" y="25" width="18" height="50" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="0.2"/>
        
        {/* Goal area box - right side */}
        <rect x="88" y="35" width="8" height="30" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="0.18"/>
        
        {/* Penalty spot */}
        <circle cx="84" cy="50" r="0.6" fill="white" fillOpacity="0.1"/>
        
        {/* Penalty arc */}
        <path 
          d="M 78 38 Q 81 50 78 62" 
          fill="none" 
          stroke="white" 
          strokeOpacity="0.06" 
          strokeWidth="0.15"
        />
        
        {/* Corner arcs - attacking side (right) */}
        <path 
          d="M 96 6 Q 96 10 92 10" 
          fill="none" 
          stroke="white" 
          strokeOpacity="0.12" 
          strokeWidth="0.2"
        />
        <path 
          d="M 96 94 Q 96 90 92 90" 
          fill="none" 
          stroke="white" 
          strokeOpacity="0.12" 
          strokeWidth="0.2"
        />
        
        {/* Corner flag indicators */}
        <circle cx="96" cy="6" r="1" fill="white" fillOpacity="0.06"/>
        <circle cx="96" cy="94" r="1" fill="white" fillOpacity="0.06"/>
        
        {/* Midfield reference line */}
        <line x1="35" y1="6" x2="35" y2="94" stroke="white" strokeOpacity="0.04" strokeWidth="0.12" strokeDasharray="2 3"/>
      </svg>

      {/* Conflict tension zone - appears when balls are close */}
      <div 
        className="absolute rounded-full blur-[60px] pointer-events-none transition-opacity duration-300"
        style={{
          left: `${(ballA.x + ballB.x) / 2 - 18}%`,
          top: `${(ballA.y + ballB.y) / 2 - 18}%`,
          width: '36%',
          height: '36%',
          background: `radial-gradient(circle, oklch(0.6 0.18 350 / ${conflictIntensity * 0.25}) 0%, transparent 60%)`,
          opacity: conflictIntensity > 0.3 ? 1 : 0,
        }}
      />
      
      {/* Duel pressure zone - highlights the area of conflict */}
      <div 
        className="absolute rounded-full blur-[100px] pointer-events-none transition-all duration-500"
        style={{
          left: `${Math.max(45, Math.min(75, (ballA.x + ballB.x) / 2)) - 15}%`,
          top: `${(ballA.y + ballB.y) / 2 - 20}%`,
          width: '30%',
          height: '40%',
          background: `radial-gradient(circle, oklch(0.22 0.05 280 / 0.3) 0%, transparent 70%)`,
          opacity: 0.6,
        }}
      />

      {/* Goal - well-proportioned, compact, premium */}
      <div className="absolute right-[1.5%] top-1/2 -translate-y-1/2 w-[6%] h-[28%]">
        {/* Goal outer glow - spreads when threat is high */}
        <div 
          className="absolute transition-all duration-500"
          style={{
            inset: `-${60 + goalThreat * 40}%`,
            background: `radial-gradient(ellipse 60% 100% at 100% 50%, oklch(0.80 0.15 85 / ${0.08 + goalThreat * 0.2}) 0%, transparent 60%)`,
          }}
        />
        
        {/* Goal inner glow */}
        <div 
          className="absolute -inset-[30%] transition-opacity duration-300"
          style={{
            background: `radial-gradient(ellipse 50% 80% at 100% 50%, oklch(0.85 0.12 85 / ${0.05 + goalThreat * 0.15}) 0%, transparent 50%)`,
          }}
        />
        
        {/* Goal posts frame */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-[70%] rounded-l-sm transition-all duration-300 overflow-hidden"
          style={{
            border: `2.5px solid oklch(0.78 0.1 85 / ${0.5 + goalThreat * 0.4})`,
            borderRight: 'none',
            background: `linear-gradient(90deg, 
              oklch(0.12 0.02 250 / 0.8) 0%, 
              oklch(0.18 0.03 85 / ${0.1 + goalThreat * 0.15}) 100%
            )`,
            boxShadow: goalThreat > 0.2 
              ? `0 0 ${15 + goalThreat * 30}px oklch(0.80 0.14 85 / ${0.2 + goalThreat * 0.35}),
                 inset 0 0 ${10 + goalThreat * 15}px oklch(0.75 0.12 85 / ${goalThreat * 0.2})`
              : `0 0 10px oklch(0.75 0.1 85 / 0.15)`,
          }}
        >
          {/* Net pattern */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(90deg, oklch(0.75 0.08 85 / 0.06) 1px, transparent 1px),
                linear-gradient(0deg, oklch(0.75 0.08 85 / 0.06) 1px, transparent 1px)
              `,
              backgroundSize: '6px 6px',
            }}
          />
        </div>
        
        {/* Goal crossbar highlight */}
        <div 
          className="absolute right-0 -top-[3px] w-[75%] h-[3px] rounded-l-sm"
          style={{
            background: `linear-gradient(90deg, oklch(0.85 0.08 85 / 0.6), oklch(0.95 0.05 85 / 0.4))`,
          }}
        />
        
        {/* Goal post right edge highlight */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-[3px]"
          style={{
            background: `linear-gradient(180deg, oklch(0.90 0.06 85 / 0.5), oklch(0.80 0.08 85 / 0.4), oklch(0.90 0.06 85 / 0.5))`,
          }}
        />
      </div>

      {/* Ball A heat zone */}
      <div 
        className="absolute rounded-full blur-[45px] pointer-events-none"
        style={{
          left: `${ballA.x - 10}%`,
          top: `${ballA.y - 10}%`,
          width: '20%',
          height: '20%',
          background: `radial-gradient(circle, ${teamAColor} 0%, transparent 60%)`,
          opacity: 0.18 * ballA.intensity,
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
          opacity: 0.14 * ballB.intensity,
        }}
      />

      {/* Ball A - Trail */}
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
            opacity: pos.opacity * 0.25,
            filter: `blur(${3 + i}px)`,
          }}
        />
      ))}

      {/* Ball A - Main */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ 
          left: `${ballA.x}%`, 
          top: `${ballA.y}%`,
        }}
      >
        {/* Outer pulse when attacking */}
        {ballA.isAttacking && (
          <div 
            className="absolute rounded-full animate-ping"
            style={{ 
              inset: '-8px',
              backgroundColor: teamAColor,
              opacity: 0.2,
              animationDuration: '1.5s',
            }}
          />
        )}
        {/* Glow ring */}
        <div 
          className="absolute rounded-full"
          style={{ 
            inset: '-10px',
            background: `radial-gradient(circle, ${teamAColor}50 0%, transparent 65%)`,
            opacity: 0.5 + ballA.intensity * 0.3,
            filter: `blur(${6 + ballA.intensity * 4}px)`,
          }}
        />
        {/* Ball body */}
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

      {/* Ball B - Trail */}
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
            opacity: pos.opacity * 0.2,
            filter: `blur(${2 + i}px)`,
          }}
        />
      ))}

      {/* Ball B - Main */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ 
          left: `${ballB.x}%`, 
          top: `${ballB.y}%`,
        }}
      >
        {/* Outer pulse when attacking */}
        {ballB.isAttacking && (
          <div 
            className="absolute rounded-full animate-ping"
            style={{ 
              inset: '-6px',
              backgroundColor: teamBColor,
              opacity: 0.18,
              animationDuration: '1.5s',
            }}
          />
        )}
        {/* Glow ring */}
        <div 
          className="absolute rounded-full"
          style={{ 
            inset: '-8px',
            background: `radial-gradient(circle, ${teamBColor}45 0%, transparent 65%)`,
            opacity: 0.45 + ballB.intensity * 0.25,
            filter: `blur(${5 + ballB.intensity * 3}px)`,
          }}
        />
        {/* Ball body */}
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

      {/* Conflict spark indicator - shows when balls are battling */}
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
              opacity: conflictIntensity * 0.8,
            }}
          />
        </div>
      )}

      {/* Live indicator */}
      {isPlaying && (
        <div className="absolute top-2 left-2 lg:top-2.5 lg:left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[8px] lg:text-[7px] font-semibold text-white/80 uppercase tracking-wider">Live</span>
        </div>
      )}

      {/* Penalty mode indicator */}
      {isPenaltyShootout && (
        <div className="absolute top-2 right-2 lg:top-2.5 lg:right-2.5 px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
          <span className="text-[8px] lg:text-[7px] font-bold text-red-400 uppercase tracking-wider">Penalties</span>
        </div>
      )}

      {/* Format indicator - bottom left on desktop */}
      <div className="hidden lg:flex absolute bottom-2.5 left-2.5 items-center gap-2">
        <div className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm border border-white/10">
          <span className="text-[8px] font-mono text-white/50">{format}</span>
        </div>
        <div className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm border border-white/10">
          <span className="text-[8px] font-semibold text-white/50 uppercase tracking-wide">{competition}</span>
        </div>
      </div>

      {/* Team color legend - bottom right on desktop */}
      <div className="hidden lg:flex absolute bottom-2.5 right-2.5 items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div 
            className="w-3 h-3 rounded-full border"
            style={{ backgroundColor: teamAColor, borderColor: 'rgba(255,255,255,0.3)' }}
          />
          <span className="text-[8px] text-white/50">Team A</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div 
            className="w-3 h-3 rounded-full border"
            style={{ backgroundColor: teamBColor, borderColor: 'rgba(255,255,255,0.3)' }}
          />
          <span className="text-[8px] text-white/50">Team B</span>
        </div>
      </div>
    </div>
  )
}
