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
}

export function MatchArenaStage({ teamAColor, teamBColor, isPlaying, phase }: MatchArenaStageProps) {
  const [ballA, setBallA] = useState<BallState>({ 
    x: 55, y: 42, vx: 0.8, vy: 0.3, intensity: 0.7, 
    trail: [], isAttacking: true
  })
  const [ballB, setBallB] = useState<BallState>({ 
    x: 48, y: 58, vx: 0.9, vy: -0.2, intensity: 0.65, 
    trail: [], isAttacking: false
  })
  const [conflictIntensity, setConflictIntensity] = useState(0)
  const [goalThreat, setGoalThreat] = useState(0)
  const frameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const attackerRef = useRef<'A' | 'B'>('A')
  const switchTimerRef = useRef(0)

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

    // Goal target (right side, center)
    const goalX = 96
    const goalY = 50

    // CONFLICT PHYSICS: When balls are close, they jostle and compete
    if (distToOpponent < 25) {
      // Repulsion from opponent
      const repelStrength = (25 - distToOpponent) * 0.008
      vx -= (dx / distToOpponent) * repelStrength * dt
      vy -= (dy / distToOpponent) * repelStrength * dt
      
      // Increase intensity when in conflict
      intensity = Math.min(1, intensity + 0.03 * dt)
      
      // Try to get ahead of opponent toward goal
      if (isAttacking) {
        const angleToGoal = Math.atan2(goalY - y, goalX - x)
        vx += Math.cos(angleToGoal) * 0.06 * dt
        vy += Math.sin(angleToGoal) * 0.04 * dt
      }
    }

    // Goal-seeking behavior
    const distToGoal = Math.sqrt((goalX - x) ** 2 + (goalY - y) ** 2)
    const goalAttraction = isAttacking ? 0.035 : 0.018
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

    // Boundary handling with energy
    const margin = 6
    if (x < margin) { x = margin; vx = Math.abs(vx) * 0.85; intensity += 0.05 }
    if (x > 94) { x = 94; vx = -Math.abs(vx) * 0.85; intensity += 0.05 }
    if (y < margin + 4) { y = margin + 4; vy = Math.abs(vy) * 0.85; intensity += 0.04 }
    if (y > 94 - margin) { y = 94 - margin; vy = -Math.abs(vy) * 0.85; intensity += 0.04 }

    // Speed limits - attacker slightly faster
    const maxSpeed = isAttacking ? 2.2 : 1.9
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

    // Intensity decay
    if (x > 70) {
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

  useEffect(() => {
    if (!isPlaying) return

    const animate = (currentTime: number) => {
      const deltaMs = lastTimeRef.current ? currentTime - lastTimeRef.current : 16
      
      if (deltaMs >= 25) { // ~40fps for fluid motion
        setBallA(prev => {
          const newBall = updateBall(prev, ballB, true, deltaMs)
          return { ...newBall, isAttacking: attackerRef.current === 'A' }
        })
        setBallB(prev => {
          const newBall = updateBall(prev, ballA, false, deltaMs)
          return { ...newBall, isAttacking: attackerRef.current === 'B' }
        })
        
        // Periodically switch attacker for drama
        switchTimerRef.current += deltaMs
        if (switchTimerRef.current > 4000 + Math.random() * 3000) {
          attackerRef.current = attackerRef.current === 'A' ? 'B' : 'A'
          switchTimerRef.current = 0
        }
        
        lastTimeRef.current = currentTime
      }
      
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [isPlaying, updateBall, ballA, ballB])

  // Calculate conflict and goal threat
  useEffect(() => {
    const dx = ballA.x - ballB.x
    const dy = ballA.y - ballB.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    // Conflict is high when balls are close (within 20%)
    const conflict = Math.max(0, 1 - dist / 25)
    setConflictIntensity(conflict)

    // Goal threat when either ball is near goal zone
    const aInZone = ballA.x > 75 && ballA.y > 30 && ballA.y < 70
    const bInZone = ballB.x > 75 && ballB.y > 30 && ballB.y < 70
    const threatA = aInZone ? (ballA.x - 75) / 20 : 0
    const threatB = bInZone ? (ballB.x - 75) / 20 : 0
    setGoalThreat(Math.min(1, Math.max(threatA, threatB)))
  }, [ballA.x, ballA.y, ballB.x, ballB.y])

  const isPenaltyShootout = phase === "Penalties"

  return (
    <div 
      className="relative w-full h-full rounded-lg sm:rounded-xl overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% 105%, oklch(0.16 0.03 250 / 0.6) 0%, transparent 50%),
          radial-gradient(ellipse 35% 40% at 95% 50%, oklch(0.75 0.12 85 / ${0.03 + goalThreat * 0.08}) 0%, transparent 50%),
          radial-gradient(ellipse 50% 50% at ${(ballA.x + ballB.x) / 2}% ${(ballA.y + ballB.y) / 2}%, oklch(0.18 0.04 280 / ${conflictIntensity * 0.08}) 0%, transparent 40%),
          linear-gradient(178deg, oklch(0.10 0.012 250) 0%, oklch(0.125 0.015 250) 50%, oklch(0.105 0.01 250) 100%)
        `
      }}
    >
      {/* Pitch markings - standard football layout */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {/* Pitch outline */}
        <rect x="4" y="8" width="92" height="84" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="0.2" rx="0.5"/>
        
        {/* Center line */}
        <line x1="50" y1="8" x2="50" y2="92" stroke="white" strokeOpacity="0.07" strokeWidth="0.15"/>
        
        {/* Center circle */}
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="0.15"/>
        <circle cx="50" cy="50" r="0.8" fill="white" fillOpacity="0.08"/>
        
        {/* Goal area boxes */}
        <rect x="4" y="35" width="8" height="30" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="0.12"/>
        <rect x="88" y="35" width="8" height="30" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="0.12"/>
        
        {/* Penalty areas */}
        <rect x="4" y="25" width="14" height="50" fill="none" stroke="white" strokeOpacity="0.04" strokeWidth="0.1"/>
        <rect x="82" y="25" width="14" height="50" fill="none" stroke="white" strokeOpacity="0.04" strokeWidth="0.1"/>
        
        {/* Penalty spots */}
        <circle cx="13" cy="50" r="0.5" fill="white" fillOpacity="0.06"/>
        <circle cx="87" cy="50" r="0.5" fill="white" fillOpacity="0.06"/>
      </svg>

      {/* Conflict tension zone - appears when balls are close */}
      <div 
        className="absolute rounded-full blur-[60px] pointer-events-none transition-opacity duration-300"
        style={{
          left: `${(ballA.x + ballB.x) / 2 - 18}%`,
          top: `${(ballA.y + ballB.y) / 2 - 18}%`,
          width: '36%',
          height: '36%',
          background: `radial-gradient(circle, oklch(0.6 0.2 330 / ${conflictIntensity * 0.2}) 0%, transparent 60%)`,
          opacity: conflictIntensity > 0.3 ? 1 : 0,
        }}
      />

      {/* Goal - compact and proportional */}
      <div className="absolute right-[2%] top-1/2 -translate-y-1/2 w-[5%] h-[24%]">
        {/* Goal glow */}
        <div 
          className="absolute -inset-[100%] transition-opacity duration-400"
          style={{
            background: `radial-gradient(ellipse 70% 120% at 100% 50%, oklch(0.78 0.14 85 / ${0.06 + goalThreat * 0.2}) 0%, transparent 55%)`,
          }}
        />
        {/* Goal frame */}
        <div 
          className="absolute right-0 top-[5%] bottom-[5%] w-[60%] border-2 border-r-0 rounded-l-sm transition-all duration-300"
          style={{
            borderColor: `oklch(0.75 0.12 85 / ${0.4 + goalThreat * 0.4})`,
            background: `linear-gradient(90deg, oklch(0.75 0.1 85 / ${0.02 + goalThreat * 0.05}), oklch(0.8 0.14 85 / ${0.06 + goalThreat * 0.08}))`,
            boxShadow: goalThreat > 0.3 
              ? `0 0 ${20 + goalThreat * 25}px oklch(0.78 0.14 85 / ${goalThreat * 0.35})`
              : 'none',
          }}
        />
        {/* Goal net suggestion */}
        <div 
          className="absolute right-[60%] top-[10%] bottom-[10%] w-[35%]"
          style={{
            background: `repeating-linear-gradient(90deg, transparent, transparent 3px, oklch(0.7 0.08 85 / 0.08) 3px, oklch(0.7 0.08 85 / 0.08) 4px)`,
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
            width: 'clamp(32px, 5vw, 44px)',
            height: 'clamp(32px, 5vw, 44px)',
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
          <span className="font-bold text-white text-[10px] sm:text-[11px] select-none" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
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
            width: 'clamp(28px, 4.2vw, 38px)',
            height: 'clamp(28px, 4.2vw, 38px)',
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
          <span className="font-bold text-white text-[9px] sm:text-[10px] select-none" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
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
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm border border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[7px] font-medium text-white/70 uppercase tracking-wider">Live</span>
        </div>
      )}

      {/* Penalty mode indicator */}
      {isPenaltyShootout && (
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
          <span className="text-[7px] font-semibold text-red-400 uppercase tracking-wider">Penalties</span>
        </div>
      )}
    </div>
  )
}
