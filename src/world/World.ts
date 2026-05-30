/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Calculates a smooth procedural dune height map
 * Spawn area (0,0) is kept flat for a comfortable intro
 */
export function getTerrainHeight(x: number, z: number): number {
  const distFromOrigin = Math.sqrt(x * x + z * z);
  
  // Rolling dunes noise
  const dune1 = Math.sin(x * 0.015) * Math.cos(z * 0.015) * 8.5;
  const dune2 = Math.cos(x * 0.035) * Math.sin(z * 0.025) * 2.8;
  const dune3 = Math.sin(x * 0.07) * Math.cos(z * 0.07) * 0.8;
  
  // Blend factor: perfectly flat at 0, full height dunes beyond 25 units
  const blend = Math.min(1.0, distFromOrigin / 25.0);
  
  return (dune1 + dune2 + dune3) * blend;
}

// Helper for deterministic procedural item spawning and grid generation
export class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

export function hash2D(x: number, z: number): number {
  const h = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453123;
  return h - Math.floor(h);
}

export class World {
  private scene: THREE.Scene;
  private terrainMesh!: THREE.Mesh;
  private graphicsQuality: string;
  
  // Asset Registry groups
  public staticScenery: THREE.Group = new THREE.Group();
  public interactiveElements: THREE.Group = new THREE.Group();
  public proceduralGroup: THREE.Group = new THREE.Group();
  
  // Particles
  private particleGroup!: THREE.Points;
  private particleCount = 180;
  private particlePositions!: Float32Array;
  private particleSpeeds: number[] = [];
  
  // Decorative assets list for animation hooks (like spinning crystals)
  private animatables: Array<{ mesh: THREE.Object3D; animType: string; speed: number }> = [];

  // Endless world tracking
  private loadedCells: Map<string, THREE.Group> = new Map();
  private lastCellX = 0;
  private lastCellZ = 0;
  private lastGridUpdatePos = new THREE.Vector3(99999, 99999, 99999);

  constructor(scene: THREE.Scene, graphicsQuality: string = 'high') {
    this.scene = scene;
    this.graphicsQuality = graphicsQuality;
    
    if (graphicsQuality === 'high') {
      this.particleCount = 450;
    } else if (graphicsQuality === 'medium') {
      this.particleCount = 280;
    } else {
      this.particleCount = 120;
    }
    
    this.init();
  }

  private init() {
    this.scene.add(this.staticScenery);
    this.scene.add(this.interactiveElements);
    this.scene.add(this.proceduralGroup);
    
    this.buildTerrain();
    this.buildScenery();
    this.buildParticles();
  }

  private buildTerrain() {
    const size = 380;
    const segments = 120;
    
    // FlatShading standard plane
    const geom = new THREE.PlaneGeometry(size, size, segments, segments);
    geom.rotateX(-Math.PI / 2); // Lay flat
    
    // Height map morphing
    const posAttr = geom.attributes.position;
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < posAttr.count; i++) {
      vertex.fromBufferAttribute(posAttr, i);
      const h = getTerrainHeight(vertex.x, vertex.z);
      posAttr.setY(i, h);
    }
    
    geom.computeVertexNormals();
    
    const mat = new THREE.MeshStandardMaterial({
      color: 0xdecbb7, // Warm sands
      roughness: 0.94,
      metalness: 0.01,
      flatShading: true, // Vital for the crisp stylized low-poly faceted look
    });
    
    this.terrainMesh = new THREE.Mesh(geom, mat);
    this.terrainMesh.receiveShadow = true;
    this.terrainMesh.castShadow = false;
    
