/**
 * Mélodie de secours (gamme hijaz) générée par le navigateur, quand le client
 * n'a pas encore choisi de MP3. Chargée seulement après le geste « Ouvrir ».
 */
const SCALE = [293.66, 311.13, 369.99, 392, 440, 466.16, 523.25, 587.33];
const PHRASE = [0, 2, 3, 4, 3, 2, 1, 0, 4, 5, 6, 5, 4, 3, 2, 3];
const VOLUME = 0.16;

export type Synth = { setMuted(muted: boolean): void; youyou(): void; stop(): void };

export function createAudioContext(): AudioContext | null {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  try {
    return Ctor ? new Ctor() : null;
  } catch {
    return null;
  }
}

/** Youyous : trille rapide en voix aiguë (une seconde). */
export function playYouyou(ac: AudioContext, destination: AudioNode) {
  const t = ac.currentTime + 0.05;
  const osc = ac.createOscillator();
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  const gain = ac.createGain();
  osc.type = "triangle";
  osc.frequency.value = 1150;
  lfo.frequency.value = 11;
  lfoGain.gain.value = 140;
  lfo.connect(lfoGain).connect(osc.frequency);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.12, t + 0.08);
  gain.gain.setValueAtTime(0.12, t + 1.1);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
  osc.connect(gain).connect(destination);
  osc.start(t);
  lfo.start(t);
  osc.stop(t + 1.6);
  lfo.stop(t + 1.6);
}

export function startSynth(ac: AudioContext): Synth {
  const master = ac.createGain();
  master.gain.value = VOLUME;
  master.connect(ac.destination);

  const drone = ac.createOscillator();
  const droneGain = ac.createGain();
  drone.frequency.value = 146.83;
  drone.type = "sine";
  droneGain.gain.value = 0.25;
  drone.connect(droneGain).connect(master);
  drone.start();

  const pluck = (f: number, t: number, v: number) => {
    const o = ac.createOscillator();
    const o2 = ac.createOscillator();
    const g = ac.createGain();
    o.type = "triangle";
    o2.type = "sine";
    o.frequency.value = f;
    o2.frequency.value = f * 2;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    o.connect(g);
    o2.connect(g);
    g.connect(master);
    o.start(t);
    o2.start(t);
    o.stop(t + 2.3);
    o2.stop(t + 2.3);
  };

  let step = 0;
  const timer = window.setInterval(() => {
    const t = ac.currentTime + 0.05;
    pluck(SCALE[PHRASE[step % PHRASE.length]], t, 0.5);
    if (step % 4 === 0) pluck(SCALE[0] / 2, t, 0.35);
    step++;
  }, 420);

  return {
    setMuted(muted) {
      master.gain.setTargetAtTime(muted ? 0 : VOLUME, ac.currentTime, 0.1);
    },
    youyou() {
      playYouyou(ac, ac.destination);
    },
    stop() {
      window.clearInterval(timer);
      drone.stop();
    },
  };
}
