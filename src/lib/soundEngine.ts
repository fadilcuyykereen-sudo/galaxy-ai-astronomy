"use client";

class TechSoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private ambientEnabled = false;
  private ambientNodes: {
    oscs: OscillatorNode[];
    gain: GainNode;
    filter: BiquadFilterNode;
  } | null = null;
  private lastHoverAt = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val && this.ambientEnabled) {
      this.stopAmbient();
    } else if (val && this.ambientEnabled) {
      this.startAmbient();
    }
    if (val) {
      this.playClick();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setAmbient(val: boolean) {
    this.ambientEnabled = val;
    if (val && this.enabled) {
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
  }

  public isAmbient(): boolean {
    return this.ambientEnabled;
  }

  // Subtle futuristic micro-tick on hover
  public playHover() {
    if (!this.enabled) return;
    const nowMs = Date.now();
    if (nowMs - this.lastHoverAt < 65) return;
    this.lastHoverAt = nowMs;

    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== "running") return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1950, t);
    osc.frequency.exponentialRampToValueAtTime(2650, t + 0.028);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.018, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.032);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.035);
  }

  // Crisp precision sci-fi UI click
  public playClick() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, t);
    osc1.frequency.exponentialRampToValueAtTime(440, t + 0.065);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1760, t);
    osc2.frequency.exponentialRampToValueAtTime(1320, t + 0.045);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.055, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.08);
    osc2.stop(t + 0.055);
  }

  // Holographic navigation switch
  public playTabSwitch() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const notes = [523.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 2 ? "triangle" : "sine";
      const start = t + idx * 0.032;
      osc.frequency.setValueAtTime(freq * 0.92, start);
      osc.frequency.exponentialRampToValueAtTime(freq, start + 0.06);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.042 - idx * 0.008, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.19);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.21);
    });
  }

  // Telemetry data uplink (send message)
  public playSend() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, t);
    osc.frequency.setValueAtTime(880, t + 0.045);
    osc.frequency.exponentialRampToValueAtTime(1318.5, t + 0.12);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.055, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  // Ethereal AI response received harmonic
  public playReceive() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const chord = [659.25, 987.77, 1174.66];
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const start = t + i * 0.045;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.036, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.34);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  }

  // Quantum image synthesizer charge-up
  public playGenerateStart() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.55);

    lfo.type = "sine";
    lfo.frequency.setValueAtTime(18, t);
    lfoGain.gain.setValueAtTime(28, t);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(420, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + 0.55);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.045, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.62);
    lfo.stop(t + 0.62);
  }

  // Starlight crystalline completion chime
  public playGenerateComplete() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const arp = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    arp.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const start = t + i * 0.055;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.045, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.48);
    });
  }

  // Deep observatory sonar lock when clicking a 3D planet
  public playPlanetSelect() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const sub = ctx.createOscillator();
    const ping = ctx.createOscillator();
    const subGain = ctx.createGain();
    const pingGain = ctx.createGain();

    sub.type = "sine";
    sub.frequency.setValueAtTime(196, t);
    sub.frequency.exponentialRampToValueAtTime(98, t + 0.22);
    subGain.gain.setValueAtTime(0.0001, t);
    subGain.gain.linearRampToValueAtTime(0.065, t + 0.01);
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);

    ping.type = "sine";
    ping.frequency.setValueAtTime(1174.66, t + 0.02);
    ping.frequency.exponentialRampToValueAtTime(1567.98, t + 0.14);
    pingGain.gain.setValueAtTime(0.0001, t + 0.02);
    pingGain.gain.linearRampToValueAtTime(0.042, t + 0.03);
    pingGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

    sub.connect(subGain);
    ping.connect(pingGain);
    subGain.connect(ctx.destination);
    pingGain.connect(ctx.destination);

    sub.start(t);
    ping.start(t + 0.02);
    sub.stop(t + 0.26);
    ping.stop(t + 0.34);
  }

  // Resonant cosmic harmonic swell when switching 3D galaxies
  public playGalaxySelect() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const freqs = [220, 329.63, 493.88, 659.25];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(f * 0.98, t);
      osc.frequency.exponentialRampToValueAtTime(f, t + 0.25);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.032, t + 0.06 + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.58);
    });
  }

  // Speed slider precision tick
  public playSpeedTick(speedRatio = 0.5) {
    if (!this.enabled) return;
    const nowMs = Date.now();
    if (nowMs - this.lastHoverAt < 50) return;
    this.lastHoverAt = nowMs;

    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const base = 520 + Math.min(1, Math.max(0, speedRatio)) * 1100;
    osc.frequency.setValueAtTime(base, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.026, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // Mission success fanfare
  public playMissionSuccess() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    [587.33, 880, 1174.66, 1760].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const s = t + i * 0.065;
      osc.frequency.setValueAtTime(f, s);
      gain.gain.setValueAtTime(0.0001, s);
      gain.gain.linearRampToValueAtTime(0.055, s + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, s + 0.42);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(s);
      osc.stop(s + 0.45);
    });
  }

  // Soft low pulse for incorrect mission target
  public playMissionWrong() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(480, t);
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(155, t + 0.22);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.045, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.27);
  }

  // Optional gentle deep-space observatory pad
  private startAmbient() {
    const ctx = this.ensureContext();
    if (!ctx || this.ambientNodes) return;

    const t = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(280, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.022, t + 1.2);

    const freqs = [65.41, 98.0, 130.81, 196.4];
    const oscs = freqs.map((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(f, t);
      osc.connect(filter);
      osc.start(t);
      return osc;
    });

    filter.connect(gain);
    gain.connect(ctx.destination);
    this.ambientNodes = { oscs, gain, filter };
  }

  private stopAmbient() {
    if (!this.ambientNodes || !this.ctx) return;
    const { oscs, gain } = this.ambientNodes;
    const t = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    setTimeout(() => {
      oscs.forEach((o) => {
        try {
          o.stop();
          o.disconnect();
        } catch {}
      });
    }, 500);
    this.ambientNodes = null;
  }
}

export const soundEngine = new TechSoundEngine();
