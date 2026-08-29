// Real Web Audio Synthesizers for Ambient Sounds (Rain, White Noise, Cafe, Forest, Cosmic Drone)

export type AmbientSoundType = 'none' | 'rain' | 'whitenoise' | 'cafe' | 'forest' | 'cosmic';

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType = 'none';
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private volume: number = 0.5;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  getCurrentSound(): AmbientSoundType {
    return this.currentType;
  }

  stop() {
    if (this.currentType === 'none') return;
    try {
      this.activeNodes.forEach(node => {
        if (typeof node === 'number') {
          clearInterval(node);
        } else if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          try {
            (node as AudioScheduledSourceNode).stop();
          } catch {}
        } else if ('disconnect' in node) {
          try {
            node.disconnect();
          } catch {}
        }
      });
    } catch {}
    this.activeNodes = [];
    this.currentType = 'none';
  }

  play(type: AmbientSoundType) {
    this.stop();
    if (type === 'none') return;

    this.initCtx();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.currentType = type;

    if (type === 'rain') {
      this.createRainSound();
    } else if (type === 'whitenoise') {
      this.createWhiteNoise();
    } else if (type === 'cafe') {
      this.createCafeAmbience();
    } else if (type === 'forest') {
      this.createForestBreeze();
    } else if (type === 'cosmic') {
      this.createCosmicDrone();
    }
  }

  private createNoiseBuffer(durationSeconds: number = 5): AudioBuffer {
    if (!this.ctx) throw new Error("No audio context");
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private createRainSound() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(5);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter to simulate rain (lowpass filter with resonance)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, filter, rainGain);
  }

  private createWhiteNoise() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(5);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    noiseSource.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, noiseGain);
  }

  private createCafeAmbience() {
    if (!this.ctx || !this.masterGain) return;
    // Brown noise simulation with bandpass for warm room chatter resonance
    const noiseBuffer = this.createNoiseBuffer(6);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter1.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const cafeGain = this.ctx.createGain();
    cafeGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    noiseSource.connect(filter1);
    filter1.connect(cafeGain);
    cafeGain.connect(this.masterGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, filter1, cafeGain);
  }

  private createForestBreeze() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(8);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, filter, gain);
  }

  private createCosmicDrone() {
    if (!this.ctx || !this.masterGain) return;
    // Multi-oscillator binaural drone chord (110Hz A2, 164.81Hz E3, 220Hz A3)
    const freqs = [110, 164.81, 220, 329.63];
    freqs.forEach(f => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.activeNodes.push(osc, gain);
    });
  }
}

export const ambientSound = new AmbientSoundEngine();
