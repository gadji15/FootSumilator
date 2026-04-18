"use client"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer"
import { Settings, Download, Film } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface MobileControlsDrawerProps {
  children: React.ReactNode
  onExport?: () => void
  onRender?: () => void
}

export function MobileControlsDrawer({ children, onExport, onRender }: MobileControlsDrawerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Minimal floating action bar */}
      <div className="flex items-center justify-between px-2 py-1.5 pb-safe bg-black/80 backdrop-blur-xl border-t border-white/[0.06]">
        {/* Settings trigger */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2.5 gap-1.5 text-[11px] text-white/60 hover:text-white hover:bg-white/10"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[80vh] bg-card/95 backdrop-blur-2xl border-t border-border/30">
            <VisuallyHidden>
              <DrawerTitle>Simulation Settings</DrawerTitle>
            </VisuallyHidden>
            <div className="w-10 h-1 rounded-full bg-white/15 mx-auto mt-2 mb-3" />
            <div className="overflow-y-auto overscroll-contain px-4 pb-8">
              {children}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Quick actions */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/10"
            onClick={onExport}
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button 
            size="sm" 
            className="h-8 px-3 gap-1.5 bg-primary text-primary-foreground text-[11px] font-medium shadow-lg shadow-primary/25"
            onClick={onRender}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Render</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
