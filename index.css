/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Controls } from './Controls';
import { soundManager } from '../core/SoundManager';
import { LEVELS } from '../core/Levels';

export class Player {
  public mesh!: THREE.Group;
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public velocity: THREE.Vector3 = new THREE.Vector3();
  
  private speed = 7.5;
  private acceleration = 45.0;
  private friction = 8.0;
  private jumpStrength = 11.0;
  private gravity = 24.0;
  
  private verticalVelocity = 0;
  private isGrounded = true;
  
  private controls: Controls;
  private scene: THREE.Scene;
  private getTerrainHeight: (x: number, z: number) => number;

  // Superpower & Collection State Variables
  public auraCrystals = 0;
  public currentPower: 'none' | 'dash' | 'glide' | 'both' | 'magnet' | 'all' = 'none';
  public dashTimer = 0;
  public dashCooldown = 0;
  public isGliding = false;
  public hasStateChanged = false;
  
  // Trail particles pool
  private trailParticles: { mesh: THREE.Mesh; age: number; maxAge: number; vel: THREE.Vector3 }[] = [];
  private particleCooldown = 0;
  
  // Scarf trailing physics simulation
  private scarfSegments: THREE.Mesh[] = [];
  private scarfHistory: THREE.Vector3[] = [];
  
  // Character Visual parts for animations
  private bodyMesh!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private rightEye!: THREE.Mesh;
  private leftEye!: THREE.Mesh;
  
  // Camera settings
  private cameraDistance = 7.5;
  private cameraHeight = 1.6;
  private currentCameraTarget = new THREE.Vector3();
  
  constructor(
    scene: THREE.Scene, 
    controls: Controls, 
    getTerrainHeight: (x: number, z: number) => number
  ) {
    this.scene = scene;
    this.controls = controls;
    this.getTerrainHeight = getTerrainHeight;
    
    this.createPlayerMesh();
  }

