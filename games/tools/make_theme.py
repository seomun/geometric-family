"""「기하학 가족」 테마 시안 3개 만들기: python games/tools/make_theme.py
지침: docs/16_SOUND.md §3 — 네모·세모·동그라미 2마디 동기 + 합주 4마디, 합주 첫 네 음 = 소리 로고(2초).
형식(시안마다 24마디 ≈ 60초): 네모2 · 세모2 · 동그라미2 · 합주4 | 같은 순서 한 번 더(더 풍성) | 합주 끝맺음2 · 소리 로고 아웃트로2
결과: games/media/theme_drafts.mp3 (한 파일: 번호 알림음 → 소리 로고 → 60초) + games/audio/_drafts/*.wav (git 제외)
사람 귀로 판정한다. 외부 샘플·기존 곡 인용 없음(멜로디 새로 작곡).
"""
import io, pathlib, sys, wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 44100
G = pathlib.Path(__file__).resolve().parents[1]
rng = np.random.default_rng(11)

# ---------------- 음 ----------------
def hz(n):
    base = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}[n[0]]
    acc = n[1] if len(n) == 3 else ''
    base += {'#': 1, 'b': -1, '': 0}[acc]
    o = int(n[-1])
    return 440.0 * 2 ** ((base + 12 * (o + 1) - 69) / 12)

def lp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2)); return lfilter(b, a, x)

def hp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), btype='high'); return lfilter(b, a, x)

def env(n, att, dec):
    t = np.arange(n) / SR; e = np.exp(-t / dec); a = max(1, int(att * SR)); e[:a] *= np.linspace(0, 1, a); return e

# ---------------- 악기 ----------------
def additive(f, dur, parts, decs, amps, att=0.003, noise=0.0, detune=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for k, (p, d, a) in enumerate(zip(parts, decs, amps)):
        y += a * np.sin(2 * np.pi * f * p * (detune if k else 1.0) * t) * env(n, att, d)
    if noise: y += lp(rng.standard_normal(n), 3500) * env(n, 0.0005, 0.015) * noise
    return y

def marimba(f, d=0.6):  return additive(f, d, [1, 4.0, 10.0], [0.30, 0.07, 0.03], [1.0, 0.35, 0.08], 0.002, 0.05)
def musicbox(f, d=1.3): return additive(f, d, [1, 2.0, 3.0, 4.2], [0.8, 0.35, 0.18, 0.08], [1.0, 0.45, 0.18, 0.07], 0.002)
def glock(f, d=1.4):    return additive(f, d, [1, 2.76, 5.40, 8.93], [0.9, 0.4, 0.2, 0.1], [1.0, 0.32, 0.14, 0.05], 0.002)
def pluck(f, d=0.7):    # 우쿨렐레처럼 통통 튀는 줄 소리
    return additive(f, d, [1, 2, 3, 4, 5, 6], [0.55, 0.32, 0.2, 0.12, 0.08, 0.05], [1.0, 0.55, 0.33, 0.2, 0.1, 0.06], 0.001, 0.12, 1.0006)
def piano(f, d=1.6):    # 부드러운 피아노(높은 음일수록 빨리 사라짐)
    sc = min(1.4, (261.6 / f) ** 0.45)
    return additive(f, d, [1, 2, 3, 4, 5, 6], [1.7 * sc, 1.1 * sc, 0.7 * sc, 0.5 * sc, 0.35 * sc, 0.25 * sc], [1.0, 0.5, 0.28, 0.18, 0.1, 0.06], 0.003, 0.18, 1.0004)
def flute(f, d=0.8, vib=0.006):
    n = int(d * SR); t = np.arange(n) / SR
    v = 1 + vib * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - 0.15) / 0.25, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * v) / SR
    y = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.05 * np.sin(3 * ph)
    e = np.clip(t / 0.05, 0, 1) * np.clip((d - t) / 0.12, 0, 1)
    return (y + 0.05 * lp(rng.standard_normal(n), 4000)) * e * 0.8
