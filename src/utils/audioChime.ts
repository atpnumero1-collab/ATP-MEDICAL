/**
 * Web Audio API synthesizer for the ATP Medical patient calling chime (hospital bell)
 */
class HospitalChimePlayer {
  private audioCtx: AudioContext | null = null;

  private init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playCallingChime() {
    try {
      this.init();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // Note 1: High crisp ding (e.g., F5 - 698.46 Hz)
      this.playTone(698.46, now, 0.7);

      // Note 2: Harmonic resolving tone (e.g., C5 - 523.25 Hz or A4 - 440 Hz)
      this.playTone(523.25, now + 0.35, 1.2);
    } catch {
      // Audio playback suppressed by browser policy or unavailable
    }
  }

  private playTone(frequency: number, startTime: number, duration: number) {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);

    // Envelope
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const chimePlayer = new HospitalChimePlayer();