  private createPlayerMesh() {
    this.mesh = new THREE.Group();
    
    // 1. Sleek Cone Body representing a minimalist wizard robe (Journeyman-style)
    // Dark Crimson Red body
    const bodyGeom = new THREE.ConeGeometry(0.5, 1.4, 7);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x93272c, // Gorgeous deep burgundy
      roughness: 0.8,
      flatShading: true,
    });
    this.bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    this.bodyMesh.position.y = 0.7;
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;
    this.mesh.add(this.bodyMesh);
    
    // 2. Glowing Golden Orb Head
    const headGeom = new THREE.SphereGeometry(0.24, 7, 7);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffe57f, // Radiant golden
      emissive: 0xffd54f,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });
    this.headMesh = new THREE.Mesh(headGeom, headMat);
    this.headMesh.position.y = 1.45;
    this.headMesh.castShadow = true;
    this.mesh.add(this.headMesh);

    // 3. Cute glowing eyes (Minimal horizontal slots)
    const eyeGeom = new THREE.BoxGeometry(0.06, 0.03, 0.06);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    this.rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    this.rightEye.position.set(0.08, 1.46, 0.21);
    
    this.leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    this.leftEye.position.set(-0.08, 1.46, 0.21);
    
    this.mesh.add(this.rightEye);
    this.mesh.add(this.leftEye);
    
    // 4. Procedural Flowing Scarf
    // Each segment moves towards the previous one with lagging delay (inertia physics)
    const scarfCount = 6;
    const scarfMat = new THREE.MeshStandardMaterial({
      color: 0xd84315, // Bright orange scarf
      roughness: 0.7,
      flatShading: true,
    });
    
    for (let i = 0; i < scarfCount; i++) {
      // Shink elements gradually
      const sizeFactor = 1.0 - (i / scarfCount) * 0.6;
      const segmentGeom = new THREE.BoxGeometry(0.18 * sizeFactor, 0.08 * sizeFactor, 0.22);
      const segment = new THREE.Mesh(segmentGeom, scarfMat);
      segment.castShadow = true;
      this.scene.add(segment);
      this.scarfSegments.push(segment);
      this.scarfHistory.push(new THREE.Vector3(0, 1.2, 0));
    }
    
    // Initial position on the terrain
    const startY = this.getTerrainHeight(0, 0);
    this.position.set(0, startY, 0);
    this.mesh.position.copy(this.position);
    
    // Load previously collected procedural progress
    try {
      const stored = localStorage.getItem('zen_explorer_progress_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.auraCrystals = parsed.auraCrystals || 0;
        this.currentPower = parsed.activePower || 'none';
        this.hasStateChanged = true;
      }
    } catch (e) {}

    // Unlock starting level powers if applicable
    try {
      const activeLevelId = Number(localStorage.getItem('zen_active_level_id') || '1');
      const activeLevel = LEVELS.find(l => l.id === activeLevelId) || LEVELS[0];
      
      // Seed values are assigned globally for World load rendering
      (window as any)._currentLevelSeed = activeLevel.seed;
      (window as any)._currentLevelHazardFactor = activeLevel.hazardFactor;
      
      if (this.currentPower === 'none') {
        this.currentPower = activeLevel.startingPower;
      } else if (activeLevel.startingPower === 'both') {
        this.currentPower = 'both';
      } else if (activeLevel.startingPower === 'all') {
        this.currentPower = 'all';
      } else if (activeLevel.startingPower === 'magnet') {
        if (this.currentPower === 'both') {
          this.currentPower = 'all';
        } else {
          this.currentPower = 'magnet';
        }
      } else if (activeLevel.startingPower === 'dash' && this.currentPower === 'glide') {
        this.currentPower = 'both';
      } else if (activeLevel.startingPower === 'glide' && this.currentPower === 'dash') {
        this.currentPower = 'both';
      }
      this.hasStateChanged = true;
    } catch (err) {
      console.warn("Failed to apply pathway starting conditions", err);
    }

    this.scene.add(this.mesh);
  }

  private spawnTrailParticle() {
    // Limit active particles to keep performance extremely lightweight
    const maxActive = 25;
    const deadParticle = this.trailParticles.find(p => p.age >= p.maxAge);
    
    if (deadParticle) {
      deadParticle.mesh.position.set(
        this.position.x + (Math.random() * 0.3 - 0.15),
        this.position.y + 0.04,
        this.position.z + (Math.random() * 0.3 - 0.15)
      );
      deadParticle.mesh.scale.set(1, 1, 1);
      deadParticle.mesh.visible = true;
      deadParticle.age = 0;
      deadParticle.maxAge = 0.5 + Math.random() * 0.3;
      deadParticle.vel.set(Math.random() * 0.6 - 0.3, Math.random() * 0.5 + 0.25, Math.random() * 0.6 - 0.3);
      return;
    }

    if (this.trailParticles.length < maxActive) {
      const geom = new THREE.DodecahedronGeometry(0.12, 0);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xdfcbb5, // Soft warm sand-colored dust trail
        transparent: true,
        opacity: 0.6
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(
        this.position.x + (Math.random() * 0.3 - 0.15),
        this.position.y + 0.04,
        this.position.z + (Math.random() * 0.3 - 0.15)
      );
      this.scene.add(mesh);

      this.trailParticles.push({
        mesh,
        age: 0,
        maxAge: 0.5 + Math.random() * 0.3,
        vel: new THREE.Vector3(Math.random() * 0.6 - 0.3, Math.random() * 0.5 + 0.25, Math.random() * 0.6 - 0.3)
      });
    }
  }

  public update(delta: number, elapsed: number, camera: THREE.PerspectiveCamera) {
    this.handleMovement(delta);
    this.updateAnimations(delta, elapsed);
    this.updateCameraFollow(delta, camera);
    
    // Copy real-time coordinates to global hooks for high-performance direct canvas minimap
    (window as any)._playerX = this.position.x;
    (window as any)._playerZ = this.position.z;
    if (this.mesh) {
      (window as any)._playerRotationY = this.mesh.rotation.y;
    }

    // Tick trail particles simulation
    this.trailParticles.forEach(p => {
      if (p.age < p.maxAge) {
        p.age += delta;
        p.mesh.position.addScaledVector(p.vel, delta);
        
        // Face reduction and fading out representing sand cloud dissolution
        const ratio = Math.max(0, 1 - (p.age / p.maxAge));
        p.mesh.scale.setScalar(ratio);
        if (p.mesh.material instanceof THREE.MeshBasicMaterial) {
          p.mesh.material.opacity = ratio * 0.55;
        }
        
        if (p.age >= p.maxAge) {
          p.mesh.visible = false;
        }
      }
    });

    // Particle Spawner triggered during grounded runs
    const horizSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
    if (horizSpeed > 0.45 && this.isGrounded) {
      // Play walking/running sand footstep sounds dynamically with realistic intervals
      soundManager.playFootstepSand();

      this.particleCooldown -= delta;
      if (this.particleCooldown <= 0) {
        this.spawnTrailParticle();
        // Dashing generates lots of sand dust plumes
        this.particleCooldown = this.dashTimer > 0 ? 0.015 : 0.085;
      }
    }
  }

  private handleMovement(delta: number) {
    // Reduce cooldown and active timers
    this.dashTimer = Math.max(0, this.dashTimer - delta);
    this.dashCooldown = Math.max(0, this.dashCooldown - delta);
    
    // 1. Determine direction vectors relative to look directions
    const forwardDirection = new THREE.Vector3(0, 0, -1);
    forwardDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.controls.yaw);
    forwardDirection.normalize();
    
    const rightDirection = new THREE.Vector3(1, 0, 0);
    rightDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.controls.yaw);
    rightDirection.normalize();
    
    const moveInput = new THREE.Vector3();
    
    if (this.controls.keys.forward) moveInput.add(forwardDirection);
    if (this.controls.keys.backward) moveInput.sub(forwardDirection);
    if (this.controls.keys.right) moveInput.add(rightDirection);
    if (this.controls.keys.left) moveInput.sub(rightDirection);
    
    if (moveInput.lengthSq() > 0) {
      moveInput.normalize();
    }
    
    // 2. Dash Superpower activation
    const canDash = this.currentPower === 'dash' || this.currentPower === 'both' || this.currentPower === 'all';
    if (this.controls.keys.dash && this.dashCooldown <= 0 && canDash) {
      this.dashTimer = 0.28;
      this.dashCooldown = 1.3; // 1.3s cooldown
      
      this.hasStateChanged = true;
      soundManager.triggerChime(7);
      
      // Determine dash push velocity
      if (moveInput.lengthSq() > 0) {
        this.velocity.copy(moveInput).multiplyScalar(24.0);
      } else {
        // Dash forward
        const forwardBack = new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(0, this.mesh.rotation.y, 0));
        this.velocity.copy(forwardBack).multiplyScalar(24.0);
      }
    }

    if (this.dashTimer > 0) {
      // Keep dashing velocity locked for duration of dash
      this.position.x += this.velocity.x * delta;
      this.position.z += this.velocity.z * delta;
    } else {
      // Apply standard horizontal Acceleration and Friction
      const targetVelocityX = moveInput.x * this.speed;
      const targetVelocityZ = moveInput.z * this.speed;
      
      // Interpolate towards target speeds
      this.velocity.x += (targetVelocityX - this.velocity.x) * this.acceleration * delta;
      this.velocity.z += (targetVelocityZ - this.velocity.z) * this.acceleration * delta;
      
      // Friction force
      if (moveInput.lengthSq() === 0) {
        this.velocity.x -= this.velocity.x * this.friction * delta;
        this.velocity.z -= this.velocity.z * this.friction * delta;
      }
      
      // Apply horizontal translation
      this.position.x += this.velocity.x * delta;
      this.position.z += this.velocity.z * delta;
    }
    
    // 3. Gravitational forces + Jumping physics + Glide Superpower
    const currentGroundHeight = this.getTerrainHeight(this.position.x, this.position.z);
    
    if (this.isGrounded) {
       this.verticalVelocity = 0;
       this.isGliding = false;
       
       // Stand on floor height
       this.position.y = currentGroundHeight;
       
       if (this.controls.keys.up) {
         this.verticalVelocity = this.jumpStrength;
         this.isGrounded = false;
         soundManager.triggerChime(11);
       }
    } else {
       // Fall down under normal gravity
       let gravityFactor = this.gravity;
       
       // Handle glide mechanics
       const canGlide = this.currentPower === 'glide' || this.currentPower === 'both' || this.currentPower === 'all';
      if (this.controls.keys.up && canGlide && this.verticalVelocity < 0) {
        this.isGliding = true;
        // Float softly downward (constant low terminal velocity)
        this.verticalVelocity = -1.6;
      } else {
        this.isGliding = false;
        this.verticalVelocity -= gravityFactor * delta;
      }
      
      this.position.y += this.verticalVelocity * delta;
      
      // Hit ground check
      if (this.position.y <= currentGroundHeight) {
        this.position.y = currentGroundHeight;
        this.verticalVelocity = 0;
        this.isGrounded = true;
        this.isGliding = false;
      }
    }
    
    // Limitless endless coordinates: removed boundary clip locks!
    
    // Apply updated coordinates
    this.mesh.position.copy(this.position);
    
    // Rotate character smoothly to trend in movement path
    if (moveInput.lengthSq() > 0 && this.dashTimer <= 0) {
      const targetAngle = Math.atan2(moveInput.x, moveInput.z);
      // Smooth interpolation of Euler rotation
      let diff = targetAngle - this.mesh.rotation.y;
      
      // Normalize rotation angle difference
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.mesh.rotation.y += diff * 12 * delta;
    }
  }

  /**
   * Absorb a procedurally spawned sand glow crystal
   */
  public collectCrystal() {
    this.auraCrystals++;
    this.hasStateChanged = true;
    soundManager.triggerChime(6);
  }

  /**
   * Unlock or stack a brand new superpower
   */
  public grantPower(type: 'dash' | 'glide') {
    let unlocked = false;
    
    if (this.currentPower === 'none') {
      this.currentPower = type;
      unlocked = true;
    } else if (this.currentPower === 'dash' && type === 'glide') {
      this.currentPower = 'both';
      unlocked = true;
    } else if (this.currentPower === 'glide' && type === 'dash') {
      this.currentPower = 'both';
      unlocked = true;
    }
    
    if (unlocked) {
      this.hasStateChanged = true;
      soundManager.triggerChime(2);
      
      // Trigger a beautiful onscreen message!
      if ((window as any)._showPowerBanner) {
        (window as any)._showPowerBanner(type);
      }
    }
  }

  /**
   * Applies hazard kickback pushes (e.g. hitting obsidian crystal spike pillars)
   */
  public applyKickback(vx: number, vy: number, vz: number) {
    this.velocity.set(vx, 0, vz);
    this.verticalVelocity = vy;
    this.isGrounded = false;
    this.isGliding = false;
    
    this.position.y += 0.15; // Unstick from ground slightly
  }

  /**
   * Applies vortex gravity launch springs (e.g. stepping inside dynamic sand cyclones)
   */
  public applyVortexLaunch(strength: number) {
    this.verticalVelocity = strength;
    this.isGrounded = false;
    this.isGliding = false;
    this.position.y += 0.25;
    
    soundManager.triggerChime(9);
  }

  private updateAnimations(delta: number, elapsed: number) {
    const horizontalSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
    const isMoving = horizontalSpeed > 0.4;
    
    // 1. Character model animation rigging (Robe bobbing and lean tilting)
    if (isMoving && this.isGrounded) {
      // Frequency and amplitude relative to speed
      const bobFreq = horizontalSpeed * 1.5;
      const bobTranslation = Math.sin(elapsed * bobFreq) * 0.06;
      this.bodyMesh.position.y = 0.7 + bobTranslation;
      this.headMesh.position.y = 1.45 + bobTranslation;
      this.rightEye.position.y = 1.46 + bobTranslation;
      this.leftEye.position.y = 1.46 + bobTranslation;
      
      // Lean character model slightly forward based on motion
      this.bodyMesh.rotation.x = 0.12; 
    } else {
      // Soft breathing hover idle
      const idleBob = Math.sin(elapsed * 2.2) * 0.02;
      this.bodyMesh.position.y = 0.7 + idleBob;
      this.headMesh.position.y = 1.45 + idleBob;
      this.rightEye.position.y = 1.46 + idleBob;
      this.leftEye.position.y = 1.46 + idleBob;
      
      this.bodyMesh.rotation.x = 0;
    }
    
    // Roll bobbing while in mid-air
    if (!this.isGrounded) {
      this.bodyMesh.rotation.x = -Math.min(0.2, this.verticalVelocity * 0.03);
    }
    
    // 2. Trailing physics simulation for the gorgeous Scarf segments
    // Anchored at the back of the player neck: headMesh height
    const neckPos = new THREE.Vector3(0, 1.3, -0.2);
    neckPos.applyMatrix4(this.mesh.matrixWorld);
    
    // Capture position history
    this.scarfHistory.unshift(neckPos.clone());
    if (this.scarfHistory.length > 50) {
      this.scarfHistory.pop();
    }
    
    // Smoothly drag each scarf link behind previous one
    for (let i = 0; i < this.scarfSegments.length; i++) {
      const segment = this.scarfSegments[i];
      // Target position index is linearly staggered
      const historyIndex = Math.min(
        Math.floor((i + 1) * 3), 
        this.scarfHistory.length - 1
      );
      
      const targetPos = this.scarfHistory[historyIndex];
      
      // Linear interpolate position for soft drag inertia physics
      segment.position.lerp(targetPos, 15 * delta);
      
      // Align segment orientation to face the direction of the drag trail
      if (i === 0) {
        segment.lookAt(neckPos);
      } else {
        segment.lookAt(this.scarfSegments[i - 1].position);
      }
      
      // Add a subtle wavy wind ripple on the scarf over time
      const waveOffset = Math.sin(elapsed * 10 + i * 1.5) * 0.02;
      segment.position.y += waveOffset;

      // Superpower visual feedback: what has to glow glows!
      const mat = segment.material as THREE.MeshStandardMaterial;
      if (this.dashTimer > 0) {
        mat.color.setHex(0xffea00); // Golden solar glow
        mat.emissive.setHex(0xffea00);
        mat.emissiveIntensity = 2.0;
        segment.scale.setScalar(1.4);
      } else if (this.isGliding) {
        mat.color.setHex(0x00e5ff); // Turquoise wind glide glow
        mat.emissive.setHex(0x00e5ff);
        mat.emissiveIntensity = 2.0;
        segment.scale.setScalar(1.1);
      } else {
        mat.color.setHex(0xd84315); // Normal orange cloth
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        segment.scale.setScalar(1.0);
      }
    }
  }

  private updateCameraFollow(delta: number, camera: THREE.PerspectiveCamera) {
    // 1. Calculate ideal standard coordinate behind the player based on yaw & pitch dials
    const targetOffset = new THREE.Vector3(
      Math.sin(this.controls.yaw) * Math.cos(this.controls.pitch) * this.cameraDistance,
      Math.sin(this.controls.pitch) * this.cameraDistance + this.cameraHeight,
      Math.cos(this.controls.yaw) * Math.cos(this.controls.pitch) * this.cameraDistance
    );
    
    const idealCamPos = this.position.clone().add(targetOffset);
    
    // Keep camera above ground + safety offset of 0.4 units
    const groundAtCam = this.getTerrainHeight(idealCamPos.x, idealCamPos.z);
    if (idealCamPos.y < groundAtCam + 0.6) {
      idealCamPos.y = groundAtCam + 0.6;
    }
    
    // 2. Calm, elastic Camera interpolation (Zen smoothing lerp)
    camera.position.lerp(idealCamPos, 9.0 * delta);
    
    // 3. Set camera focus target slightly above players neck
    const camLookTarget = this.position.clone().add(new THREE.Vector3(0, 1.2, 0));
    this.currentCameraTarget.lerp(camLookTarget, 12 * delta);
    
    camera.lookAt(this.currentCameraTarget);
  }

  public teleport(x: number, z: number) {
    const y = this.getTerrainHeight(x, z);
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.verticalVelocity = 0;
    this.isGrounded = true;
    
    this.mesh.position.copy(this.position);
    
    // Reset scarf coordinates instantly so it doesn't stretch weirdly during teleportation
    const throatPos = new THREE.Vector3(x, y + 1.3, z - 0.2);
    for (let i = 0; i < this.scarfHistory.length; i++) {
      this.scarfHistory[i].copy(throatPos);
    }
    this.scarfSegments.forEach(segment => segment.position.copy(throatPos));
  }

  public dispose() {
    this.scarfSegments.forEach(segment => {
      this.scene.remove(segment);
      segment.geometry.dispose();
      if (Array.isArray(segment.material)) {
        segment.material.forEach(m => m.dispose());
      } else {
        segment.material.dispose();
      }
    });

    // Clean up trail particle meshes & materials
    this.trailParticles.forEach(p => {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      if (Array.isArray(p.mesh.material)) {
        p.mesh.material.forEach(m => m.dispose());
      } else {
        p.mesh.material.dispose();
      }
    });
    this.trailParticles = [];

    this.scene.remove(this.mesh);
    
    delete (window as any)._playerX;
    delete (window as any)._playerZ;
    delete (window as any)._playerRotationY;
  }
}