def pad(f, d=2.5):
    n = int(d * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for c in (-4, 0, 4):
        y += np.sin(2 * np.pi * f * 2 ** (c / 1200) * t) + 0.25 * np.sin(4 * np.pi * f * 2 ** (c / 1200) * t)
    e = np.clip(t / 0.35, 0, 1) * np.clip((d - t) / 0.6, 0, 1)
    return lp(y, 2400) * e * 0.33
def bass(f, d=0.7):     return additive(f, d, [1, 2], [0.45, 0.2], [1.0, 0.25], 0.006)
def shaker():
    n = int(0.06 * SR); return hp(rng.standard_normal(n), 6000) * env(n, 0.001, 0.018) * 0.5
def wood():             return marimba(hz('A6'), 0.12) * 0.7

INSTR = {'marimba': marimba, 'musicbox': musicbox, 'glock': glock, 'pluck': pluck, 'piano': piano, 'flute': flute, 'pad': pad, 'bass': bass}

# ---------------- 리버브·유틸 ----------------
_ir = None
def reverb(x, wet=0.25, room=0.8):
    global _ir
    if _ir is None:
        n = int(room * SR); t = np.arange(n) / SR
        ir = lp(rng.standard_normal(n), 5200) * np.exp(-t / 0.18); ir[0] = 0; _ir = ir / np.abs(ir).sum() * 6
    return x * (1 - wet) + fftconvolve(x, _ir)[:len(x)] * wet

def place(buf, snd, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(snd)); buf[i:j] += gain * snd[:j - i]

CHORD = {'C': ['C3', 'G3', 'E4'], 'F': ['F2', 'C3', 'A3'], 'G': ['G2', 'D3', 'B3'], 'Am': ['A2', 'E3', 'C4'], 'Dm': ['D3', 'A3', 'F4'],
         'Bb': ['Bb2', 'F3', 'D4'], 'Em': ['E3', 'B3', 'G4']}

def parse(bar):                       # 'E5:1 G5:1 .:2' → [(note|None, eighths)]
    out = []
    for tok in bar.split():
        n, d = tok.split(':'); out.append((None if n == '.' else n, int(d)))
    assert sum(d for _, d in out) == 8, bar
    return out

# ---------------- 시안 3개 ----------------
DRAFTS = {
    'A': dict(name='따뜻한 마을 (C장조, 마림바·우쿨렐레)', bpm=96, swing=0.0,
              nemo=['E5:1 G5:1 E5:1 C5:1 D5:1 F5:1 D5:1 G4:1', 'E5:1 G5:1 C6:1 G5:1 E5:2 C5:2'],
              semo=['G5:1 .:1 G5:1 .:1 A5:1 G5:1 E5:2', 'C5:3 E5:1 D5:2 C5:2'],
              dong=['C5:4 E5:4', 'D5:6 .:2'],
              ens=['G4:2 C5:2 D5:2 E5:2', 'G5:4 E5:2 C5:2', 'A5:2 G5:2 E5:2 D5:2', 'C5:8'],
              chords=dict(nemo=['C', 'F'], semo=['C', 'G'], dong=['Am', 'G'], ens=['C', 'F', 'G', 'C']),
              inst=dict(nemo='marimba', nemo_comp='pluck', semo_a='pluck', semo_b='musicbox', dong='musicbox', ens='marimba', ens_hi='musicbox')),
    'B': dict(name='장난스러운 이웃 (F장조, 우쿨렐레·플루트 주고받기)', bpm=92, swing=0.16,
              nemo=['F5:1 .:1 A5:1 F5:1 C5:1 D5:1 F5:2', 'G5:1 .:1 Bb5:1 G5:1 D5:2 C5:2'],
              semo=['A5:1 .:1 A5:1 .:1 C6:1 A5:1 F5:2', 'G5:3 F5:1 E5:2 F5:2'],
              dong=['A4:4 C5:4', 'Bb4:6 .:2'],
              ens=['C5:2 F5:2 E5:2 A5:2', 'G5:4 F5:2 C5:2', 'Bb5:2 A5:2 G5:2 E5:2', 'F5:8'],
              chords=dict(nemo=['F', 'Bb'], semo=['F', 'C'], dong=['Dm', 'C'], ens=['F', 'Bb', 'C', 'F']),
              inst=dict(nemo='pluck', nemo_comp='marimba', semo_a='pluck', semo_b='flute', dong='musicbox', ens='pluck', ens_hi='flute')),
    'C': dict(name='맑은 동요풍 (C장조, 피아노·플루트)', bpm=96, swing=0.0,
              nemo=['C5:1 D5:1 E5:1 G5:1 E5:1 D5:1 C5:2', 'D5:1 E5:1 F5:1 A5:1 G5:2 E5:2'],
              semo=['E5:1 .:1 E5:1 .:1 G5:2 E5:2', 'D5:3 C5:1 A4:2 G4:2'],
              dong=['G4:4 C5:4', 'B4:6 .:2'],
              ens=['D5:2 G5:2 A5:2 B5:2', 'C6:4 G5:2 E5:2', 'A5:2 G5:2 F5:2 D5:2', 'C5:8'],
              chords=dict(nemo=['C', 'G'], semo=['C', 'F'], dong=['Em', 'G'], ens=['C', 'F', 'G', 'C']),
              inst=dict(nemo='piano', nemo_comp='pad', semo_a='piano', semo_b='flute', dong='musicbox', ens='piano', ens_hi='musicbox')),
}
FORM = [('nemo', 2), ('semo', 2), ('dong', 2), ('ens', 4), ('nemo', 2), ('semo', 2), ('dong', 2), ('ens', 4), ('tail', 2), ('outro', 2)]   # 24마디

def render(key):
    D = DRAFTS[key]; bpm = D['bpm']; beat = 60 / bpm; e8 = beat / 2; bar_t = beat * 4
    total = 24 * bar_t; buf = np.zeros(int((total + 3.0) * SR))
    I = {k: INSTR[v] for k, v in D['inst'].items()}
    def t_of(bar0, idx):
        t = bar0 + idx * e8
        if D['swing'] and idx % 2 == 1: t += D['swing'] * e8        # 스윙: 홀수 8분음표를 살짝 늦춘다
        return t
    def melody(bar_txt, bar0, inst, gain, legato=1.0, octave=0, staccato=False):
        idx = 0
        for n, d in parse(bar_txt):
            if n:
                f = hz(n) * (2 ** octave); dur = d * e8 * (0.5 if staccato else 1.0) * legato
                place(buf, INSTR[inst](f, max(dur + 0.25, 0.35)) if inst in ('marimba', 'musicbox', 'glock', 'pluck', 'piano') else INSTR[inst](f, max(dur, 0.2)), t_of(bar0, idx), gain)
            idx += d
    def comp(chord, bar0, style, gain, inst):
        notes = CHORD[chord]
        if style == 'strum':                                       # 1·3박 저음, 2·4박 화음
            for b in range(4):
                if b % 2 == 0: place(buf, INSTR[inst](hz(notes[0]), 0.5), bar0 + b * beat, gain * 0.9)
                else:
                    for k, nn in enumerate(notes[1:]): place(buf, INSTR[inst](hz(nn), 0.45), bar0 + b * beat + k * 0.012, gain * 0.55)
        elif style == 'arp':
            for k in range(8): place(buf, INSTR[inst](hz(notes[[0, 1, 2, 1, 2, 1, 2, 1][k]]), 0.5), t_of(bar0, k), gain * (0.8 if k else 1.0))
        elif style == 'pad':
            for nn in notes[1:]: place(buf, pad(hz(nn) * 2, bar_t * 1.05), bar0, gain * 0.5)
            place(buf, bass(hz(notes[0]), 1.0), bar0, gain)
    def rhythm(bar0, gain, wood_on=True):
        for k in range(8): place(buf, shaker(), t_of(bar0, k), gain * (0.7 if k % 2 else 1.0))
        if wood_on:
            for b in (1, 3): place(buf, wood(), bar0 + b * beat, gain * 0.9)

    bar = 0; second = False; seen = {}
    for sec, nb in FORM:
        if sec in ('nemo', 'semo', 'dong', 'ens'):
            seen[sec] = seen.get(sec, 0) + 1; second = seen[sec] == 2
        for k in range(nb):
            b0 = bar * bar_t
            if sec == 'nemo':
                ch = D['chords']['nemo'][k]; melody(D['nemo'][k], b0, I and D['inst']['nemo'], 0.8)
                comp(ch, b0, 'strum' if D['inst']['nemo_comp'] != 'pad' else 'pad', 0.45, D['inst']['nemo_comp'] if D['inst']['nemo_comp'] != 'pad' else 'pad')
                if second: comp(ch, b0, 'pad', 0.25, 'pad'); rhythm(b0, 0.28, False); melody(D['nemo'][k], b0, 'musicbox', 0.3, octave=1)
            elif sec == 'semo':
                ch = D['chords']['semo'][k]
                if k == 0: melody(D['semo'][0], b0, D['inst']['semo_a'], 0.85, staccato=True)
                else: melody(D['semo'][1], b0, D['inst']['semo_b'], 0.8)
                comp(ch, b0, 'pad', 0.45, 'pad')
                if second: place(buf, bass(hz(CHORD[ch][0]), 0.9), b0, 0.5); rhythm(b0, 0.22, False)
            elif sec == 'dong':
                ch = D['chords']['dong'][k]; melody(D['dong'][k], b0, D['inst']['dong'], 0.8, legato=1.0)
                comp(ch, b0, 'pad', 0.55, 'pad')
                if second: melody(D['dong'][k], b0, 'marimba', 0.2, octave=-1)
            elif sec == 'ens':
                ch = D['chords']['ens'][k]
                melody(D['ens'][k], b0, D['inst']['ens'], 0.95); melody(D['ens'][k], b0, D['inst']['ens_hi'], 0.4, octave=1)
                comp(ch, b0, 'arp', 0.5, 'pluck' if D['inst']['ens'] != 'piano' else 'musicbox'); comp(ch, b0, 'pad', 0.4, 'pad')
                if k < 2: melody(D['nemo'][k], b0, 'marimba', 0.28)                       # 합주: 네모 동기가 아래에서 같이 달린다
                if second: rhythm(b0, 0.35); place(buf, bass(hz(CHORD[ch][0]), 0.9), b0, 0.6)
            elif sec == 'tail':                                                           # 합주 끝맺음(마지막 두 마디 다시)
                ch = D['chords']['ens'][2 + k]; melody(D['ens'][2 + k], b0, D['inst']['ens'], 0.9); melody(D['ens'][2 + k], b0, D['inst']['ens_hi'], 0.4, octave=1)
                comp(ch, b0, 'pad', 0.55, 'pad'); comp(ch, b0, 'arp', 0.4, 'musicbox')
            elif sec == 'outro':                                                          # 소리 로고 모티프를 뮤직박스로 한 번 + 여운(루프 처음으로 이어짐)
                if k == 0:
                    for i, (n, d) in enumerate(parse(D['ens'][0])):
                        if n: place(buf, musicbox(hz(n), 1.2), b0 + i * beat * 0.5 * d * 1.0, 0.7)
                    comp('C' if key != 'B' else 'F', b0, 'pad', 0.5, 'pad')
                else: comp('C' if key != 'B' else 'F', b0, 'pad', 0.4, 'pad')
            bar += 1
    x = reverb(buf, 0.28, 0.85)
    L = int(total * SR); tail = x[L:]; x = x[:L]; x[:len(tail)] += tail            # 루프 이음새
    f = int(0.012 * SR); x[:f] *= np.linspace(0, 1, f)
    return x / (np.abs(x).max() + 1e-9) * 0.82

def sting(key):
    """소리 로고 2초: 합주 첫 네 음(0.38초 간격) + 마지막 음 길게 + 화음 여운."""
    D = DRAFTS[key]; notes = [n for n, d in parse(D['ens'][0]) if n]; step = 0.36
    b = np.zeros(int(2.4 * SR))
    for i, n in enumerate(notes):
        place(b, marimba(hz(n), 0.8), i * step, 0.9); place(b, glock(hz(n) * 2, 1.2), i * step, 0.28)
    root = 'F' if key == 'B' else 'C'
    for nn in CHORD[root][1:]: place(b, pad(hz(nn) * 2, 2.0), 3 * step, 0.55)
    place(b, glock(hz(notes[-1]), 1.8), 3 * step, 0.5)
    x = reverb(b, 0.3, 0.7)[:int(2.0 * SR)]; x[-int(0.15 * SR):] *= np.linspace(1, 0, int(0.15 * SR))
    return x / (np.abs(x).max() + 1e-9) * 0.82

def ding(n):
    b = np.zeros(int((0.5 * n + 0.8) * SR))
    for i in range(n): place(b, glock(hz('C6'), 0.7), i * 0.5, 0.8)
    return reverb(b, 0.2, 0.5)[: len(b)] / 1.0

def pcm16(x): return (np.clip(x, -1, 1) * 32767).astype('<i2')

def write_wav(path, x):
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm16(x).tobytes())

