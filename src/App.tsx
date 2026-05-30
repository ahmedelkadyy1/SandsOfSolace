/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Engine } from './core/Engine';
import { Controls } from './player/Controls';
import { Player } from './player/Player';
import { World, getTerrainHeight } from './world/World';
import { InteractionManager } from './interactions/InteractionManager';
import { soundManager } from './core/SoundManager';
import { GameProgress, GameSettings, InteractableObject } from './types';
import GameUI from './components/GameUI';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game state
  const [progress, setProgress] = useState<GameProgress>({
    collectedShards: [],
    activatedBeacons: [],
    lastSaved: '',
    totalInteracted: 0,
  });
  
  const [settings, setSettings] = useState<GameSettings>({
    graphics: 'high',
    soundEnabled: false,
    mouseSensitivity: 1.2,
    timeOfDay: 'day',
    bloomIntensity: 1.0,
  });
  
  const [controlsInstance, setControlsInstance] = useState<Controls | null>(null);
  const [focusObject, setFocusObject] = useState<InteractableObject | null>(null);
  
  // Ref hooks to share state with live ThreeJS closures
  const settingsRef = useRef(settings);
  const focusObjectRef = useRef(focusObject);
  const interactionManagerRef = useRef<InteractionManager | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    focusObjectRef.current = focusObject;
  }, [focusObject]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // 1. Initialise the ThreeJS core engine
    const engine = new Engine(containerRef.current);
    engine.setTimeOfDay(settingsRef.current.timeOfDay);
    engine.setGraphicsQuality(settingsRef.current.graphics);
    engine.setBloomIntensity(settingsRef.current.bloomIntensity);
    
    // 2. Initialise input controllers
    const controls = new Controls(engine.renderer.domElement);
    controls.mouseSensitivity = 0.0018 * settingsRef.current.mouseSensitivity;
    setControlsInstance(controls);
    
    // 3. Populate our procedural sandbox world with chosen graphics configuration
    const world = new World(engine.scene, settingsRef.current.graphics);
    (window as any)._interactiveElements = world.interactiveElements;
    (window as any)._proceduralGroup = world.proceduralGroup;
    
    // 4. Initialise player characters and follow-cam system
    const player = new Player(engine.scene, controls, getTerrainHeight);
    
    // 5. Build interaction managers
    const interactions = new InteractionManager(engine.scene, world.interactiveElements, (updatedProgress) => {
      setProgress(updatedProgress);
    });
    interactionManagerRef.current = interactions;
    (window as any)._interactionManager = interactions;
    
    // Syphon initial storage progress to React
    setProgress(interactions.progress);

    // Register active global banner handler for unlocked superpowers
    const showPowerBanner = (power: string) => {
      window.dispatchEvent(new CustomEvent('zen_unlocked_power', { detail: power }));
    };
    (window as any)._showPowerBanner = showPowerBanner;
    
    // 6. Hook our operations into the engine's animation update callbacks
    const onTick = (delta: number, elapsed: number) => {
      // Dynamic controls sensitivity updates
      controls.mouseSensitivity = 0.0018 * settingsRef.current.mouseSensitivity;
      
      // Update player character physics
      player.update(delta, elapsed, engine.camera);
      
      // Procedural endless generation + sandstorms + active traps & collisions
      world.update(delta, elapsed, player);
      
      // Orbiting crystals & beacon swirls
      interactions.animateInteractiveObjects(elapsed, delta);
      
      // Sync ThreeJS-specific score variables to React HUD
      if (player.hasStateChanged || player.dashTimer > 0 || player.dashCooldown > 0) {
        player.hasStateChanged = false;
        
        const currentProgress = { ...interactions.progress };
        currentProgress.auraCrystals = player.auraCrystals;
        currentProgress.activePower = player.currentPower;
        
        // Calculate dynamic fuel indicator
        if (player.dashTimer > 0) {
          currentProgress.dashFuel = player.dashTimer / 0.28;
        } else if (player.dashCooldown > 0) {
          currentProgress.dashFuel = 1.0 - (player.dashCooldown / 1.3);
        } else {
          currentProgress.dashFuel = 1.0;
        }
        
        // Trigger save and state updates
        interactions.updateExternalProgress(currentProgress);
        setProgress(currentProgress);
      }
      
      // Proximity scan interactable target
      const target = interactions.checkPlayerProximity(player.position);
      setFocusObject(target);
    };
    
    engine.addUpdateCallback(onTick);

    // 7. Setup standard Keyboard "E" interaction handler
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') {
        const target = focusObjectRef.current;
        if (target) {
          target.onInteract();
          // Quick look-at flare sound
          soundManager.triggerChime(6);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    
    // 8. Handle initial device setup trigger
    soundManager.setEnabled(settingsRef.current.soundEnabled);

     // Dynamic reactive triggers for configurations
    const updateEngineTime = () => {
      engine.setTimeOfDay(settingsRef.current.timeOfDay);
    };
    
    const updateEngineGraphics = () => {
      engine.setGraphicsQuality(settingsRef.current.graphics);
    };

    const updateEngineBloom = () => {
      engine.setBloomIntensity(settingsRef.current.bloomIntensity);
    };

    // Export internal handles to allow external state modifications
    (window as any)._updateEngineTime = updateEngineTime;
    (window as any)._updateEngineGraphics = updateEngineGraphics;
    (window as any)._updateEngineBloom = updateEngineBloom;

    // React cleanup upon sandbox unmount
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      
      engine.removeUpdateCallback(onTick);
      engine.shutdown();
      
      controls.dispose();
      player.dispose();
      world.shutdown();
      interactions.shutdown();
      soundManager.shutdown();
      
      delete (window as any)._updateEngineTime;
      delete (window as any)._updateEngineGraphics;
      delete (window as any)._updateEngineBloom;
      delete (window as any)._showPowerBanner;
      delete (window as any)._interactiveElements;
      delete (window as any)._proceduralGroup;
    };
  }, []); // Only boot engine ONCE on mount

  // React settings modifier
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      
      // Update sound manager
      if (newSettings.soundEnabled !== undefined) {
        soundManager.setEnabled(newSettings.soundEnabled);
      }
      
      // Update engine properties immediately if handles exist
      if (newSettings.timeOfDay !== undefined && (window as any)._updateEngineTime) {
        settingsRef.current.timeOfDay = newSettings.timeOfDay;
        (window as any)._updateEngineTime();
      }
      
      if (newSettings.graphics !== undefined && (window as any)._updateEngineGraphics) {
        settingsRef.current.graphics = newSettings.graphics;
        (window as any)._updateEngineGraphics();
      }

      if (newSettings.bloomIntensity !== undefined && (window as any)._updateEngineBloom) {
        settingsRef.current.bloomIntensity = newSettings.bloomIntensity;
        (window as any)._updateEngineBloom();
      }
      
      return updated;
    });
  };

  // Reset progress and wipe localstorage
  const handleResetProgress = () => {
    if (interactionManagerRef.current) {
      interactionManagerRef.current.resetProgress();
    }
  };

  // Tap-trigger for on-screen touch interfaces
  const handleInteractRequested = () => {
    if (focusObject) {
      focusObject.onInteract();
      soundManager.triggerChime(6);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-900 select-none">
      
      {/* THREEJS CANVAS MOUNT CONTAINER */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
      />

      {/* MINIMAL GAME HUD & OVERLAY */}
      <GameUI 
        progress={progress}
        settings={settings}
        controls={controlsInstance}
        focusObject={focusObject}
        onUpdateSettings={handleUpdateSettings}
        onResetProgress={handleResetProgress}
        onInteractRequested={handleInteractRequested}
      />
    </div>
  );
}
