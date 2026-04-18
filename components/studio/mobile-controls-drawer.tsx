"use client"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer"
import { Settings, Download, Film, Play, Pause, RotateCcw } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface MobileControlsDrawerProps {
  children: React.ReactNode
  onExport?: () => void
  onRender?: () => void
  isPlaying?: boolean
  onPlayPause?: () => void
  onRestart?: () => void
}

export function MobileControlsDrawer({ 
  children, 
  onExport, 
  onRender,
  isPlaying,
  onPlayPause,
  onRestart,
}: MobileControlsDrawerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Mobile dock - clean control bar */}
      <div className="flex items-center justify-between px-3 py-2 pb-safe bg-black/90 backdrop-blur-2xl border-t border-white/[0.08]">
        {/* Left: Settings drawer trigger */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh] bg-card/98 backdrop-blur-2xl border-t border-border/40 rounded-t-2xl">
            <VisuallyHidden>
              <DrawerTitle>Simulation Settings</DrawerTitle>
            </VisuallyHidden>
            <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-4" />
            <div className="overflow-y-auto overscroll-contain px-5 pb-10">
              {children}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Center: Primary playback controls */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
            onClick={onRestart}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button 
            size="icon"
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/40"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
            onClick={onExport}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Right: Render action */}
        <Button 
          size="sm" 
          className="h-10 px-4 gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl border border-white/10"
          onClick={onRender}
        >
          <Film className="w-4 h-4" />
          <span>Render</span>
        </Button>
      </div>
    </div>
  )
}
