/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { InteractableObject, GameProgress, InteractableType } from '../types';
import { getTerrainHeight } from '../world/World';
import { soundManager } from '../core/SoundManager';

export class InteractionManager {
  private scene: THREE.Scene;
  private interactiveGroup: THREE.Group;
  
  public interactables: InteractableObject[] = [];
  public currentFocusObject: InteractableObject | null = null;
  
  // Progress tracker state
  public progress: GameProgress = {
    collectedShards: [],
    activatedBeacons: [],
    lastSaved: '',
    totalInteracted: 0,
  };
  
  // Beacons active meshes references (to scale up beams)
  private beaconBeams: Map<string, THREE.Mesh> = new Map();
  private glowingShards: Map<string, THREE.Mesh> = new Map();
  
  // Callback for UI updates
  private onStateChangeCallback: (progress: GameProgress) => void;

  constructor(scene: THREE.Scene, interactiveGroup: THREE.Group, onStateChange: (progress: GameProgress) => void) {
    this.scene = scene;
    this.interactiveGroup = interactiveGroup;
    this.onStateChangeCallback = onStateChange;
    
    // 1. Load progress from localStorage
    this.loadProgress();
    
    // 2. Generate Interactive elements across coordinates
    this.spawnInteractiveObjects();
  }

  private spawnInteractiveObjects() {
    // 6 Collectible Shards to discover
    const shardLocations = [
      { id: 'shard_arch', name: 'Whispering Dune Shard', desc: 'A floating crystal resonant with the desert wind.', x: -15, z: -25 },
      { id: 'shard_ruins', name: 'Memory Altar Shard', desc: 'A radiant shard glowing soft with age-old stories.', x: 30, z: 15 },
      { id: 'shard_oasis', name: 'Aquila Springs Shard', desc: 'A cool, blue crystal hovering gently over the spring.', x: -28, z: 25 },
      { id: 'shard_palms', name: 'Golden Canopy Shard', desc: 'An amber gemstone tucked under high palm branches.', x: 80, z: 65 },
      { id: 'shard_circle', name: 'Void Circle Shard', desc: 'A mysterious light particle hovering in the historic circle.', x: -40, z: 90 },
      { id: 'shard_altar', name: 'Altar Ascent Shard', desc: 'The peak emerald stone shining atop the basalt monolith.', x: 60, z: -110 }
    ];
    
    shardLocations.forEach(loc => {
      const isCollected = this.progress.collectedShards.includes(loc.id);
      this.createShard(loc.id, loc.name, loc.desc, loc.x, loc.z, isCollected);
    });

    // 3 Mount Beacons to light up
    const beaconLocations = [
      { id: 'beacon_north', name: 'Aurora Monolith', desc: 'The northern high beacon. Ignite to light up the tundra horizon.', x: 45, z: -40 },
      { id: 'beacon_mid', name: 'Canyon Solstice Peak', desc: 'The western cliff beacon. Ignite to project warm twilight light.', x: -70, z: -45 },
      { id: 'beacon_east', name: 'Balsam Ridge Beacon', desc: 'The eastern ancient beacon. Ignite to mark your pathway home.', x: 100, z: -90 }
    ];

    beaconLocations.forEach(loc => {
      const isLit = this.progress.activatedBeacons.includes(loc.id);
      this.createBeacon(loc.id, loc.name, loc.desc, loc.x, loc.z, isLit);
    });
  }

