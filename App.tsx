/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ControlKeys } from '../types';

export class Controls {
  public keys: ControlKeys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  };

  public mouseSensitivity = 0.002;
  
  // Camera angles
  public pitch = -0.1; // Vertical angle (up/down)
  public yaw = 0;      // Horizontal angle (left/right)
  
  // Custom drag inputs (ensuring iframe-friendly controls)
  private isPointerLocked = false;
  private isDragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  
  // Virtual Joystick variables (for touch support)
  public joystickActive = false;
  public joystickDX = 0;
  public joystickDY = 0;
  
  private domElement: HTMLElement;

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;
    this.setupKeyboard();
    this.setupPointer();
    this.setupTouch();
  }

  private setupKeyboard() {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'Space':
          this.keys.up = true;
          break;
        case 'KeyShiftLeft':
        case 'KeyShiftRight':
          this.keys.dash = true;
          this.keys.down = true;
          break;
        case 'KeyC':
          this.keys.down = true;
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'Space':
          this.keys.up = false;
          break;
        case 'KeyShiftLeft':
        case 'KeyShiftRight':
          this.keys.dash = false;
          this.keys.down = false;
          break;
        case 'KeyC':
          this.keys.down = false;
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  }

  private setupPointer() {
    // Attempt pointer lock (optional, immersive)
    const requestPointerLock = () => {
      if (document.pointerLockElement === this.domElement) return;
      this.domElement.requestPointerLock?.();
    };

    // Listen to lock changes
    const onLockChange = () => {
      this.isPointerLocked = document.pointerLockElement === this.domElement;
    };

    document.addEventListener('pointerlockchange', onLockChange);

    // Mouse Move listener supporting BOTH Locked pointer and Click-and-Drag
    const onPointerMove = (e: PointerEvent) => {
      if (this.isPointerLocked) {
        // Mode 1: True Pointer Lock
        this.yaw -= e.movementX * this.mouseSensitivity;
        this.pitch += e.movementY * this.mouseSensitivity;
      } else if (this.isDragging) {
        // Mode 2: Standard Drag-to-Lock (iframe safety fallback)
        const dx = e.clientX - this.lastPointerX;
        const dy = e.clientY - this.lastPointerY;
        
        this.yaw -= dx * this.mouseSensitivity;
        this.pitch += dy * this.mouseSensitivity;
        
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
      }
      
      // Clap vertical angles to avoid flipping upside down
      this.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.pitch));
    };

    const onPointerDown = (e: PointerEvent) => {
      // Don't register if clicked on UI buttons
      if ((e.target as HTMLElement).closest('.game-ui-overlay')) return;

      this.isDragging = true;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      
      // Auto attempt pointer lock
      requestPointerLock();
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    this.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  private setupTouch() {
    // Standard Touch-drag look (right half of screen, or outside joystick)
    let touchId: number | null = null;
    let startX = 0;
    let startY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.game-ui-overlay')) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        
        // Touch on right half of screen activates look controls
        if (touch.clientX > window.innerWidth / 2.5) {
          if (touchId === null) {
            touchId = touch.identifier;
            startX = touch.clientX;
            startY = touch.clientY;
          }
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchId === null) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          const dx = touch.clientX - startX;
          const dy = touch.clientY - startY;

          // Soften touch-look sensitivity
          this.yaw -= dx * this.mouseSensitivity * 1.5;
          this.pitch += dy * this.mouseSensitivity * 1.5;
          this.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.pitch));

          startX = touch.clientX;
          startY = touch.clientY;
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          touchId = null;
        }
      }
    };

    this.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    this.domElement.addEventListener('touchmove', onTouchMove, { passive: true });
    this.domElement.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  /**
   * Directly sets joystick values (called from React UI component)
   */
  public updateJoystick(dx: number, dy: number, active: boolean) {
    this.joystickActive = active;
    this.joystickDX = dx;
    this.joystickDY = dy;

    // Map virtual joystick values directly to movement keys
    if (active) {
      this.keys.forward = dy < -0.2;
      this.keys.backward = dy > 0.2;
      this.keys.left = dx < -0.2;
      this.keys.right = dx > 0.2;
    } else {
      this.keys.forward = false;
      this.keys.backward = false;
      this.keys.left = false;
      this.keys.right = false;
    }
  }

  public dispose() {
    // Add any necessary event cleanup if hot-rebooting the engine is requested
  }
}
