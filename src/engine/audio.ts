/**
 * Cozy Audio Engine for "El Mundo De Snoopy"
 * Procedural Web Audio API soundscape:
 * - Peaceful Vince Guaraldi-style lofi acoustic piano harmonies
 * - Natural ambient layers (birds, crickets, gentle breeze)
 * - Tactile sound effects (footsteps, piano notes, typewriter, page flip, doors)
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicIntervalId: any = null;
  private ambientIntervalId: any = null;
  private chordIndex: number = 0;
  private currentAmbientMode: 'morning' | 'afternoon' | 'sunset' | 'night' = 'morning';

  constructor() {
    const savedMute = localStorage.getItem('snoopy_muted');
    this.isMuted = savedMute === 'true';
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.isMuted ? 0 : 0.22;
        this.musicGain.connect(this.ctx.destination);

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.value = this.isMuted ? 0 : 0.12;
        this.ambientGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.isMuted ? 0 : 0.35;
        this.sfxGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('snoopy_muted', String(this.isMuted));

    if (this.musicGain && this.ambientGain && this.sfxGain) {
      this.musicGain.gain.value = this.isMuted ? 0 : 0.22;
      this.ambientGain.gain.value = this.isMuted ? 0 : 0.12;
      this.sfxGain.gain.value = this.isMuted ? 0 : 0.35;
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Play a soft piano note using layered sine and triangle waves with warm envelope
  private playPianoNote(freq: number, duration = 1.2, velocity = 0.5, timeOffset = 0) {
    if (!this.ctx || !this.musicGain) return;
    const startTime = this.ctx.currentTime + timeOffset;

    // Fundamental oscillator (warm body)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Harmonic overtone (piano bell ring)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    // Lowpass filter to simulate wooden piano body
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, startTime);
    filter.frequency.exponentialRampToValueAtTime(400, startTime + duration);

    // Envelope
    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(velocity * 0.4, startTime + 0.03);
    noteGain.gain.exponentialRampToValueAtTime(velocity * 0.15, startTime + 0.35);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.musicGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  // Cozy Guaraldi-style jazz progression (Fmaj7 -> Dm9 -> Gm7 -> C7b9)
  public startCozyMusic() {
    this.initCtx();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Frequencies in Hz for warm jazz piano chords
    // Fmaj7: F3 (174.61), A3 (220.00), C4 (261.63), E4 (329.63)
    // Dm9: D3 (146.83), F3 (174.61), A3 (220.00), C4 (261.63), E4 (329.63)
    // Gm7: G3 (196.00), Bb3 (233.08), D4 (293.66), F4 (349.23)
    // C7: C3 (130.81), E3 (164.81), G3 (196.00), Bb3 (233.08), D4 (293.66)
    const progressions = [
      { bass: 174.61, chord: [220.00, 261.63, 329.63, 440.00], melody: [523.25, 493.88, 440.00] },
      { bass: 146.83, chord: [174.61, 220.00, 261.63, 329.63], melody: [392.00, 440.00, 349.23] },
      { bass: 196.00, chord: [233.08, 293.66, 349.23, 440.00], melody: [440.00, 392.00, 349.23] },
      { bass: 130.81, chord: [164.81, 196.00, 233.08, 293.66], melody: [329.63, 349.23, 392.00] },
    ];

    const stepDuration = 3.6;

    const playBar = () => {
      if (!this.isMusicPlaying) return;
      const prog = progressions[this.chordIndex % progressions.length];
      this.chordIndex++;

      // Bass note
      this.playPianoNote(prog.bass, 2.5, 0.45, 0);

      // Light arpeggiated piano chord
      prog.chord.forEach((freq, idx) => {
        this.playPianoNote(freq, 2.2, 0.35, 0.1 + idx * 0.08);
      });

      // Little delicate melodic note later in measure
      if (Math.random() > 0.3) {
        const melNote = prog.melody[Math.floor(Math.random() * prog.melody.length)];
        this.playPianoNote(melNote, 1.8, 0.4, 1.4);
      }
    };

    playBar();
    this.musicIntervalId = setInterval(playBar, stepDuration * 1000);
    this.startAmbient();
  }

  public setTimeOfDay(time: 'morning' | 'afternoon' | 'sunset' | 'night') {
    this.currentAmbientMode = time;
  }

  // Ambient soundscape (birds in morning, crickets at night, gentle breeze)
  private startAmbient() {
    if (this.ambientIntervalId) clearInterval(this.ambientIntervalId);

    const playAmbientSound = () => {
      if (!this.ctx || !this.ambientGain || this.isMuted) return;

      if (this.currentAmbientMode === 'night') {
        // Soft cricket chirp
        this.playCricket();
      } else if (this.currentAmbientMode === 'morning' || this.currentAmbientMode === 'afternoon') {
        // Delicate bird tweet
        if (Math.random() > 0.4) {
          this.playBirdTweet();
        }
      }
    };

    this.ambientIntervalId = setInterval(playAmbientSound, 2800);
  }

  private playBirdTweet() {
    if (!this.ctx || !this.ambientGain) return;
    const now = this.ctx.currentTime;
    const baseFreq = 2200 + Math.random() * 400;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + 200, now + 0.16);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ambientGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  private playCricket() {
    if (!this.ctx || !this.ambientGain) return;
    const now = this.ctx.currentTime;
    const freq = 4500 + Math.random() * 200;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.07);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.12);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ambientGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Schroeder toy piano performance (plays a charming phrase of Fur Elise!)
  public playSchroederPiano() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    // Beethoven Für Elise motif: E5 -> D#5 -> E5 -> D#5 -> E5 -> B4 -> D5 -> C5 -> A4
    const notes = [
      { f: 659.25, d: 0.2 },
      { f: 622.25, d: 0.2 },
      { f: 659.25, d: 0.2 },
      { f: 622.25, d: 0.2 },
      { f: 659.25, d: 0.2 },
      { f: 493.88, d: 0.25 },
      { f: 587.33, d: 0.25 },
      { f: 523.25, d: 0.25 },
      { f: 440.00, d: 0.6 },
    ];

    let offset = 0;
    notes.forEach((n) => {
      this.playPianoNote(n.f, n.d * 1.5, 0.7, offset);
      offset += n.d;
    });
  }

  // Typewriter key click (for notebook & letter writing)
  public playTypewriterKey() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(700 + Math.random() * 200, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Typewriter carriage return / bell ding
  public playTypewriterDing() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now); // High bell A6

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.8);
  }

  // Soft page flip sound
  public playPageFlip() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  // Soft footstep sound (muffled on grass or wood, or splash in puddle)
  public playFootstep(isWood = false, isInPuddle = false) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    if (isInPuddle) {
      // Gentle puddle splash sound
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.06, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.1);
      return;
    }

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isWood ? 160 : 110, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.06);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Weather Ambient: Soft gentle rain drop
  public playRainDrop() {
    this.initCtx();
    if (!this.ctx || !this.ambientGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ambientGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Weather Ambient: Soft wind whistle
  public playWindBreeze() {
    this.initCtx();
    if (!this.ctx || !this.ambientGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220 + Math.random() * 80, now);
    osc.frequency.linearRampToValueAtTime(320 + Math.random() * 60, now + 0.8);
    osc.frequency.linearRampToValueAtTime(180, now + 1.6);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.03, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);
    osc.start(now);
    osc.stop(now + 1.8);
  }

  // Door open/enter chime
  public playDoorChime() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.playPianoNote(523.25, 0.4, 0.4, 0); // C5
    this.playPianoNote(659.25, 0.6, 0.4, 0.12); // E5
  }

  // Dialog letter blip
  public playDialogBlip(pitch = 440) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Button interaction sound (A or B)
  public playButton(isPrimary = true) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isPrimary ? 587.33 : 440, now); // D5 or A4

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }
}

export const audio = new SoundEngine();
