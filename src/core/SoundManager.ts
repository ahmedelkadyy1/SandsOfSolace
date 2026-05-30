/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class SoundManager {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private isEnabled: boolean = false;
  private chimeTimeout: any = null;

  private pentatonicScale = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C Major Pentatonic

  constructor() {
    // Lazy initialisation due to user interaction browser policies
  }

  public init() {
    if (this.audioCtx) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      this.setupDrone();
      this.startChimes();
    } catch (e) {
      console.warn("Web Audio API not supported on this browser:", e);
    }
  }

  private setupDrone() {
    if (!this.audioCtx || !this.masterGain) return;

    const ctx = this.audioCtx;

    // Filter to make it warm and soft
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(180, ctx.currentTime);
    this.filter.Q.setValueAtTime(1.5, ctx.currentTime);
    this.filter.connect(this.masterGain);

    // Oscillator 1 (Warm Triangle)
    this.droneOsc1 = ctx.createOscillator();
    this.droneOsc1.type = 'triangle';
    this.droneOsc1.frequency.setValueAtTime(65.41, ctx.currentTime); // C2
    const osc1Gain = ctx.createGain();
    osc1Gain.gain.setValueAtTime(0.12, ctx.currentTime);
    this.droneOsc1.connect(osc1Gain);
    osc1Gain.connect(this.filter);

    // Oscillator 2 (Slightly detuned Oscillator for rich chorusing)
    this.droneOsc2 = ctx.createOscillator();
    this.droneOsc2.type = 'sawtooth';
    this.droneOsc2.frequency.setValueAtTime(65.71, ctx.currentTime); // Slightly detuned
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.04, ctx.currentTime);
    this.droneOsc2.connect(osc2Gain);
    osc2Gain.connect(this.filter);

    // LFO to sweep filter frequency for a "breathing" effect
    this.lfo = ctx.createOscillator();
    this.lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 12 seconds per sweep
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(80, ctx.currentTime); // Sweep between 100Hz and 260Hz
    this.lfo.connect(lfoGain);
    if (this.filter.frequency) {
      lfoGain.connect(this.filter.frequency);
    }

    // Start everything
    this.droneOsc1.start();
    this.droneOsc2.start();
    this.lfo.start();
  }

  private startChimes() {
    const playChime = () => {
      if (!this.isEnabled) return;
      
      this.triggerChime();
      
      // Schedule next chime randomly between 6 and 14 seconds
      const nextTime = 6000 + Math.random() * 8000;
      this.chimeTimeout = setTimeout(playChime, nextTime);
    };

    // First chime after 4 seconds
    this.chimeTimeout = setTimeout(playChime, 4000);
  }

  public triggerChime(scaleIndex?: number) {
    if (!this.audioCtx || !this.masterGain || !this.isEnabled) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Pick a high note from the pentatonic scale
    const noteFreq = scaleIndex !== undefined
      ? this.pentatonicScale[scaleIndex % this.pentatonicScale.length]
      : this.pentatonicScale[Math.floor(this.pentatonicScale.length / 2) + Math.floor(Math.random() * (this.pentatonicScale.length / 2))];

    // Combine Sine and Triangle for a soft wooden bell sound
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(noteFreq, now);

    const subOsc = ctx.createOscillator();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(noteFreq * 1.5, now); // Fifth harmonic

    // Warm volume envelop (instant attack, long exponential decay)
    const chimeGain = ctx.createGain();
    chimeGain.gain.setValueAtTime(0, now);
    chimeGain.gain.linearRampToValueAtTime(0.08, now + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

    // Connect delay or reverb simulation using basic nodes
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.35, now);
    const delayGain = ctx.createGain();
    delayGain.gain.setValueAtTime(0.3, now);

    // Setup network connections
    osc.connect(chimeGain);
    subOsc.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    // Feedback Delay Loop
    chimeGain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(delay); // Feedback
    delayGain.connect(this.masterGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 5);
    subOsc.stop(now + 5);
  }

  public triggerInteractionSound() {
    if (!this.audioCtx || !this.masterGain || !this.isEnabled) return;

    // Quick celebratory ascending chime chord
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const notes = [this.pentatonicScale[4], this.pentatonicScale[6], this.pentatonicScale[8], this.pentatonicScale[10]];
    
    notes.forEach((freq, idx) => {
      const timeOffset = idx * 0.12;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + timeOffset);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now + timeOffset);
      gainNode.gain.linearRampToValueAtTime(0.12, now + timeOffset + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + 1.2);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain!);
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 1.3);
    });
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    
    if (enabled) {
      this.init();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      
      if (this.masterGain && this.audioCtx) {
        this.masterGain.gain.linearRampToValueAtTime(1.0, this.audioCtx.currentTime + 1.5);
      }
      
      // Core loop chimes triggers
      if (!this.chimeTimeout) {
        this.startChimes();
      }
    } else {
      if (this.masterGain && this.audioCtx) {
        this.masterGain.gain.linearRampToValueAtTime(0.0, this.audioCtx.currentTime + 0.5);
      }
    }
  }

  public shutdown() {
    if (this.chimeTimeout) {
      clearTimeout(this.chimeTimeout);
      this.chimeTimeout = null;
    }
    
    if (this.droneOsc1) {
      try { this.droneOsc1.stop(); } catch(e){}
    }
    if (this.droneOsc2) {
      try { this.droneOsc2.stop(); } catch(e){}
    }
    if (this.lfo) {
      try { this.lfo.stop(); } catch(e){}
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }

  private lastFootstepTime = 0;
  public playFootstepSand() {
    if (!this.audioCtx || !this.masterGain || !this.isEnabled) return;
    const now = this.audioCtx.currentTime;
    if (now - this.lastFootstepTime < 0.28) return; // limit footstep frequency
    this.lastFootstepTime = now;

    try {
      const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.15); // 0.15 seconds of sound
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const decay = 1 - (i / bufferSize);
        data[i] = (Math.random() * 2 - 1) * 0.03 * decay;
      }

      const noiseNode = this.audioCtx.createBufferSource();
      noiseNode.buffer = buffer;

      const bandpass = this.audioCtx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(850, now);
      bandpass.Q.setValueAtTime(1.8, now);

      const gainNode = this.audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.25, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noiseNode.connect(bandpass);
      bandpass.connect(gainNode);
      if (this.masterGain) {
        gainNode.connect(this.masterGain);
      }

      noiseNode.start(now);
    } catch (e) {
      console.warn("Footstep sound generation failed", e);
    }
  }
}

export const soundManager = new SoundManager();
