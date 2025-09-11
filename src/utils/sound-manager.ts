class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playTapeMove() {
    this.createTone(800, 0.1, 'square');
  }

  playTapeWrite() {
    this.createTone(1200, 0.15, 'sine');
  }

  playStateChange() {
    this.createTone(400, 0.2, 'triangle');
  }

  playAccept() {
    // Happy ascending sequence
    setTimeout(() => this.createTone(523, 0.15), 0);   // C
    setTimeout(() => this.createTone(659, 0.15), 100); // E
    setTimeout(() => this.createTone(784, 0.3), 200);  // G
  }

  playReject() {
    // Sad descending sequence
    setTimeout(() => this.createTone(400, 0.2), 0);
    setTimeout(() => this.createTone(300, 0.3), 150);
  }

  playStart() {
    this.createTone(660, 0.1, 'square');
  }

  playPause() {
    this.createTone(440, 0.1, 'square');
  }

  playReset() {
    this.createTone(220, 0.2, 'sawtooth');
  }
}

export const soundManager = new SoundManager();