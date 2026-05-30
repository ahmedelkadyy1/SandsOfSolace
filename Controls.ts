/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface GameSettings {
  graphics: 'low' | 'medium' | 'high';
  soundEnabled: boolean;
  mouseSensitivity: number;
  timeOfDay: 'day' | 'sunset' | 'night';
  bloomIntensity: number; // 0 to 2, with e.g. 1.0 being standard
}

export interface ControlKeys {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean; // For jumping / floating upwards in creative feel
  down: boolean;
  dash?: boolean; // For Solar Dash
}

export type InteractableType = 'shard' | 'beacon' | 'monolith' | 'flower' | 'portal';

export interface InteractableObject {
  id: string;
  type: InteractableType;
  position: THREE.Vector3;
  mesh: THREE.Object3D;
  isCompleted: boolean;
  name: string;
  description: string;
  interactionRange: number;
  onInteract: () => void;
  pulseSpeed?: number;
}

export interface GameProgress {
  collectedShards: string[];
  activatedBeacons: string[];
  lastSaved: string;
  totalInteracted: number;
  auraCrystals?: number; // Procedural gold crystal count
  activePower?: 'none' | 'dash' | 'glide' | 'both' | 'magnet' | 'all'; // Unlocked superpowers
  dashFuel?: number; // Cooldown indicator 0-100
}