  private createShard(id: string, name: string, desc: string, x: number, z: number, isCollected: boolean) {
    const group = new THREE.Group();
    const y = getTerrainHeight(x, z) + 1.4; // Hover height
    group.position.set(x, y, z);
    
    // Low-poly Crystal gem mesh (Double cone)
    const geom = new THREE.CylinderGeometry(0, 0.28, 0.8, 5);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff, // Neon aqua/turquoise
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0x0097a7,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9,
    });
    
    const crystal = new THREE.Mesh(geom, mat);
    crystal.castShadow = true;
    group.add(crystal);
    
    // Add downward cone to complete double diamond/crystal
    const botGeom = new THREE.CylinderGeometry(0.28, 0, 0.8, 5);
    const botCrystal = new THREE.Mesh(botGeom, mat);
    botCrystal.position.y = -0.55; // aligned underneath
    botCrystal.castShadow = true;
    group.add(botCrystal);

    // Subtle floating particles underneath the shard for magic aura
    const glowGeom = new THREE.SphereGeometry(0.5, 6, 6);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const aura = new THREE.Mesh(glowGeom, glowMat);
    group.add(aura);

    this.interactiveGroup.add(group);
    
    // Hide item if already completed
    if (isCollected) {
      group.visible = false;
    }
    
    const interactable: InteractableObject = {
      id,
      type: 'shard',
      position: new THREE.Vector3(x, y, z),
      mesh: group,
      isCompleted: isCollected,
      name,
      description: desc,
      interactionRange: 3.5,
      pulseSpeed: 1.0 + Math.random() * 0.5,
      onInteract: () => {
        this.collectShard(id);
      }
    };
    
    this.interactables.push(interactable);
    this.glowingShards.set(id, crystal);
  }

  private createBeacon(id: string, name: string, desc: string, x: number, z: number, isLit: boolean) {
    const group = new THREE.Group();
    const y = getTerrainHeight(x, z);
    group.position.set(x, y, z);

    // Stone Pillar structure
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x616161, roughness: 0.82, flatShading: true });
    
    // Tiered Steps
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 2.4), baseMat);
    step1.position.y = 0.2;
    step1.receiveShadow = true;
    step1.castShadow = true;
    group.add(step1);

    const step2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.6), baseMat);
    step2.position.y = 0.5;
    step2.receiveShadow = true;
    step2.castShadow = true;
    group.add(step2);

    // Hollow stone box to hold the beacon core
    const pillarGeom = new THREE.CylinderGeometry(0.5, 0.6, 3.2, 5);
    const pillar = new THREE.Mesh(pillarGeom, baseMat);
    pillar.position.y = 2.0;
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    group.add(pillar);

    // Neon Core
    const coreGeom = new THREE.SphereGeometry(0.35, 5, 5);
    const coreColor = isLit ? 0xffea00 : 0x757575; // Golden active, grey dead
    const coreMat = new THREE.MeshStandardMaterial({
      color: coreColor,
      roughness: 0.3,
      emissive: isLit ? 0xffea00 : 0x000000,
      emissiveIntensity: isLit ? 1.5 : 0,
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.position.y = 3.8;
    group.add(core);

    // Huge glowing cylinder projector (Visual Beacon beam)
    const beamGeom = new THREE.CylinderGeometry(0.4, 0.4, 140, 6, 1, true); // double sided open-ended cylinder
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffea00, // Golden beams of energy
      transparent: true,
      opacity: isLit ? 0.35 : 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    
    const beam = new THREE.Mesh(beamGeom, beamMat);
    beam.position.set(0, 73.8, 0); // extend straight up
    group.add(beam);
    
    this.beaconBeams.set(id, beam);
    this.interactiveGroup.add(group);

    const interactable: InteractableObject = {
      id,
      type: 'beacon',
      position: new THREE.Vector3(x, y + 1.5, z),
      mesh: group,
      isCompleted: isLit,
      name,
      description: desc,
      interactionRange: 4.5,
      pulseSpeed: 1.0,
      onInteract: () => {
        this.igniteBeacon(id, core, beam);
      }
    };

    this.interactables.push(interactable);
  }

  private collectShard(id: string) {
    if (this.progress.collectedShards.includes(id)) return;
    
    // Add to state
    this.progress.collectedShards.push(id);
    this.progress.totalInteracted++;
    
    // Trigger sound
    soundManager.triggerInteractionSound();
    
    // Find item
    const idx = this.interactables.findIndex(item => item.id === id);
    if (idx !== -1) {
      const item = this.interactables[idx];
      item.isCompleted = true;
      
      // Animate shard pickup: quick scale down and then hide
      let scale = 1.0;
      const shrink = () => {
        scale -= 0.12;
        if (scale <= 0) {
          item.mesh.visible = false;
        } else {
          item.mesh.scale.set(scale, scale, scale);
          requestAnimationFrame(shrink);
        }
      };
      shrink();
    }
    
    this.saveProgress();
    this.onStateChangeCallback({ ...this.progress });
  }

  private igniteBeacon(id: string, core: THREE.Mesh, beam: THREE.Mesh) {
    if (this.progress.activatedBeacons.includes(id)) return;

    this.progress.activatedBeacons.push(id);
    this.progress.totalInteracted++;

    // Large acoustic interaction sound
    soundManager.triggerInteractionSound();
    setTimeout(() => {
      // Secondary heavy harmonic celebration sound
      soundManager.triggerChime(2);
      setTimeout(() => soundManager.triggerChime(9), 250);
    }, 300);

    // Edit Core material properties to glow
    const coreMat = core.material as THREE.MeshStandardMaterial;
    coreMat.color.setHex(0xffea00);
    coreMat.emissive.setHex(0xffea00);
    coreMat.emissiveIntensity = 1.6;

    // Expand Beacon beam: lerp opacity
    const beamMat = beam.material as THREE.MeshBasicMaterial;
    let opacity = 0.0;
    const expandBeam = () => {
      opacity += 0.02 * (1.0 - opacity);
      beamMat.opacity = opacity * 0.35;
      
      // Rotate beam slightly for dynamic shimmering
      beam.rotation.y += 0.015;
      
      if (opacity < 0.98) {
        requestAnimationFrame(expandBeam);
      }
    }
    expandBeam();

    // Mark completion flag
    const idx = this.interactables.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.interactables[idx].isCompleted = true;
    }

    this.saveProgress();
    this.onStateChangeCallback({ ...this.progress });
  }

  public checkPlayerProximity(playerPos: THREE.Vector3): InteractableObject | null {
    let closestObject: InteractableObject | null = null;
    let minDistance = Infinity;
    
    this.interactables.forEach(item => {
      if (item.isCompleted && item.type === 'shard') return; // Ignore already collected crystals
      
      const distance = playerPos.distanceTo(item.position);
      
      // Check activation distance limit
      if (distance <= item.interactionRange) {
        if (distance < minDistance) {
          minDistance = distance;
          closestObject = item;
        }
      }
    });
    
    this.currentFocusObject = closestObject;
    return closestObject;
  }

  public animateInteractiveObjects(elapsed: number, delta: number) {
    this.interactables.forEach(item => {
      // 1. Shards floating animation
      if (item.type === 'shard' && !item.isCompleted) {
        const speed = item.pulseSpeed || 1.0;
        
        // Spin crystal
        item.mesh.rotation.y += 1.4 * delta * speed;
        
        // Bob up and down relative to its initial height
        const bobOffset = Math.sin(elapsed * 2.2 * speed) * 0.003;
        item.mesh.position.y += bobOffset;
        
        // Pulse color intensity in standard intervals
        const shardMesh = this.glowingShards.get(item.id);
        if (shardMesh) {
          const mat = shardMesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.5 + Math.sin(elapsed * 2) * 0.35;
        }
      }
      
      // 2. Beacons spiral beam animation (swirling cylindrical dust effect, extremely cool)
      if (item.type === 'beacon' && item.isCompleted) {
        const beam = this.beaconBeams.get(item.id);
        if (beam) {
          beam.rotation.y += 0.35 * delta;
          
          // Micro shimmer pulsing on lit beams
          const beamMat = beam.material as THREE.MeshBasicMaterial;
          beamMat.opacity = 0.25 + Math.sin(elapsed * 4.0) * 0.05;
        }
      }
    });
  }

  private loadProgress() {
    try {
      const stored = localStorage.getItem('zen_explorer_progress_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.progress = {
          collectedShards: parsed.collectedShards || [],
          activatedBeacons: parsed.activatedBeacons || [],
          lastSaved: parsed.lastSaved || '',
          totalInteracted: parsed.totalInteracted || 0,
          auraCrystals: parsed.auraCrystals || 0,
          activePower: parsed.activePower || 'none',
          dashFuel: parsed.dashFuel || 1.0,
        };
      }
    } catch (e) {
      console.warn("localStorage not working or accessible:", e);
    }
  }

  public saveProgress() {
    try {
      this.progress.lastSaved = new Date().toISOString();
      localStorage.setItem('zen_explorer_progress_v1', JSON.stringify(this.progress));
    } catch (e) {
      console.warn("Unable to write progress data to localStorage:", e);
    }
  }

  public updateExternalProgress(newProgress: GameProgress) {
    this.progress.auraCrystals = newProgress.auraCrystals ?? 0;
    this.progress.activePower = newProgress.activePower ?? 'none';
    this.progress.dashFuel = newProgress.dashFuel ?? 1.0;
    this.saveProgress();
  }

  public resetProgress() {
    // Delete all procedurally saved collections in localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('crystal_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    this.progress = {
      collectedShards: [],
      activatedBeacons: [],
      lastSaved: new Date().toISOString(),
      totalInteracted: 0,
      auraCrystals: 0,
      activePower: 'none',
      dashFuel: 1.0,
    };
    
    this.saveProgress();
    
    // Reset meshes and trigger visually
    this.interactables.forEach(item => {
      item.isCompleted = false;
      item.mesh.visible = true;
      item.mesh.scale.set(1, 1, 1);
      
      if (item.type === 'beacon') {
        // Reset beacon core glow
        const coreMesh = item.mesh.children.find(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry);
        if (coreMesh) {
          const coreMat = (coreMesh as THREE.Mesh).material as THREE.MeshStandardMaterial;
          coreMat.color.setHex(0x757575);
          coreMat.emissive.setHex(0x000000);
          coreMat.emissiveIntensity = 0;
        }
        
        // Reset beacon beam opacity
        const beamMesh = item.mesh.children.find(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.CylinderGeometry);
        if (beamMesh) {
          const beamMat = (beamMesh as THREE.Mesh).material as THREE.MeshBasicMaterial;
          beamMat.opacity = 0.0;
        }
      }
    });

    this.onStateChangeCallback({ ...this.progress });
    
    // Reload coordinates if reload available
    window.location.reload();
  }

  public shutdown() {
    this.interactables.forEach(item => {
      item.mesh.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.glowingShards.clear();
    this.beaconBeams.clear();
  }
}
