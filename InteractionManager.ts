/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GameSettings } from '../types';

export class Engine {
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  public clock!: THREE.Clock;
  
  // Post-processing stack
  private composer!: EffectComposer;
  private bloomPass!: UnrealBloomPass;
  private bloomIntensity: number = 1.0;
  
  // Lights
  private ambientLight!: THREE.AmbientLight;
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  
  // Container & Resize
  private container: HTMLDivElement;
  private resizeObserver: ResizeObserver | null = null;
  
  // Animation Loop handlers
  private updateCallbacks: Array<(delta: number, elapsed: number) => void> = [];
  private animationFrameId: number | null = null;
  
  constructor(container: HTMLDivElement) {
    this.container = container;
    this.init();
  }

  private init() {
    this.clock = new THREE.Clock();
    
    // Scene
    this.scene = new THREE.Scene();
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    // Append to DOM
    this.container.appendChild(this.renderer.domElement);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    // Initial camera position. Will be overridden by player system
    this.camera.position.set(0, 5, 10);
    
    // Lighting Setup
    this.setupLighting();
    
    // Default Time of Day
    this.setTimeOfDay('day');
    
    // Responsive Resize Handlers
    this.setupResize();
    
    // Setup Postprocessing
    this.initPostProcessing();
    
    // Start loop
    this.startLoop();
  }

  private initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
      this.bloomIntensity,
      0.4,
      0.85
    );
    this.composer.addPass(this.bloomPass);
  }

  public setBloomIntensity(intensity: number) {
    this.bloomIntensity = intensity;
    if (this.bloomPass) {
      this.bloomPass.strength = intensity;
    }
  }

  private setupLighting() {
    // Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);
    
    // Hemisphere Light (Sky & Ground colors)
    this.hemiLight = new THREE.HemisphereLight(0xbadcf5, 0xbfb69e, 0.5);
    this.scene.add(this.hemiLight);
    
    // Directional (Sun/Moon) Light
    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.dirLight.position.set(30, 40, 20);
    this.dirLight.castShadow = true;
    
    // Configure shadow settings for stylized soft shadows
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 150;
    
    const d = 50;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    
    this.scene.add(this.dirLight);
  }

  public setTimeOfDay(time: 'day' | 'sunset' | 'night') {
    let fogColor: THREE.Color;
    let hemiSky: THREE.Color;
    let hemiGround: THREE.Color;
    let dirColor: THREE.Color;
    let dirIntensity: number;
    let ambientIntensity: number;
    let dirPosition: THREE.Vector3;

    switch (time) {
      case 'sunset':
        // Warm/Golden/Orange hour
        fogColor = new THREE.Color(0xf6af81); // Warm sand peach
        hemiSky = new THREE.Color(0xd27575);  // Dusky coral sky
        hemiGround = new THREE.Color(0x50404d); // Muted dark purple clay
        dirColor = new THREE.Color(0xfcbd7c);  // Golden orange Sun
        dirIntensity = 1.3;
        ambientIntensity = 0.45;
        dirPosition = new THREE.Vector3(-45, 12, -20);
        break;
        
      case 'night':
        // Mystic deep blue / starry vibe
        fogColor = new THREE.Color(0x0e111a); // Darkest cosmic blue
        hemiSky = new THREE.Color(0x1a2135);  // Star field blue
        hemiGround = new THREE.Color(0x05070d); // Black basalt
        dirColor = new THREE.Color(0x8ea2d5);  // Soft cold blue moonlight
        dirIntensity = 0.45;
        ambientIntensity = 0.2;
        dirPosition = new THREE.Vector3(15, 35, 10);
        break;
        
      case 'day':
      default:
        // Stylized warm beige desert day
        fogColor = new THREE.Color(0xf5ebe0); // Cozy sand beige
        hemiSky = new THREE.Color(0xd0e6f2);  // Gentle morning blue
        hemiGround = new THREE.Color(0xe0d4be); // Warm sand
        dirColor = new THREE.Color(0xfffdf0);  // Bright warm white
        dirIntensity = 1.4;
        ambientIntensity = 0.5;
        dirPosition = new THREE.Vector3(30, 45, 20);
        break;
    }

    // Apply colors softly (without abrupt snap)
    this.scene.background = fogColor;
    
    // Stylized exponential fog
    this.scene.fog = new THREE.FogExp2(fogColor, 0.015);
    
    this.hemiLight.color.copy(hemiSky);
    this.hemiLight.groundColor.copy(hemiGround);
    this.ambientLight.intensity = ambientIntensity;
    
    this.dirLight.color.copy(dirColor);
    this.dirLight.intensity = dirIntensity;
    this.dirLight.position.copy(dirPosition);
    this.dirLight.updateMatrixWorld();
  }

  public setGraphicsQuality(quality: 'low' | 'medium' | 'high') {
    switch (quality) {
      case 'low':
        this.renderer.shadowMap.enabled = false;
        this.renderer.setPixelRatio(1);
        this.dirLight.castShadow = false;
        break;
      case 'medium':
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        this.renderer.setPixelRatio(1.2);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.set(512, 512);
        break;
      case 'high':
      default:
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.set(1024, 1024);
        break;
    }
    this.dirLight.shadow.map?.dispose();
    // Re-initialise shadow variables
    this.dirLight.shadow.map = null;
  }

  private setupResize() {
    this.resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      this.onResize(width, height);
    });
    
    this.resizeObserver.observe(this.container);
  }

  private onResize(width: number, height: number) {
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  public addUpdateCallback(callback: (delta: number, elapsed: number) => void) {
    this.updateCallbacks.push(callback);
  }

  public removeUpdateCallback(callback: (delta: number, elapsed: number) => void) {
    this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
  }

  private startLoop() {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      
      const delta = Math.min(this.clock.getDelta(), 0.1); // Cap delta to avoid wild jumps on lag
      const elapsed = this.clock.getElapsedTime();
      
      // Execute registered entity updates
      for (let i = 0; i < this.updateCallbacks.length; i++) {
        this.updateCallbacks[i](delta, elapsed);
      }
      
      if (this.bloomIntensity > 0 && this.composer) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    };
    
    animate();
  }

  public shutdown() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Clear canvas from DOM
    if (this.container && this.renderer.domElement) {
      if (this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
    
    // Dispose resources carefully to prevent memory leaks in dev environment
    this.scene.clear();
    this.renderer.dispose();
    this.dirLight.shadow.map?.dispose();
  }
}