    this.scene.add(this.terrainMesh);
  }

  private buildScenery() {
    // 1. Central Zen Shrine Pillar setup (Spawn marker)
    this.createCentralShrine();
    
    // 2. Scatter ancient monolith structures, low-poly desert palm-trees and sandstone slabs
    const coords = [
      // Close coordinates
      { x: -15, z: -25, type: 'arch' },
      { x: 30, z: 15, type: 'ruin_pillar' },
      { x: -28, z: 25, type: 'oasis' },
      { x: 45, z: -40, type: 'arch' },
      
      // Far/Ridge coordinates
      { x: -70, z: -45, type: 'palms' },
      { x: 80, z: 65, type: 'palms' },
      { x: -40, z: 90, type: 'monolith_circle' },
      { x: 100, z: -90, type: 'ruin_wall' },
      { x: -110, z: 50, type: 'palms' },
      { x: 60, z: -110, type: 'altar' },
      { x: -95, z: -100, type: 'arch' },
      { x: 120, z: 40, type: 'monolith_circle' },
      { x: 130, z: 130, type: 'palms' },
      { x: -140, z: -140, type: 'oasis' },
    ];
    
    coords.forEach((coord, idx) => {
      const y = getTerrainHeight(coord.x, coord.z);
      const group = new THREE.Group();
      group.position.set(coord.x, y, coord.z);
      
      // Rotate randomly for natural look
      group.rotation.y = Math.random() * Math.PI * 2;
      
      switch (coord.type) {
        case 'arch':
          this.buildAncientArch(group);
          break;
        case 'ruin_pillar':
          this.buildRuinPillars(group);
          break;
        case 'oasis':
          this.buildOasis(group);
          break;
        case 'palms':
          this.buildPalmCluster(group);
          break;
        case 'monolith_circle':
          this.buildMonolithCircle(group);
          break;
        case 'ruin_wall':
          this.buildAncientWall(group);
          break;
        case 'altar':
          this.buildSacredAltar(group, idx.toString());
          break;
      }
      
      this.staticScenery.add(group);
    });
  }

  private createCentralShrine() {
    const group = new THREE.Group();
    group.position.set(0, getTerrainHeight(0,0), 0);
    
    // Smooth circle foundation
    const geom = new THREE.CylinderGeometry(4, 4.3, 0.4, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x9e9185,
      roughness: 0.8,
      flatShading: true,
    });
    const base = new THREE.Mesh(geom, mat);
    base.receiveShadow = true;
    base.castShadow = true;
    group.add(base);
    
    // Monolithic central floating gem (Visual Centerpiece)
    const gemGeom = new THREE.OctahedronGeometry(1.0, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xe0f7fa, // Crystalline turquoise
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x00bcd4,
      emissiveIntensity: 0.6,
    });
    const keyGem = new THREE.Mesh(gemGeom, gemMat);
    keyGem.position.y = 2.8;
    keyGem.castShadow = true;
    group.add(keyGem);
    
    this.animatables.push({
      mesh: keyGem,
      animType: 'float_spin',
      speed: 1.0,
    });

    // 4 miniature monolith guards surrounding the base
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const monolith = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 1.8, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x827717, roughness: 0.9, flatShading: true })
      );
      monolith.position.set(Math.cos(angle) * 3, 0.9, Math.sin(angle) * 3);
      monolith.rotation.y = -angle + Math.PI / 4;
      monolith.castShadow = true;
      monolith.receiveShadow = true;
      group.add(monolith);
    }
    
    this.staticScenery.add(group);
  }

  private buildAncientArch(group: THREE.Group) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x8a837c, roughness: 0.85, flatShading: true });
    
    // Pillar Left
    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.5, 0.8), mat);
    leftPillar.position.set(-1.8, 2.25, 0);
    leftPillar.castShadow = true;
    leftPillar.receiveShadow = true;
    
    // Pillar Right
    const rightPillar = leftPillar.clone();
    rightPillar.position.x = 1.8;
    
    // Keystone Header
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.7, 1.0), mat);
    archTop.position.set(0, 4.6, 0);
    archTop.rotation.z = (Math.random() - 0.5) * 0.05; // Slightly skewed for historic ruins feel
    archTop.castShadow = true;
    archTop.receiveShadow = true;
    
    group.add(leftPillar, rightPillar, archTop);
  }

  private buildRuinPillars(group: THREE.Group) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x827b75, roughness: 0.9, flatShading: true });
    
    // Generate some broken standing pillars of differing heights
    const pCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < pCount; i++) {
      const h = 2.0 + Math.random() * 3.5;
      const radius = 0.35 + Math.random() * 0.2;
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.1, h, 6), mat);
      
      const angle = (i / pCount) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 1.5 + Math.random() * 2.0;
      
      cyl.position.set(Math.cos(angle) * dist, h / 2, Math.sin(angle) * dist);
      
      // Slightly rotate pillars
      cyl.rotation.x = (Math.random() - 0.5) * 0.15;
      cyl.rotation.z = (Math.random() - 0.5) * 0.15;
      
      cyl.castShadow = true;
      cyl.receiveShadow = true;
      group.add(cyl);
    }
  }

  private buildOasis(group: THREE.Group) {
    // A cute tiny dune spring containing low-poly rocks and palms
    const waterGeom = new THREE.CylinderGeometry(3.5, 3.5, 0.1, 7);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x26c6da,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.75,
    });
    
    const pool = new THREE.Mesh(waterGeom, waterMat);
    pool.position.y = 0.05;
    group.add(pool);

    // Border rocks
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x6e665f, roughness: 0.9, flatShading: true });
    for (let i = 0; i < 6; i++) {
      const size = 0.6 + Math.random() * 0.8;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size), rockMat);
      
      const angle = (i / 6) * Math.PI * 2;
      rock.position.set(Math.cos(angle) * 3.6, size/3, Math.sin(angle) * 3.6);
      rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      rock.castShadow = true;
      group.add(rock);
    }
    
    // Add two palms next to it
    const palmGrp = new THREE.Group();
    palmGrp.position.set(1.5, 0, -1.5);
    this.buildPalmCluster(palmGrp, 2);
    group.add(palmGrp);
  }

  private buildPalmCluster(group: THREE.Group, count: number = 3) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4f45, roughness: 0.9, flatShading: true });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x6e8e70, roughness: 0.8, flatShading: true }); // Muted green-herb palm
    
    for (let c = 0; c < count; c++) {
      const palm = new THREE.Group();
      
      // Offset from group center
      const offsetX = (c - count / 2) * 1.5 + (Math.random() - 0.5) * 0.5;
      const offsetZ = (Math.random() - 0.5) * 1.2;
      palm.position.set(offsetX, 0, offsetZ);
      
      const height = 4.5 + Math.random() * 3.0;
      
      // Palm trunk made of several nested cylinder segments that bend
      const segments = 5;
      const bendFactor = 0.12 + Math.random() * 0.12;
      const angleOffset = Math.random() * Math.PI * 2;
      
      let prevPos = new THREE.Vector3(0, 0, 0);
      
      for (let s = 0; s < segments; s++) {
        const segH = height / segments;
        const radius = 0.22 * (1.0 - (s / segments) * 0.4);
        const segGeom = new THREE.CylinderGeometry(radius * 0.8, radius, segH, 5);
        const seg = new THREE.Mesh(segGeom, trunkMat);
        
        seg.position.copy(prevPos);
        seg.position.y += segH / 2;
        
        // Lean trunk segments out outwards
        const lean = (s / segments) * bendFactor;
        seg.position.x += Math.cos(angleOffset) * lean;
        seg.position.z += Math.sin(angleOffset) * lean;
        
        seg.rotation.z = -Math.cos(angleOffset) * lean * 0.8;
        seg.rotation.x = Math.sin(angleOffset) * lean * 0.8;
        
        seg.castShadow = true;
        seg.receiveShadow = true;
        
        palm.add(seg);
        prevPos.set(
          seg.position.x + Math.cos(angleOffset) * lean * 0.2,
          seg.position.y + segH / 2,
          seg.position.z + Math.sin(angleOffset) * lean * 0.2
        );
      }
      
      // Stylized Palm fronds at the crown
      const frondCount = 6;
      const crownPos = prevPos.clone();
      
      for (let f = 0; f < frondCount; f++) {
        const frondAngle = (f / frondCount) * Math.PI * 2 + Math.random() * 0.1;
        const frondGeom = new THREE.ConeGeometry(0.35, 2.2, 4);
        frondGeom.translate(0, 1.1, 0); // Offset pivot to branch end
        
        const frond = new THREE.Mesh(frondGeom, leafMat);
        frond.position.copy(crownPos);
        
        // Tilt leaves downwards
        frond.rotation.z = Math.sin(frondAngle) * 0.5 + Math.PI / 2.3;
        frond.rotation.x = Math.cos(frondAngle) * 0.5;
        frond.rotation.y = -frondAngle + Math.PI/2;
        
        frond.castShadow = true;
        palm.add(frond);
      }
      
      group.add(palm);
    }
  }

  private buildMonolithCircle(group: THREE.Group) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x7a726c, roughness: 0.9, flatShading: true });
    const radius = 6.0;
    const mCount = 5;
    
    // Center glow stone
    const altar = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.3, 0.6, 6),
      new THREE.MeshStandardMaterial({ color: 0x5e5650, roughness: 0.85, flatShading: true })
    );
    altar.position.y = 0.3;
    altar.castShadow = true;
    group.add(altar);

    // Shard pillar
    for (let i = 0; i < mCount; i++) {
      const angle = (i / mCount) * Math.PI * 2;
      const h = 4.0 + Math.random() * 2.5;
      
      const mon = new THREE.Mesh(new THREE.BoxGeometry(0.7, h, 1.2), mat);
      mon.position.set(Math.cos(angle) * radius, h / 2, Math.sin(angle) * radius);
      
      // Face inwards towards altar
      mon.rotation.y = -angle + Math.PI / 2;
      mon.rotation.x = (Math.random() - 0.5) * 0.08;
      
      mon.castShadow = true;
      mon.receiveShadow = true;
      group.add(mon);
    }
  }

  private buildAncientWall(group: THREE.Group) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x807973, roughness: 0.9, flatShading: true });
    
    for (let i = 0; i < 4; i++) {
      const h = 1.2 + Math.random() * 2.2;
      const stone = new THREE.Mesh(new THREE.BoxGeometry(2.5, h, 0.9), mat);
      stone.position.set(i * 2.3 - 3.5, h / 2, (Math.random() - 0.5) * 0.4);
      stone.rotation.y = (Math.random() - 0.5) * 0.08;
      stone.rotation.z = (Math.random() - 0.5) * 0.05;
      
      stone.castShadow = true;
      stone.receiveShadow = true;
      group.add(stone);
    }
  }

  private buildSacredAltar(group: THREE.Group, id: string) {
    // Foundation step
    const foundation = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.8, 0.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x6e665f, roughness: 0.9, flatShading: true })
    );
    foundation.position.y = 0.25;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    group.add(foundation);

    // Monolith backplate
    const backplate = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 4.0, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x544e49, roughness: 0.9, flatShading: true })
    );
    backplate.position.set(0, 2.0, -1.0);
    backplate.castShadow = true;
    backplate.receiveShadow = true;
    group.add(backplate);
  }

  private buildParticles() {
    const geom = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);
    
    const boundaries = 180;
    
    for (let i = 0; i < this.particleCount; i++) {
      // Setup coordinates within radial dome
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * boundaries;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const groundVal = getTerrainHeight(x, z);
      const y = groundVal + 1.0 + Math.random() * 15.0; // Float between ground and 15m high
      
      this.particlePositions[i * 3] = x;
      this.particlePositions[i * 3 + 1] = y;
      this.particlePositions[i * 3 + 2] = z;
      
      // Floating speeds
      this.particleSpeeds.push(1.2 + Math.random() * 2.2);
    }
    
    geom.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    
    // Beautiful stylized yellow-golden particles (tiny simple boxes under points)
    const mat = new THREE.PointsMaterial({
      color: 0xffd54f, // Soft golden amber glow
      size: 0.24,
      transparent: true,
      opacity: 0.72,
      sizeAttenuation: true,
    });
    
    this.particleGroup = new THREE.Points(geom, mat);
    this.scene.add(this.particleGroup);
  }

  public animateParticles(delta: number, elapsed: number, playerPos: THREE.Vector3) {
    const posAttr = this.particleGroup.geometry.attributes.position;
    const count = posAttr.count;
    
    // Move particles horizontally to simulate ambient wind
    const windSpeedX = 2.0 * delta;
    const windSpeedZ = -0.5 * delta;
    
    const boundaries = 180;
    
    for (let i = 0; i < count; i++) {
      let x = posAttr.getX(i);
      let y = posAttr.getY(i);
      let z = posAttr.getZ(i);
      
      x += windSpeedX;
      z += windSpeedZ;
      
      // Oscillate height based on particle speeds
      y += Math.sin(elapsed * 0.8 + i) * 0.015;
      
      // Distance boundary wrap-around
      const distFromPlayer = Math.sqrt((x - playerPos.x) * (x - playerPos.x) + (z - playerPos.z) * (z - playerPos.z));
      if (distFromPlayer > boundaries || y < getTerrainHeight(x, z)) {
        // Respawn close to player on windward side
        const angle = controlsToAngle(elapsed) + (Math.random() - 0.5) * 1.5;
        const radius = boundaries - 20 - Math.random() * 30;
        
        x = playerPos.x - Math.cos(angle) * radius;
        z = playerPos.z - Math.sin(angle) * radius;
        y = getTerrainHeight(x, z) + 0.5 + Math.random() * 14.0;
      }
      
      posAttr.setXYZ(i, x, y, z);
    }
    
    posAttr.needsUpdate = true;
    
    // Animate custom static scenery items (like rotating shrine octahedrons)
    this.animatables.forEach((item) => {
      if (item.animType === 'float_spin') {
        item.mesh.rotation.y += delta * 0.45 * item.speed;
        item.mesh.position.y += Math.sin(elapsed * 1.1) * 0.003 * item.speed;
      }
    });
  }

  /**
   * Main game tick update call from App.tsx
   */
  public update(delta: number, elapsed: number, player: any) {
    // 1. Shift the endless terrain mesh dynamically around user coordinates
    this.updateTerrainFollow(player.position);
    
    // 2. Stream load visible 160x160 chunks in 3x3 grid neighborhood
    this.updateProceduralGrid(player.position);
    
    // 3. Move sandstorm ambient particles
    this.animateParticles(delta, elapsed, player.position);
    
    // 4. Animate procedural local meshes (spin crystals, rotate vortexes, etc.)
    this.loadedCells.forEach((cellGroup) => {
      cellGroup.children.forEach((obj) => {
        // Floating Crystal animation
        if (obj.userData?.type === 'crystal') {
          obj.rotation.y += delta * 1.6;
          obj.position.y = obj.userData.initialY + Math.sin(elapsed * 2.5 + obj.position.x) * 0.12;
        }
        // Sand Vortex spinning
        if (obj.userData?.type === 'trap_vortex') {
          obj.rotation.y += delta * 3.5;
          obj.scale.setScalar(1.0 + Math.sin(elapsed * 3.0) * 0.04);
        }
        // Floating Shrines power floating core
        if (obj.userData?.type === 'shrine') {
          const core = obj.children.find(c => c.name === 'shrine_core');
          if (core) {
            core.rotation.y += delta * 1.5;
            core.rotation.x += delta * 0.5;
            core.position.y = 2.4 + Math.sin(elapsed * 2.0) * 0.12;
          }
        }
        // Pulse glow of hazards
        if (obj.userData?.type === 'trap_spikes') {
          const activeSpike = obj.children.find(c => c.name === 'red_crystals');
          if (activeSpike) {
            const mat = (activeSpike as THREE.Mesh).material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 1.0 + Math.sin(elapsed * 6.0) * 0.8;
          }
        }
      });
    });

    // 5. Physics collision triggers
    this.checkCollisions(player, elapsed, delta);
  }

  /**
   * Seamless endless terrain centering on 95-unit crossings
   */
  private updateTerrainFollow(playerPos: THREE.Vector3) {
    const size = 380; // Size of plane geometry
    const gridStep = 95; // Step spacing threshold
    
    const targetX = Math.round(playerPos.x / gridStep) * gridStep;
    const targetZ = Math.round(playerPos.z / gridStep) * gridStep;
    
    if (this.terrainMesh.position.x !== targetX || this.terrainMesh.position.z !== targetZ) {
      this.terrainMesh.position.set(targetX, 0, targetZ);
      
      const geom = this.terrainMesh.geometry as THREE.PlaneGeometry;
      const posAttr = geom.attributes.position;
      const vertex = new THREE.Vector3();
      
      for (let i = 0; i < posAttr.count; i++) {
        vertex.fromBufferAttribute(posAttr, i);
        const worldX = vertex.x + targetX;
        const worldZ = vertex.z + targetZ;
        const h = getTerrainHeight(worldX, worldZ);
        posAttr.setY(i, h);
      }
      
      geom.computeVertexNormals();
      posAttr.needsUpdate = true;
    }
  }

  /**
   * Procedural Stream Chunking Manager
   */
  private updateProceduralGrid(playerPos: THREE.Vector3) {
    if (playerPos.distanceToSquared(this.lastGridUpdatePos) < 16.0) {
      return;
    }
    this.lastGridUpdatePos.copy(playerPos);

    const CELL_SIZE = 160;
    const currentCellX = Math.round(playerPos.x / CELL_SIZE);
    const currentCellZ = Math.round(playerPos.z / CELL_SIZE);
    
    const neighborhood = new Set<string>();
    
    // Check 3x3 chunks around player coordinates
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const cx = currentCellX + dx;
        const cz = currentCellZ + dz;
        const key = `${cx},${cz}`;
        neighborhood.add(key);
        
        // Skip spawn boundary cells to protect the introductory circle (radius 150)
        if (Math.max(Math.abs(cx), Math.abs(cz)) <= 0) {
          continue;
        }
        
        if (!this.loadedCells.has(key)) {
          this.loadCell(cx, cz, CELL_SIZE);
        }
      }
    }
    
    // Despawn chunks too far from player
    this.loadedCells.forEach((cellGroup, key) => {
      if (!neighborhood.has(key)) {
        this.proceduralGroup.remove(cellGroup);
        cellGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
          if (child instanceof THREE.PointLight) {
            child.dispose();
          }
        });
        this.loadedCells.delete(key);
      }
    });
  }

  /**
   * Deterministically load a brand new 160x160 chunk cell
   */
  private loadCell(cx: number, cz: number, CELL_SIZE: number) {
    const cellGroup = new THREE.Group();
    cellGroup.position.set(cx * CELL_SIZE, 0, cz * CELL_SIZE);
    
    const levelSeed = (window as any)._currentLevelSeed || 0;
    const seed = (cx * 73856093 ^ cz * 19349663) + levelSeed;
    const rng = new SeededRandom(seed);
    
    // 1. Decorative scenery (clumps of palms or obsidian monolith ruins)
    const sceneryRoll = rng.next();
    if (sceneryRoll < 0.35) {
      // Clump of palm trees
      const palmCount = Math.floor(rng.range(1, 4));
      const palms = new THREE.Group();
      palms.position.set(rng.range(-15, 15), 0, rng.range(-15, 15));
      this.buildPalmCluster(palms, palmCount);
      // Clamp to local terrain heights
      palms.children.forEach(child => {
        const worldX = cellGroup.position.x + palms.position.x + child.position.x;
        const worldZ = cellGroup.position.z + palms.position.z + child.position.z;
        child.position.y = getTerrainHeight(worldX, worldZ);
      });
      cellGroup.add(palms);
    } else if (sceneryRoll < 0.70) {
      // Ancient monolith ruins with glowing emissive runes
      const ruins = new THREE.Group();
      ruins.position.set(rng.range(-20, 20), 0, rng.range(-20, 20));
      const wx = cellGroup.position.x + ruins.position.x;
      const wz = cellGroup.position.z + ruins.position.z;
      ruins.position.y = getTerrainHeight(wx, wz);
      this.buildMonolithCircle(ruins);
      
      // Make the center altar gem glow cybernetically!
      const altarGlowMat = new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        emissive: 0x00e5ff,
        emissiveIntensity: 1.5,
      });
      const miniGem = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35), altarGlowMat);
      miniGem.position.set(0, 1.2, 0);
      ruins.add(miniGem);
      
      if (this.graphicsQuality === 'high') {
        const pLight = new THREE.PointLight(0x00e5ff, 1.5, 8);
        pLight.position.set(0, 1.5, 0);
        ruins.add(pLight);
      }
      cellGroup.add(ruins);
    }
    
    // 2. Procedural Sand Crystals (Glow Crystals to expand player score/fuel)
    const crystalCount = Math.floor(rng.range(1, 4));
    for (let c = 0; c < crystalCount; c++) {
      const offsetX = rng.range(-CELL_SIZE / 2.5, CELL_SIZE / 2.5);
      const offsetZ = rng.range(-CELL_SIZE / 2.5, CELL_SIZE / 2.5);
      const wx = cx * CELL_SIZE + offsetX;
      const wz = cz * CELL_SIZE + offsetZ;
      const wy = getTerrainHeight(wx, wz) + 1.2;
      
      const crystalId = `crystal_${cx}_${cz}_${c}`;
      if (localStorage.getItem(crystalId) === 'collected') {
        continue;
      }
      
      const crystalMesh = this.createProceduralCrystalMesh(wy);
      crystalMesh.position.set(offsetX, wy, offsetZ);
      crystalMesh.name = crystalId;
      crystalMesh.userData = { type: 'crystal', wx, wy, wz, initialY: wy };
      
      cellGroup.add(crystalMesh);
    }

    // 3. Superpower Shrines (Unlocks dash or glide directly on touch!)
    const shrineRoll = rng.next();
    if (shrineRoll < 0.22) {
      const offsetX = rng.range(-CELL_SIZE / 3, CELL_SIZE / 3);
      const offsetZ = rng.range(-CELL_SIZE / 3, CELL_SIZE / 3);
      const wx = cx * CELL_SIZE + offsetX;
      const wz = cz * CELL_SIZE + offsetZ;
      const wy = getTerrainHeight(wx, wz);
      
      const powerType = rng.next() < 0.5 ? 'dash' : 'glide';
      const shrineGroup = new THREE.Group();
      shrineGroup.name = `shrine_${cx}_${cz}`;
      shrineGroup.position.set(offsetX, wy, offsetZ);
      
      this.buildPowerShrine(shrineGroup, powerType);
      shrineGroup.userData = { type: 'shrine', wx, wy, wz, power: powerType };
      
      cellGroup.add(shrineGroup);
    }

    // 4. Hurdle / Hardship Traps
    const trapRoll = rng.next();
    const trapMultiplier = (window as any)._currentLevelHazardFactor || 1.0;
    if (trapRoll < 0.35 * trapMultiplier) {
      const offsetX = rng.range(-CELL_SIZE / 3, CELL_SIZE / 3);
      const offsetZ = rng.range(-CELL_SIZE / 3, CELL_SIZE / 3);
      const wx = cx * CELL_SIZE + offsetX;
      const wz = cz * CELL_SIZE + offsetZ;
      const wy = getTerrainHeight(wx, wz);
      
      const trapType = rng.next() < 0.5 ? 'spikes' : 'vortex';
      const trapGroup = new THREE.Group();
      trapGroup.position.set(offsetX, wy, offsetZ);
      
      if (trapType === 'spikes') {
        this.buildGlowSpikes(trapGroup);
        trapGroup.userData = { type: 'trap_spikes', wx, wy, wz, active: true, radius: 2.8 };
      } else {
        this.buildSandVortex(trapGroup);
        trapGroup.userData = { type: 'trap_vortex', wx, wy, wz, active: true, radius: 3.8 };
      }
      
      cellGroup.add(trapGroup);
    }

    this.proceduralGroup.add(cellGroup);
    this.loadedCells.set(`${cx},${cz}`, cellGroup);
  }

  /**
   * Creates a beautiful glowing gold crystal
   */
  private createProceduralCrystalMesh(wy: number): THREE.Group {
    const group = new THREE.Group();
    
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffd54f, // Radiant solar gold
      emissive: 0xffa000,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.9,
    });
    
    const geom1 = new THREE.CylinderGeometry(0, 0.2, 0.6, 5);
    const m1 = new THREE.Mesh(geom1, mat);
    m1.position.y = 0.3;
    m1.castShadow = true;
    group.add(m1);
    
    const geom2 = new THREE.CylinderGeometry(0.2, 0, 0.6, 5);
    const m2 = new THREE.Mesh(geom2, mat);
    m2.position.y = -0.3;
    m2.castShadow = true;
    group.add(m2);

    if (this.graphicsQuality === 'high') {
      const pLight = new THREE.PointLight(0xffb300, 1.2, 4);
      pLight.position.set(0, 0, 0);
      group.add(pLight);
    }
    
    return group;
  }

  /**
   * Spikes obstacle: Black basalt columns surrounding glowing red crystals
   */
  private buildGlowSpikes(group: THREE.Group) {
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.9, flatShading: true });
    
    // Core lava red spikes
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: 0xd50000,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });
    
    const spikes = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.0, 5), glowMat);
    spikes.name = 'red_crystals';
    spikes.position.y = 1.0;
    spikes.castShadow = true;
    group.add(spikes);
    
    // Outer guard rocks
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const rock = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), baseMat);
      rock.position.set(Math.cos(angle) * 0.9, 0.6, Math.sin(angle) * 0.9);
      rock.rotation.set((Math.random() - 0.5)*0.5, angle, (Math.random()-0.5)*0.5);
      rock.castShadow = true;
      group.add(rock);
    }

    if (this.graphicsQuality === 'high') {
      const spikeLight = new THREE.PointLight(0xff1744, 1.8, 6);
      spikeLight.position.set(0, 1.2, 0);
      group.add(spikeLight);
    }
  }

  /**
   * Sand vortex hurdle: Overlapping copper ring elements that spin rapidly
   */
  private buildSandVortex(group: THREE.Group) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xc7a75c, // Sandy bronze
      roughness: 0.4,
      metalness: 0.8,
      flatShading: true,
    });
    
    for (let r = 0; r < 4; r++) {
      const sizeFactor = 1.0 + r * 0.45;
      const torus = new THREE.Mesh(new THREE.TorusGeometry(sizeFactor * 0.4, 0.08, 4, 8), mat);
      torus.position.y = 0.15 + r * 0.4;
      torus.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.2;
      group.add(torus);
    }
    
    // Central dusty core
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffb74d,
      transparent: true,
      opacity: 0.45,
    });
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 1.2, 1.8, 4, 1, true), coreMat);
    core.position.y = 0.9;
    group.add(core);
  }

  /**
   * Power Shrines which grant temporary/permanent superpowers
   */
  private buildPowerShrine(group: THREE.Group, type: "dash" | "glide") {
    // Altar stone foundation
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x4e4e4e, roughness: 0.85, flatShading: true });
    
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.5, 6), baseMat);
    base.position.y = 0.25;
    base.receiveShadow = true;
    base.castShadow = true;
    group.add(base);
    
    // Core floating element
    const coreColor = type === 'dash' ? 0xff3d00 : 0x00e5ff;
    const coreEmissive = type === 'dash' ? 0xff3d00 : 0x00b0ff;
    
    const coreMat = new THREE.MeshStandardMaterial({
      color: coreColor,
      emissive: coreEmissive,
      emissiveIntensity: 1.8,
      roughness: 0.1,
      metalness: 0.9,
    });
    
    const coreGeom = type === 'dash' ? new THREE.OctahedronGeometry(0.48, 0) : new THREE.DodecahedronGeometry(0.4, 0);
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.name = 'shrine_core';
    core.position.y = 2.4;
    core.castShadow = true;
    group.add(core);
    
    // 3 Arch columns surrounding it
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const arch = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.8, 0.3), baseMat);
      arch.position.set(Math.cos(angle) * 1.0, 0.9, Math.sin(angle) * 1.0);
      arch.rotation.y = -angle;
      arch.castShadow = true;
      group.add(arch);
    }

    if (this.graphicsQuality === 'high') {
      const powerLight = new THREE.PointLight(coreColor, 2.2, 8);
      powerLight.position.set(0, 2.5, 0);
      group.add(powerLight);
    }
  }

  /**
   * Physics intersection loops
   */
  private checkCollisions(player: any, elapsed: number, delta: number) {
    const playerPos = player.position;
    
    this.loadedCells.forEach((cellGroup, cellKey) => {
      // Create a list of children to iterate safely (in case we delete item)
      const items = [...cellGroup.children];
      
      items.forEach((obj) => {
        const type = obj.userData?.type;
        if (!type) return;
        
        // Calculate world coordinates
        const wx = cellGroup.position.x + obj.position.x;
        const wz = cellGroup.position.z + obj.position.z;
        const wy = obj.position.y;
        
        const dist = Math.sqrt(
          (playerPos.x - wx) * (playerPos.x - wx) +
          (playerPos.y - wy) * (playerPos.y - wy) +
          (playerPos.z - wz) * (playerPos.z - wz)
        );
        
        // 1. Crystal pickup and Magnetism
        if (type === 'crystal') {
          const hasMagnet = player.currentPower === 'magnet' || player.currentPower === 'all';
          if (hasMagnet && dist < 18.0) {
            // Pull crystal towards player position (mapped to local cell group coordinates)
            const targetX = playerPos.x - cellGroup.position.x;
            const targetY = playerPos.y + 0.6; // target player chest
            const targetZ = playerPos.z - cellGroup.position.z;

            obj.position.x += (targetX - obj.position.x) * 7.5 * delta;
            obj.position.y += (targetY - obj.position.y) * 7.5 * delta;
            obj.position.z += (targetZ - obj.position.z) * 7.5 * delta;

            const nwx = cellGroup.position.x + obj.position.x;
            const nwz = cellGroup.position.z + obj.position.z;
            const nwy = obj.position.y;
            const newDist = Math.sqrt(
              (playerPos.x - nwx) * (playerPos.x - nwx) +
              (playerPos.y - nwy) * (playerPos.y - nwy) +
              (playerPos.z - nwz) * (playerPos.z - nwz)
            );

            if (newDist < 2.2) {
              localStorage.setItem(obj.name, 'collected');
              cellGroup.remove(obj);
              if (player.collectCrystal) {
                player.collectCrystal();
              }
            }
          } else if (dist < 2.0) {
            // Trigger standard pickup
            localStorage.setItem(obj.name, 'collected');
            cellGroup.remove(obj);
            
            // Increment score & play chime
            if (player.collectCrystal) {
              player.collectCrystal();
            }
          }
        }
        
        // 2. Power Shrine interaction
        if (type === 'shrine') {
          if (dist < 2.4) {
            const power = obj.userData.power;
            
            // Flag collected
            if (player.grantPower) {
              player.grantPower(power);
            }
          }
        }
        
        // 3. Spike Traps hazard
        if (type === 'trap_spikes') {
          if (dist < obj.userData.radius && obj.userData.active) {
            // Flash red & kickback
            obj.userData.active = false;
            
            // Calculate kickback direction
            const kx = playerPos.x - wx;
            const kz = playerPos.z - wz;
            const len = Math.sqrt(kx*kx + kz*kz) || 1;
            
            const pushX = (kx / len) * 22;
            const pushZ = (kz / len) * 22;
            
            if (player.applyKickback) {
              player.applyKickback(pushX, 9.5, pushZ);
            }
            
            // Active cooldown resetting spike trigger after 2 seconds
            setTimeout(() => {
              obj.userData.active = true;
            }, 2000);
          }
        }
        
        // 4. Vortex gravity pull and launch
        if (type === 'trap_vortex') {
          if (dist < obj.userData.radius) {
            // Pull player towards vortex center continuously
            const pullSpeed = 6.0 * delta;
            player.position.x = playerPos.x + (wx - playerPos.x) * pullSpeed;
            player.position.z = playerPos.z + (wz - playerPos.z) * pullSpeed;
            
            // If very close to center, trigger huge spring sling launch!
            const horizDist = Math.sqrt(
              (playerPos.x - wx)*(playerPos.x - wx) +
              (playerPos.z - wz)*(playerPos.z - wz)
            );
            if (horizDist < 1.0) {
              if (player.applyVortexLaunch) {
                player.applyVortexLaunch(21.0);
              }
            }
          }
        }
      });
    });
  }

  public shutdown() {
    this.scene.remove(this.terrainMesh);
    this.terrainMesh.geometry.dispose();
    if (Array.isArray(this.terrainMesh.material)) {
      this.terrainMesh.material.forEach(m => m.dispose());
    } else {
      this.terrainMesh.material.dispose();
    }
    
    this.staticScenery.children.forEach((cell) => {
      cell.traverse((child) => {
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
    this.scene.remove(this.staticScenery);
    
    this.loadedCells.forEach((cellGroup) => {
      cellGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
        if (child instanceof THREE.PointLight) {
          child.dispose();
        }
      });
    });
    this.scene.remove(this.proceduralGroup);
    
    this.scene.remove(this.particleGroup);
    this.particleGroup.geometry.dispose();
    if (Array.isArray(this.particleGroup.material)) {
      this.particleGroup.material.forEach(m => m.dispose());
    } else {
      this.particleGroup.material.dispose();
    }
  }
}

function controlsToAngle(time: number): number {
  return 0.1; // Default wind drift baseline angle
}
