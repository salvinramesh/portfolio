export class SoundManager {
    private static ctx: AudioContext | null = null;
    private static masterGain: GainNode | null = null;
    private static enabled: boolean = true;

    private static init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.15; // Default volume
            this.masterGain.connect(this.ctx.destination);
        }
    }

    static toggle(enabled: boolean) {
        this.enabled = enabled;
    }

    static playHover() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        // High pitched "blip"
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    static playClick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        // Lower pitched "lock" sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    static playSuccess() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const now = this.ctx.currentTime;

        // Arpeggio
        [440, 554, 659].forEach((freq, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain!);

            osc.type = 'triangle';
            osc.frequency.value = freq;

            const startTime = now + i * 0.05;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }
    private static ambientOsc: OscillatorNode | null = null;
    private static ambientGain: GainNode | null = null;
    private static lfo: OscillatorNode | null = null;

    static playAmbient(theme: string) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        // Stop existing ambient
        this.stopAmbient();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        // LFO config
        lfo.frequency.value = 0.1; // Slow modulation
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);

        osc.connect(gain);
        gain.connect(this.masterGain);

        // Base settings
        gain.gain.value = 0.05; // Very quiet

        switch (theme) {
            case 'matrix':
                osc.type = 'square';
                osc.frequency.value = 50; // Low hum
                lfo.type = 'sawtooth';
                break;
            case 'sunset':
                osc.type = 'triangle';
                osc.frequency.value = 60;
                lfo.type = 'sine';
                break;
            default: // cyber
                osc.type = 'sine';
                osc.frequency.value = 40; // Deep sub
                lfo.type = 'sine';
                break;
        }

        osc.start();
        lfo.start();

        this.ambientOsc = osc;
        this.ambientGain = gain;
        this.lfo = lfo;
    }

    static stopAmbient() {
        if (this.ambientOsc) {
            this.ambientOsc.stop();
            this.ambientOsc.disconnect();
            this.ambientOsc = null;
        }
        if (this.ambientGain) {
            this.ambientGain.disconnect();
            this.ambientGain = null;
        }
        if (this.lfo) {
            this.lfo.stop();
            this.lfo.disconnect();
            this.lfo = null;
        }
    }

    static setAmbientFrequency(freq: number) {
        if (!this.enabled || !this.ctx || !this.ambientOsc) return;
        // Smoothly ramp to the new frequency to avoid popping
        this.ambientOsc.frequency.linearRampToValueAtTime(freq, this.ctx.currentTime + 0.1);
    }
}