if __name__ == '__main__':
    outdir = G / 'audio' / '_drafts'; outdir.mkdir(parents=True, exist_ok=True)
    parts = []; sil = lambda s: np.zeros(int(s * SR))
    for i, key in enumerate(DRAFTS, 1):
        th, st = render(key), sting(key)
        write_wav(outdir / f'theme_{key}.wav', th); write_wav(outdir / f'sting_{key}.wav', st)
        parts += [ding(i) * 0.9, sil(1.0), st, sil(1.4), th, sil(2.8)]
        print(f'시안 {key} [{DRAFTS[key]["name"]}]  테마 {len(th) / SR:.1f}s · 로고 {len(st) / SR:.1f}s · 피크 {np.abs(th).max():.2f}')
    allx = np.concatenate(parts)
    try:
        import lameenc
        enc = lameenc.Encoder(); enc.set_bit_rate(128); enc.set_in_sample_rate(SR); enc.set_channels(1); enc.set_quality(2)
        mp3 = enc.encode(pcm16(allx).tobytes()) + enc.flush()
        (G / 'media').mkdir(exist_ok=True); (G / 'media' / 'theme_drafts.mp3').write_bytes(bytes(mp3))
        print('theme_drafts.mp3', len(mp3) // 1024, 'KB', f'{len(allx) / SR:.0f}s')
    except ImportError:
        write_wav(G / 'media' / 'theme_drafts.wav', allx); print('lameenc 없음 → theme_drafts.wav')
