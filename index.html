/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, Sunset, Moon, Volume2, VolumeX, Settings, X, 
  Sparkles, Compass, HelpCircle, RefreshCw, Play, RotateCw, Smartphone, ArrowRight, Shield, Zap, Wind, Magnet
} from 'lucide-react';
import { GameProgress, GameSettings, InteractableObject } from '../types';
import { soundManager } from '../core/SoundManager';
import { Controls } from '../player/Controls';
import { LEVELS } from '../core/Levels';
import Minimap from './Minimap';

interface GameUIProps {
  progress: GameProgress;
  settings: GameSettings;
  controls: Controls | null;
  focusObject: InteractableObject | null;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onResetProgress: () => void;
  onInteractRequested: () => void;
}

export default function GameUI({
  progress,
  settings,
  controls,
  focusObject,
  onUpdateSettings,
  onResetProgress,
  onInteractRequested,
}: GameUIProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVertical, setIsVertical] = useState(false);
  const [orientationOverridden, setOrientationOverridden] = useState(false);
  
  // Pathway start menu states
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(() => {
    // Open if active level hasn't been closed once this session
    return !sessionStorage.getItem('zen_has_begun_once');
  });
  const [selectedLevelId, setSelectedLevelId] = useState(() => {
    return Number(localStorage.getItem('zen_active_level_id') || '1');
  });
  const [codexTab, setCodexTab] = useState<'dashboard' | 'guides'>('dashboard');
  
  // Custom Virtual Joystick States for Mobile Touch Controls
  const [joystickStart, setJoystickStart] = useState<{ x: number; y: number } | null>(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickBaseRef = useRef<HTMLDivElement>(null);

  // Power banner notifications
  const [activeBanner, setActiveBanner] = useState<'dash' | 'glide' | 'magnet' | null>(null);

  // Dynamic Touch Device and Orientation Checks
  useEffect(() => {
    const handlePowerUnlock = (e: Event) => {
      const power = (e as CustomEvent).detail;
      setActiveBanner(power);
      setTimeout(() => {
        setActiveBanner(null);
      }, 4500);
    };

    window.addEventListener('zen_unlocked_power', handlePowerUnlock);
    
    const checkTouch = () => {
      // Mobile userAgent detection check
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const hasTouchPoints = navigator.maxTouchPoints > 0 || ('ontouchstart' in window);
      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(hasTouchPoints && (isMobileUserAgent || isCoarsePointer));
    };
    
    const checkOrientation = () => {
      setIsVertical(window.innerHeight > window.innerWidth);
    };

    checkTouch();
    checkOrientation();

    // Trigger true touch listener to toggle if user actually registers a touch start gesture
    const handleTouchStart = () => {
      setIsTouchDevice(true);
      window.removeEventListener('touchstart', handleTouchStart);
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('resize', checkOrientation);

    return () => {
      window.removeEventListener('zen_unlocked_power', handlePowerUnlock);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);
  
  // Audio trigger for initial intro
  const handleStartAudio = () => {
    onUpdateSettings({ soundEnabled: true });
    setShowTutorial(false);
  };

  // 1. Mobile Virtual Joystick Handlers
  const handleJoystickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = joystickBaseRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setJoystickStart({ x: centerX, y: centerY });
    } else {
      setJoystickStart({ x: touch.clientX, y: touch.clientY });
    }
    
    // Trigger vibration or response
    if (controls) {
      controls.updateJoystick(0, 0, true);
    }
  };

  const handleJoystickMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!joystickStart || !controls) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - joystickStart.x;
    const dy = touch.clientY - joystickStart.y;
    
    // Clamp handle distance to 40px radius
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 45;
    
    let clampedX = dx;
    let clampedY = dy;
    
    if (dist > maxDist) {
      clampedX = (dx / dist) * maxDist;
      clampedY = (dy / dist) * maxDist;
    }
    
    setJoystickPos({ x: clampedX, y: clampedY });
    
    // Normalise vector (-1.0 to 1.0)
    const normX = clampedX / maxDist;
    const normY = clampedY / maxDist;
    
    controls.updateJoystick(normX, normY, true);
  };

  const handleJoystickEnd = () => {
    setJoystickStart(null);
    setJoystickPos({ x: 0, y: 0 });
    if (controls) {
      controls.updateJoystick(0, 0, false);
    }
  };

  const isCompleted = progress.collectedShards.length === 6 && progress.activatedBeacons.length === 3;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none flex flex-col justify-between p-6 md:p-12 font-sans text-[#4A4540]">
      
      {/* HEADER SECTION */}
      <header className="w-full flex items-start justify-between pointer-events-auto">
        {/* Game Badge and Title in Sands of Solace clean minimalist branding */}
        <div className="flex items-start gap-2.5">
          <div className="flex flex-col bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-[#4A4540] shadow-sm">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#4A4540] opacity-70" />
              <h1 className="font-semibold text-xs tracking-[0.3em] uppercase text-[#4A4540]">Sands of Solace</h1>
            </div>
            <span className="text-[9px] uppercase tracking-[0.15em] opacity-50 font-mono mt-1">Aeolian Archipelago · Territory 04</span>
          </div>

          <button
            id="open-pathways-map-btn"
            onClick={() => setIsStartMenuOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-stone-50 px-4 py-3 rounded-2xl shadow-md border border-amber-500/20 transition-all font-semibold text-xs tracking-wider uppercase pointer-events-auto hover:scale-105 active:scale-95 group"
            title="Open Ancient Pathways Level Select"
          >
            <Compass className="w-4 h-4 transition-transform group-hover:rotate-45 duration-300" />
            <span>Pathways Map</span>
          </button>
        </div>

        {/* Top-Right controls (Settings panel hooks) */}
        <div className="flex items-center gap-2">
          {/* Quick Volume toggle */}
          <button 
            id="vol-btn"
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`p-2.5 rounded-full border transition-all duration-300 pointer-events-auto shadow-sm ${
              settings.soundEnabled 
                ? 'bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-100' 
                : 'bg-white/10 border-white/20 text-[#4A4540] hover:bg-white/20'
            }`}
            title="Toggle Ambient Drone"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings panel trigger */}
          <button 
            id="settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 bg-white/10 border border-white/20 text-[#4A4540] hover:bg-white/20 rounded-full transition-all duration-300 pointer-events-auto shadow-sm"
            title="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HIGH-PERFORMANCE MINIMAP PANEL */}
      <section className="absolute top-24 right-6 md:right-12 pointer-events-auto select-none">
        <Minimap />
      </section>

      {/* CORE HUD SHARD & BEACON STATISTICS PANEL */}
      <section className="absolute top-24 left-6 md:left-12 flex flex-col gap-2.5 pointer-events-auto">
        {/* Shards Progress Panel */}
        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 shadow-sm text-[#4A4540] max-w-xs transition-all duration-300">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#4A4540] opacity-60" />
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase opacity-70">Gems Found</span>
            </div>
            <span className="font-mono text-xs font-bold text-[#4A4540]">{progress.collectedShards.length}/6</span>
          </div>
          {/* Custom micro horizontal progress node */}
          <div className="w-28 bg-[#4A4540]/10 h-1.0 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-[#4A4540]/60 h-full transition-all duration-700 ease-out" 
              style={{ width: `${(progress.collectedShards.length / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Beacons Progress Panel */}
        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 shadow-sm text-[#4A4540] max-w-xs transition-all duration-300">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-600/80 animate-pulse" />
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase opacity-70">Lighthouses</span>
            </div>
            <span className="font-mono text-xs font-bold text-[#4A4540]">{progress.activatedBeacons.length}/3</span>
          </div>
          <div className="w-28 bg-[#4A4540]/10 h-1.0 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-amber-600/60 h-full transition-all duration-700 ease-out" 
              style={{ width: `${(progress.activatedBeacons.length / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Aura Crystals Progress Panel */}
        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 shadow-sm text-[#4A4540] max-w-xs transition-all duration-300">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 animate-pulse text-xs">✦</span>
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase opacity-70">Aura Crystals</span>
            </div>
            <span className="font-mono text-xs font-bold text-amber-700">{progress.auraCrystals || 0}</span>
          </div>
        </div>

        {/* Superpowers Panel */}
        {progress.activePower && progress.activePower !== 'none' && (
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 shadow-sm text-[#4A4540] max-w-xs transition-all duration-300 flex flex-col gap-1.5">
            <span className="text-[9px] font-semibold tracking-[0.15em] uppercase opacity-60">Superpowers</span>
            <div className="flex flex-wrap gap-1">
              {(progress.activePower === 'dash' || progress.activePower === 'both') && (
                <span className="px-2 py-0.5 bg-orange-500/15 border border-orange-400/30 text-orange-900 rounded-full text-[8px] font-bold uppercase tracking-wider">
                  ⚡ Dash
                </span>
              )}
              {(progress.activePower === 'glide' || progress.activePower === 'both') && (
                <span className="px-2 py-0.5 bg-cyan-500/15 border border-cyan-400/30 text-cyan-900 rounded-full text-[8px] font-bold uppercase tracking-wider">
                  🍃 Glide
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* MIDDLE SECTION - FLOWING INTERACTION PROMPTS AND LEVEL COMPLETED CONGRATS CARD */}
      <main className="w-full h-full flex flex-col items-center justify-end pb-28 md:pb-24">
        
        {/* Level Complete Card popup */}
        {isCompleted && (
          <div id="comp-card" className="mb-6 bg-[#F4EBE1]/95 backdrop-blur-md p-6 rounded-2xl border border-[#4A4540]/20 shadow-xl max-w-sm pointer-events-auto text-center transform scale-100 animate-fade-in transition-all">
            <Sparkles className="w-6 h-6 text-amber-700 mx-auto mb-2 opacity-80" />
            <h3 className="font-serif text-sm font-bold text-[#4A4540] tracking-[0.15em] uppercase">The Canopy is Lit</h3>
            <p className="text-[11px] text-[#4A4540]/80 mt-2 leading-relaxed font-sans px-2">
              All six pristine shards are in the sky box. Three ancient towers emit solar flares. Relax and listen to the sandy whispering dunes.
            </p>
            <button 
              id="reset-comp-btn"
              onClick={onResetProgress}
              className="mt-4 px-4 py-2 bg-[#4A4540] text-amber-50 rounded-full text-[10px] font-semibold tracking-widest uppercase hover:bg-[#3D3A36] active:scale-95 transition-all flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw className="w-3 h-3" /> restart sandbox
            </button>
          </div>
        )}

        {/* Dynamic Contextual Focus Interaction Bubble */}
        {focusObject && (
          <div id="interact-bubble" className="bg-[#F4EBE1]/90 backdrop-blur-md text-[#4A4540] p-4 rounded-full px-6 py-3 border border-[#4A4540]/15 shadow-md text-center pointer-events-auto transform translate-y-0 scale-100 transition-all selection-none">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#4A4540] font-semibold">
                Press <span className="font-bold underline">E</span> or TAP to observe the {focusObject.type}
              </span>
              <button 
                id="interact-box-btn"
                onClick={onInteractRequested}
                className="py-1 px-3.5 bg-[#4A4540] text-[#E6D5B8] font-bold rounded-full text-[9px] tracking-widest uppercase hover:bg-[#3D3A36] active:scale-95 transition-all shadow-sm"
              >
                ACTIVATE
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER CONTROLS ROW - DUAL KEYBOARD MANUALS / JOYSTICKS ON LEFT, MOBILE ACTION BUTTONS ON RIGHT */}
      <footer className="w-full flex items-end justify-between pointer-events-none pb-4 md:pb-0">
        
        {/* LEFT FOOTER REGION */}
        <div className="pointer-events-auto">
          {!isTouchDevice ? (
            /* Dynamic keyboard manual guide on left (Shown on desktop viewports) */
            <div className="hidden md:flex flex-col gap-3 text-[#4A4540] bg-white/10 backdrop-blur-md px-4 py-4 rounded-2xl border border-white/20 max-w-xs select-none">
              <div className="text-[10px] uppercase tracking-[0.25em] font-bold opacity-60 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Guide
              </div>
              <div className="text-[9px] uppercase tracking-[0.15em] opacity-70 leading-normal space-y-2 mt-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 border border-[#4A4540]/40 rounded font-mono text-[9px]">WASD</span>
                  <span>Move freely</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 border border-[#4A4540]/40 rounded font-mono text-[9px]">DRAG</span>
                  <span>Look around</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 border border-[#4A4540]/40 rounded font-mono text-[9px]">SPACE</span>
                  <span>Jump high</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 border border-[#4A4540]/40 rounded font-mono text-[9px]">E</span>
                  <span>Observe monolith</span>
                </div>
                {progress.activePower && (progress.activePower === 'dash' || progress.activePower === 'both') && (
                  <div className="flex items-center gap-2 text-orange-850">
                    <span className="px-2 py-0.5 border border-orange-400 bg-orange-100 rounded font-mono text-[9px]">SHIFT</span>
                    <span>Solar Dash</span>
                  </div>
                )}
                {progress.activePower && (progress.activePower === 'glide' || progress.activePower === 'both') && (
                  <div className="flex items-center gap-2 text-cyan-850">
                    <span className="px-2 py-0.5 border border-cyan-400 bg-cyan-105 rounded font-mono text-[9px]">SPACE (hold)</span>
                    <span>Zephyr Glide</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Virtual Touch Joystick handle on bottom-left */
            <div className="flex items-center justify-center h-32 w-32 relative select-none">
              <div 
                ref={joystickBaseRef}
                onTouchStart={handleJoystickStart}
                onTouchMove={handleJoystickMove}
                onTouchEnd={handleJoystickEnd}
                className="absolute h-20 w-20 bg-white/10 rounded-full border border-white/20 backdrop-blur-md shadow-sm flex items-center justify-center active:bg-white/20"
                style={{ touchAction: 'none' }}
                title="Virtual Move Joystick"
              >
                {/* Floating inner central knob */}
                <div 
                  className="h-8 w-8 rounded-full bg-[#E6D5B8] border border-[#4A4540]/30 absolute transition-transform duration-75 shadow-sm"
                  style={{ 
                    transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
                    transition: joystickStart ? 'none' : 'transform 150ms ease-out'
                  }}
                />
              </div>
              {/* Tiny helper context text */}
              <div className="absolute -bottom-1 text-[9px] font-semibold text-[#4A4540]/60 tracking-[0.2em] uppercase">Move</div>
            </div>
          )}
        </div>

        {/* RIGHT FOOTER REGION - MOBILE ACTIONS HUD (Only visible on touch tablets/phones) */}
        {isTouchDevice && (
          <div className="flex flex-col gap-3.5 pointer-events-auto select-none items-center">
            {/* Quick click Interact helper */}
            {focusObject && (
              <button 
                id="mob-interact-btn"
                onClick={onInteractRequested}
                className="h-12 w-12 rounded-full border border-[#4A4540]/30 bg-[#F4EBE1]/90 text-[#4A4540] shadow-sm flex items-center justify-center font-bold text-[9px] uppercase tracking-wider active:scale-95 transition-all text-center"
              >
                Use
              </button>
            )}

            {/* Mobile Dash Button */}
            {progress.activePower && (progress.activePower === 'dash' || progress.activePower === 'both') && (
              <button 
                id="mob-dash-btn"
                onTouchStart={() => { if (controls) controls.keys.dash = true; }}
                onTouchEnd={() => { if (controls) controls.keys.dash = false; }}
                onMouseDown={() => { if (controls) controls.keys.dash = true; }}
                onMouseUp={() => { if (controls) controls.keys.dash = false; }}
                className="h-12 w-12 rounded-full border border-orange-300 bg-[#F4EBE1]/90 text-orange-950 shadow-md flex flex-col items-center justify-center font-bold text-[8px] uppercase tracking-wider active:scale-95 transition-all relative overflow-hidden"
              >
                <span className="z-10">Dash</span>
                {progress.dashFuel !== undefined && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-orange-400/25 transition-all duration-75"
                    style={{ height: `${progress.dashFuel * 100}%` }}
                  />
                )}
              </button>
            )}
            
            {/* Jump button */}
            <button 
              id="mob-jump-btn"
              onTouchStart={() => { if (controls) controls.keys.up = true; }}
              onTouchEnd={() => { if (controls) controls.keys.up = false; }}
              onMouseDown={() => { if (controls) controls.keys.up = true; }}
              onMouseUp={() => { if (controls) controls.keys.up = false; }}
              className="h-12 w-12 rounded-full border border-white/10 bg-white/10 backdrop-blur-md text-[#4A4540] shadow-sm flex items-center justify-center font-bold text-[9px] uppercase tracking-widest active:scale-95 transition-all"
            >
              Jump
            </button>
          </div>
        )}
      </footer>

      {/* MAGICAL SUPERPOWER UNLOCKED BANNER OVERLAY */}
      {activeBanner && (
        <div className="fixed inset-x-0 top-1/4 z-50 flex justify-center items-center pointer-events-none select-none animate-fade-in font-sans">
          <div className="bg-[#F4EBE1]/95 text-[#4A4540] border-2 border-amber-400 p-6 rounded-3xl shadow-2xl text-center max-w-sm px-8 mx-4 backdrop-blur-md transform scale-100 transition-all pointer-events-auto">
            <Sparkles className="w-8 h-8 text-amber-600 mx-auto mb-3 animate-bounce" />
            <span className="text-[8px] bg-amber-200 border border-amber-300 text-amber-800 font-bold px-3 py-1 rounded-full uppercase tracking-widest block w-max mx-auto">POWER AWAKENED</span>
            
            <h2 className="text-sm font-serif font-bold text-[#4A4540] mt-3 tracking-widest uppercase">
              {activeBanner === 'dash' ? '⚡ Solar Dash' : activeBanner === 'glide' ? '🍃 Zephyr Glide' : '🧲 Sand Magnet'}
            </h2>
            
            <p className="text-[10px] text-[#4A4540]/80 lowercase tracking-wide mt-2 leading-relaxed">
              {activeBanner === 'dash' 
                ? 'unlocked! hold SHIFT on desktop or tap the Dash button on your virtual joystick to sprint at extreme sonic speeds.'
                : activeBanner === 'glide'
                  ? 'unlocked! hold SPACE on desktop or hold JUMP in midair to float softly over high valleys.'
                  : 'unlocked! passive magnetic aura active. nearby gold crystals in an 18m radius slide gracefully toward your chest.'
              }
            </p>
          </div>
        </div>
      )}

      {/* OVERLAY SETTINGS MODAL DIALOG MODAL (Rendered when trigger clicked) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-30 pointer-events-auto flex items-center justify-center bg-stone-950/45 backdrop-blur-md font-sans">
          <div id="settings-pnl" className="bg-[#F4EBE1] border border-[#4A4540]/15 rounded-3xl p-6 w-full max-w-sm text-[#4A4540] shadow-xl relative mx-4 animate-fade-in">
            {/* Close button top-right */}
            <button 
              id="close-settings-btn"
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-[#4A4540]/60 hover:text-[#4A4540] transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Panel Title */}
            <h2 className="text-xs font-bold text-[#4A4540] border-b border-[#4A4540]/10 pb-2.5 mb-4 tracking-[0.2em] flex items-center gap-1.5 uppercase font-serif">
              <Settings className="w-3.5 h-3.5" /> settings
            </h2>

            {/* Time of Day setting */}
            <div className="mb-4">
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4A4540]/70 select-none block mb-2">Atmosphere Sky</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  id="tod-day-btn"
                  onClick={() => onUpdateSettings({ timeOfDay: 'day' })}
                  className={`py-2 rounded-xl border text-[10px] tracking-widest uppercase font-semibold flex items-center justify-center gap-1 transition-all ${
                    settings.timeOfDay === 'day' 
                      ? 'bg-[#E6D5B8] border-[#4A4540]/40 text-[#4A4540] font-bold' 
                      : 'bg-[#F4EBE1] border-[#4A4540]/10 text-[#4A4540]/70 hover:bg-white/40'
                  }`}
                >
                  <Sun className="w-3 h-3" /> Day
                </button>
                <button 
                  id="tod-sunset-btn"
                  onClick={() => onUpdateSettings({ timeOfDay: 'sunset' })}
                  className={`py-2 rounded-xl border text-[10px] tracking-widest uppercase font-semibold flex items-center justify-center gap-1 transition-all ${
                    settings.timeOfDay === 'sunset' 
                      ? 'bg-[#eec1a4] border-orange-400 text-stone-900 font-bold' 
                      : 'bg-[#F4EBE1] border-[#4A4540]/10 text-[#4A4540]/70 hover:bg-white/40'
                  }`}
                >
                  <Sunset className="w-3 h-3" /> Golden
                </button>
                <button 
                  id="tod-night-btn"
                  onClick={() => onUpdateSettings({ timeOfDay: 'night' })}
                  className={`py-2 rounded-xl border text-[10px] tracking-widest uppercase font-semibold flex items-center justify-center gap-1 transition-all ${
                    settings.timeOfDay === 'night' 
                      ? 'bg-[#1a2135] border-[#1a2135] text-indigo-50 font-bold' 
                      : 'bg-[#F4EBE1] border-[#4A4540]/10 text-[#4A4540]/70 hover:bg-white/40'
                  }`}
                >
                  <Moon className="w-3 h-3" /> Night
                </button>
              </div>
            </div>

            {/* Audio configuration */}
            <div className="mb-4">
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4A4540]/70 select-none block mb-1.5">Aura Sound</label>
              <div className="flex items-center justify-between bg-white/45 rounded-xl p-3 border border-[#4A4540]/10">
                <span className="text-[10px] tracking-[0.1em] uppercase text-[#4A4540]/80">Ambient Synth</span>
                <button 
                  id="synth-sound-toggle"
                  onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`px-3 py-1 rounded-full text-[9px] tracking-widest uppercase font-semibold transition-all ${
                    settings.soundEnabled 
                      ? 'bg-[#4A4540] text-[#E6D5B8]' 
                      : 'bg-[#4A4540]/10 text-[#4A4540]/50'
                  }`}
                >
                  {settings.soundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Graphics Tier speed selection */}
            <div className="mb-4">
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4A4540]/70 select-none block mb-2">Graphics Quality</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((tier) => (
                  <button 
                    id={`g-tier-${tier}-btn`}
                    key={tier}
                    onClick={() => onUpdateSettings({ graphics: tier })}
                    className={`py-1.5 rounded-xl border text-[9px] tracking-widest uppercase font-semibold transition-all ${
                      settings.graphics === tier 
                        ? 'bg-[#4A4540] border-[#4A4540] text-amber-50 font-bold' 
                        : 'bg-[#F4EBE1] border-[#4A4540]/10 text-[#4A4540]/75 hover:bg-white/40'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera sensitivity range */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4A4540]/70 block mb-1">
                <span>Yaw sensitivity</span>
                <span className="font-mono text-[9px] font-bold">x{settings.mouseSensitivity.toFixed(1)}</span>
              </div>
              <input 
                id="sens-range"
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={settings.mouseSensitivity}
                onChange={(e) => onUpdateSettings({ mouseSensitivity: parseFloat(e.target.value) })}
                className="w-full h-1 bg-white/50 rounded-lg appearance-none cursor-pointer accent-[#4A4540] border border-[#4A4540]/10 pointer-events-auto"
              />
            </div>

            {/* Bloom Intensity Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4A4540]/70 block mb-1">
                <span>Bloom Intensity</span>
                <span className="font-mono text-[9px] font-bold">{(settings.bloomIntensity ?? 1.0).toFixed(1)}</span>
              </div>
              <input 
                id="bloom-intensity-range"
                type="range"
                min="0.0"
                max="2.0"
                step="0.1"
                value={settings.bloomIntensity ?? 1.0}
                onChange={(e) => onUpdateSettings({ bloomIntensity: parseFloat(e.target.value) })}
                className="w-full h-1 bg-white/50 rounded-lg appearance-none cursor-pointer accent-[#4A4540] border border-[#4A4540]/10 pointer-events-auto"
              />
            </div>

            {/* Progress reset configuration */}
            <div className="border-t border-[#4A4540]/15 pt-4 mt-2">
              <button 
                id="full-reset-btn"
                onClick={() => {
                  if (confirm("Reset current shard and lit beacon progress?")) {
                    onResetProgress();
                    setIsSettingsOpen(false);
                  }
                }}
                className="w-full py-2 bg-transparent hover:bg-[#4A4540]/5 rounded-xl border border-[#4A4540]/25 text-[10px] text-[#4A4540] font-semibold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" /> restart journey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TUTORIAL / INTRO AUTOPLAY CONSENT TRIGGER */}
      {showTutorial && (
        <div className="fixed inset-0 z-40 bg-stone-950/40 backdrop-blur-md flex items-center justify-center pointer-events-auto selection-none">
          <div id="intro-card" className="bg-[#F4EBE1] border border-[#4A4540]/15 rounded-3xl p-8 md:p-10 w-full max-w-md text-center max-h-[85vh] overflow-y-auto shadow-2xl mx-4 animate-fade-in relative text-[#4A4540]">
            <Sparkles className="w-8 h-8 text-[#4A4540]/70 mx-auto mb-4 animate-pulse" />
            <span className="text-[9px] border border-[#4A4540]/25 bg-[#4A4540]/5 text-[#4A4540]/80 px-3 py-1 rounded-full font-serif tracking-[0.2em] font-semibold uppercase">Zen world</span>
            
            <h2 className="text-lg font-serif font-bold text-[#4A4540] tracking-[0.12em] uppercase mt-4">Sands of Solace</h2>
            
            <p className="text-[11px] text-[#4A4540]/80 leading-relaxed max-w-sm mx-auto mt-3 font-sans">
              Welcome to an aeolian archipelago. There is no urgency, no enemies, and no danger. Gaze around, walk freely across the sand valleys, and observe ancient monolith structures in region 04.
            </p>

            <div className="bg-white/45 rounded-2xl border border-[#4A4540]/10 p-5 my-6 text-left text-[10px] text-[#4A4540] select-none space-y-2.5 font-sans px-6 leading-normal">
              <p className="font-semibold text-[#4A4540]/90 border-b border-[#4A4540]/10 pb-1 flex items-center gap-1 uppercase tracking-widest text-[9px]"><Play className="w-3.5 h-3.5" /> Exploration parameters</p>
              <p>📍 Gaze around, walk freely across the sand valleys.</p>
              <p>💎 Discover **6 glowing turquoise shards** on dune tops and inside structures.</p>
              <p>🔥 Light the **3 sacred beacons** to send bright pillars of guiding light up to the clouds.</p>
            </div>

            <button 
              id="intro-start-btn"
              onClick={handleStartAudio}
              className="mt-2 w-full py-3 bg-[#4A4540] text-[#E6D5B8] font-bold rounded-2xl text-[10px] tracking-[0.2em] uppercase hover:bg-[#3D3A36] active:scale-95 transition-all shadow-md"
            >
              Begin Journey
            </button>
          </div>
        </div>
      )}

      {/* ORIENTATION RECOMMENDATION OVERLAY */}
      {isVertical && !orientationOverridden && (
        <div className="fixed inset-0 z-50 bg-[#121110]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-[#E6D5B8] pointer-events-auto select-none transition-all duration-500 animate-fade-in text-center">
          <div className="max-w-xs flex flex-col items-center">
            {/* Elegant rotating smartphone visual */}
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center bg-white/5 border border-white/10 rounded-full">
              <div className="flex items-center justify-center animate-bounce">
                <Smartphone className="w-8 h-8 text-[#E6D5B8] opacity-80" />
              </div>
              <div className="absolute inset-0 border-2 border-dashed border-[#E6D5B8]/20 rounded-full animate-spin [animation-duration:12s]" />
              <div className="absolute -top-1 -right-1 animate-pulse">
                <RotateCw className="w-5 h-5 text-[#E6D5B8]/60" />
              </div>
            </div>

            <h2 className="font-serif text-xs font-semibold tracking-[0.2em] uppercase text-[#E6D5B8] mb-3">
              Landscape View Recommended
            </h2>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#E6D5B8]/70 leading-relaxed font-sans mb-6 px-2">
              Sands of Solace is best explored in horizontal widescreen mode. Please rotate your device or adjust your browser width.
            </p>

            <button
              onClick={() => setOrientationOverridden(true)}
              className="px-5 py-2.5 bg-white/10 border border-white/20 hover:bg-white/20 text-[#E6D5B8] rounded-full text-[9px] tracking-widest uppercase font-semibold transition-all active:scale-95"
            >
              Continue anyway
            </button>
          </div>
        </div>
      )}

      {/* MAGNIFICENT START SCREEN / LEVEL SELECTOR OVERLAY */}
      {isStartMenuOpen && (
        <div id="pathways-start-overlay" className="fixed inset-0 z-55 bg-stone-900/40 backdrop-blur-md flex items-center justify-center pointer-events-auto select-none p-4">
          <div className="bg-[#F4EBE1] border border-[#4A4540]/20 rounded-3xl p-6 md:p-8 w-full max-w-lg text-[#4A4540] shadow-2xl relative animate-fade-in flex flex-col max-h-[90vh]">
            {/* Conditional Close button if session has already begun once */}
            {sessionStorage.getItem('zen_has_begun_once') && (
              <button 
                onClick={() => setIsStartMenuOpen(false)}
                className="absolute top-4 right-4 text-[#4A4540]/65 hover:text-[#4A4540] transition-colors p-1"
                title="Back to exploration"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Menu Header with ancient theme branding */}
            <header className="text-center mb-6">
              <Compass className="w-7 h-7 text-amber-700 mx-auto mb-2 opacity-80" />
              <h2 className="text-lg font-serif font-bold text-[#4A4540] tracking-[0.2em] uppercase">
                Ancient Pathways Map
              </h2>
              <span className="text-[9px] font-mono tracking-[0.1em] text-[#4A4540]/60 uppercase">
                Choose your destiny · Aeolian Lands
              </span>
            </header>

            {/* Tabs Controller */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#4A4540]/10 rounded-2xl mb-7 text-center">
              <button
                onClick={() => setCodexTab('dashboard')}
                className={`py-2 px-3 rounded-xl text-[10px] tracking-wider uppercase font-semibold transition-all ${
                  codexTab === 'dashboard' 
                    ? 'bg-[#F4EBE1] border-b-2 border-amber-600 text-[#4A4540] font-bold shadow-sm' 
                    : 'text-[#4A4540]/65 hover:bg-[#F4EBE1]/40'
                }`}
              >
                Choose Pathway
              </button>
              <button
                onClick={() => setCodexTab('guides')}
                className={`py-2 px-3 rounded-xl text-[10px] tracking-wider uppercase font-semibold transition-all ${
                  codexTab === 'guides' 
                    ? 'bg-[#F4EBE1] border-b-2 border-amber-600 text-[#4A4540] font-bold shadow-sm' 
                    : 'text-[#4A4540]/65 hover:bg-[#F4EBE1]/40'
                }`}
              >
                Superpower Codex
              </button>
            </div>

            {/* Scrollable Main body section */}
            <div className="flex-1 overflow-y-auto pr-1 mb-2 scrollbar-thin">
              {codexTab === 'dashboard' ? (
                <div className="flex flex-col justify-between">
                  {/* Visual Level Pathway Connections Map */}
                  <div className="relative w-full max-w-sm mx-auto my-5 flex items-center justify-between px-4 select-none">
                    <div className="absolute left-6 right-6 top-1/2 h-[2px] border-t-2 border-dashed border-[#4A4540]/25 -translate-y-1/2 z-0" />
                    
                    {LEVELS.map((lvl) => {
                      const isSelected = selectedLevelId === lvl.id;
                      const isPlaying = Number(localStorage.getItem('zen_active_level_id') || '1') === lvl.id;
                      
                      return (
                        <button
                          key={lvl.id}
                          onClick={() => {
                            setSelectedLevelId(lvl.id);
                            soundManager.triggerChime(2);
                          }}
                          className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-md active:scale-90 ${
                            isSelected 
                              ? 'bg-amber-700 text-stone-50 border-2 border-amber-400 scale-110' 
                              : isPlaying
                                ? 'bg-amber-100 text-amber-900 border-2 border-amber-600 font-bold'
                                : 'bg-white hover:bg-stone-100 text-[#4A4540] border border-[#4A4540]/20'
                          }`}
                        >
                          <span>{lvl.id === 1 ? 'I' : lvl.id === 2 ? 'II' : lvl.id === 3 ? 'III' : lvl.id === 4 ? 'IV' : 'V'}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Level Info Card */}
                  {(() => {
                    const activeLvl = LEVELS.find(l => l.id === selectedLevelId) || LEVELS[0];
                    return (
                      <div className="bg-white/55 border border-[#4A4540]/10 rounded-2xl p-5 text-left mb-6 font-sans">
                        <div className="flex items-center gap-1 text-amber-800 text-[8px] font-bold tracking-widest uppercase mb-1">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> 
                          <span>{activeLvl.subtitle}</span>
                        </div>
                        
                        <h3 className="text-xs font-serif font-bold text-[#4A4540] uppercase tracking-wider mb-2">
                          Pathway {activeLvl.id}: {activeLvl.name}
                        </h3>
                        
                        <p className="text-[10px] text-[#4A4540]/80 uppercase leading-relaxed font-sans font-medium mb-4">
                          {activeLvl.description}
                        </p>

                        {/* Details row (atmosphere, powers, difficulty) */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-2 border-t border-[#4A4540]/10 pt-3 text-[10px] uppercase font-semibold">
                          <div>
                            <span className="text-gray-500 text-[8px] tracking-wider block">Atmosphere</span>
                            <span className="text-[#4A4540]">{activeLvl.timeOfDay}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-[8px] tracking-wider block">Starting Power</span>
                            <span className="text-[#4A4540]">{activeLvl.startingPower}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-[8px] tracking-wider block">Hazard density</span>
                            <span className="text-red-700">x{activeLvl.hazardFactor.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-[8px] tracking-wider block">Completion Badge</span>
                            <span className="text-amber-700">{activeLvl.badge}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Embark command trigger */}
                  <button
                    onClick={() => {
                      localStorage.setItem('zen_active_level_id', String(selectedLevelId));
                      sessionStorage.setItem('zen_has_begun_once', 'true');
                      setIsStartMenuOpen(false);
                      soundManager.triggerChime(8); 
                      setTimeout(() => {
                        window.location.reload();
                      }, 100);
                    }}
                    className="w-full py-3.5 bg-[#4A4540] hover:bg-[#3D3A36] text-[#E6D5B8] text-[9px] tracking-[0.25em] font-bold uppercase rounded-2xl shadow-md transition-all active:scale-95"
                  >
                    Embark Pathway
                  </button>
                </div>
              ) : (
                /* GLOW-CODEX (SUPERPOWER GUIDES) TAB PANEL */
                <div className="flex flex-col justify-between text-left font-sans gap-4 leading-relaxed">
                  <div className="space-y-4">
                    <div className="bg-white/55 border border-[#4A4540]/10 rounded-2xl p-4.5 flex gap-3.5 items-start">
                      <div className="p-2.5 bg-orange-500/10 border border-orange-400/20 rounded-xl text-orange-950 mt-1">
                        <Zap className="w-5 h-5 text-orange-700" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-orange-900 tracking-wider uppercase mb-1">⚡ Solar Dash</h4>
                        <p className="text-[10px] text-[#4A4540]/80 uppercase leading-normal">
                          pierce clean through hurdles, slide up tall dunes, and escape active traps. Immune to spikeshards and vortex force-fields during active dash sequences.
                        </p>
                        <p className="text-[8px] text-[#4A4540]/60 font-mono mt-2 lowercase">
                          controls: press [SHIFT] on keyboard (or tap [DASH] touch circle)
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/55 border border-[#4A4540]/10 rounded-2xl p-4.5 flex gap-3.5 items-start">
                      <div className="p-2.5 bg-cyan-500/10 border border-cyan-400/20 rounded-xl text-cyan-950 mt-1">
                        <Wind className="w-5 h-5 text-cyan-700" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-cyan-900 tracking-wider uppercase mb-1">🍃 Zephyr Glide</h4>
                        <p className="text-[10px] text-[#4A4540]/80 uppercase leading-normal">
                          unfurl wind wings to coast gracefully in midair. Decelerate fall dynamics and float across deep sand valleys or high floating architectural crevices.
                        </p>
                        <p className="text-[8px] text-[#4A4540]/60 font-mono mt-2 lowercase">
                          controls: hold [SPACEBAR] in midair (or hold [JUMP] circle falling)
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/55 border border-[#4A4540]/10 rounded-2xl p-4.5 flex gap-3.5 items-start">
                      <div className="p-2.5 bg-amber-500/10 border border-amber-400/20 rounded-xl text-amber-950 mt-1">
                        <Magnet className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-amber-900 tracking-wider uppercase mb-1">🧲 Sand Magnet</h4>
                        <p className="text-[10px] text-[#4A4540]/80 uppercase leading-normal">
                          project an electrostatic aura that draws nearby gold crystals in an 18-meter radius dynamically toward you. Highly effective for sweeping expansive sand dunes.
                        </p>
                        <p className="text-[8px] text-[#4A4540]/60 font-mono mt-2 lowercase">
                          controls: passive effect when active/unlocked (pathway iv & v)
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setCodexTab('dashboard')}
                    className="w-full py-3 mt-4 bg-[#4A4540]/10 border border-[#4A4540]/20 text-[#4A4540] text-[9px] tracking-widest font-semibold uppercase rounded-xl hover:bg-[#4A4540]/15 transition-all text-center"
                  >
                    Return to Pathways Map
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
