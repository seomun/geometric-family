"""효과음 8종 + 자장가 BGM 을 직접 합성한다 (자작, 라이선스 걸림 없음). python games/tools/make_audio.py
결과: games/audio/*.wav  (SFX 44.1kHz 모노, BGM 22.05kHz 모노)
음색 목표: 마림바·뮤직박스·글로켄슈필처럼 부드럽고 따뜻하게 — 사각파·삑삑 소리 없음. 짧은 룸 리버브로 공기감.
"""
import numpy as np, pathlib, wave
from scipy.signal import fftconvolve, butter, lfilter

SR = 44100
OUT = pathlib.Path(__file__).resolve().parents[1] / 'audio'
OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(7)

def hz(note):                      # 'C5' -> Hz
    names = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
    n = names[note[0]] + (1 if '#' in note else 0); o = int(note[-1])
    return 440.0 * 2 ** ((n + 12 * (o + 1) - 69) / 12)

def lp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2)); return lfilter(b, a, x)

def env_exp(n, attack, decay_t):
    t = np.arange(n) / SR
    e = np.exp(-t / decay_t); a = int(attack * SR)
    if a: e[:a] *= np.linspace(0, 1, a)
    return e

def voice(freq, dur, partials, decays, amps, attack=0.003, sr_noise=0.0):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for p, d, a in zip(partials, decays, amps):
        y += a * np.sin(2 * np.pi * freq * p * t) * env_exp(n, attack, d)
    if sr_noise:                                     # 말렛이 닿는 아주 작은 소리
        nz = lp(rng.standard_normal(n), 3000) * env_exp(n, 0.0005, 0.012) * sr_noise
        y += nz
    return y

def marimba(f, dur=0.5):  return voice(f, dur, [1, 4.0, 10.0], [0.28, 0.07, 0.03], [1.0, 0.35, 0.08], 0.002, 0.05)
def musicbox(f, dur=1.2): return voice(f, dur, [1, 2.0, 3.0, 4.2], [0.7, 0.35, 0.18, 0.08], [1.0, 0.45, 0.18, 0.07], 0.002)
def glock(f, dur=1.4):    return voice(f, dur, [1, 2.76, 5.40, 8.93], [0.9, 0.4, 0.2, 0.1], [1.0, 0.32, 0.14, 0.05], 0.002)

def place(buf, snd, t0, gain=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(snd)); buf[i:j] += gain * snd[:j - i]

_ir = None
def reverb(x, wet=0.18, room=0.55):
    global _ir
    if _ir is None:
        n = int(room * SR); t = np.arange(n) / SR
        ir = lp(rng.standard_normal(n), 5000) * np.exp(-t / 0.13); ir[0] = 0; _ir = ir / np.abs(ir).sum() * 6
    w = fftconvolve(x, _ir)[:len(x)]
    return x * (1 - wet) + w * wet

def finish(x, peak=0.85, fade=0.02):
    x = x / (np.abs(x).max() + 1e-9) * peak
    f = int(fade * SR); x[-f:] *= np.linspace(1, 0, f)
    return x

def save(name, x, sr=SR):
    if sr != SR:
        from scipy.signal import resample_poly
        x = resample_poly(x, sr, SR)
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(str(OUT / (name + '.wav')), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())
    print(f'{name:10s} {len(x) / sr:5.2f}s  {pcm.nbytes // 1024:5d} KB')

def buf(sec): return np.zeros(int(sec * SR))

# ---- 효과음 ----
def s_tap():
    b = buf(0.35); place(b, marimba(hz('C6'), 0.3), 0, 1); return finish(reverb(b, 0.12), 0.7)
def s_pick():                       # 집기: 말랑한 방울이 톡 떠오르는 소리
    n = int(0.16 * SR); t = np.arange(n) / SR; f = 420 + 520 * (1 - np.exp(-t / 0.035))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.004, 0.06)
    b = buf(0.4); place(b, y, 0, 1); place(b, glock(hz('E6'), 0.3), 0.04, 0.12); return finish(reverb(b, 0.14), 0.75)
def s_drop():                       # 놓기: 폭신한 "톡"
    n = int(0.18 * SR); t = np.arange(n) / SR; f = 250 - 110 * (1 - np.exp(-t / 0.03))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.002, 0.045)
    y += lp(rng.standard_normal(n), 1200) * env_exp(n, 0.0005, 0.01) * 0.25
    return finish(reverb(np.pad(y, (0, int(0.2 * SR))), 0.1), 0.8)
def s_ok():                         # 정답: 마림바 도-미-솔-도 (올라가며 밝게)
    b = buf(1.3)
    for i, nme in enumerate(['C5', 'E5', 'G5', 'C6']):
        place(b, marimba(hz(nme), 0.6), i * 0.085, 1)
    place(b, glock(hz('C6'), 1.0), 0.26, 0.22); place(b, glock(hz('G6'), 1.0), 0.3, 0.12)
    return finish(reverb(b, 0.22), 0.85)
def s_celebrate():                  # 축하: 반짝이는 5음 상승 + 따뜻한 화음 + 별가루
    b = buf(2.3)
    for i, nme in enumerate(['C5', 'D5', 'E5', 'G5', 'A5', 'C6']):
        place(b, marimba(hz(nme), 0.5), i * 0.075, 0.8)
    for nme, g in [('C6', .5), ('E6', .4), ('G6', .4), ('C7', .22)]:
        place(b, glock(hz(nme), 1.6), 0.5, g)
    for k in range(9):
        place(b, glock(hz(['E7', 'G7', 'C7', 'A6'][k % 4]), 0.5), 0.6 + k * 0.11 + rng.random() * 0.03, 0.12)
    return finish(reverb(b, 0.28, 0.7), 0.88)
def s_hmm():                        # 갸웃: 뮤직박스 솔-미, 느리고 부드럽게 (부정 신호 약하게)
    b = buf(1.1)
    place(b, musicbox(hz('G4'), 0.7), 0.0, 0.85); place(b, musicbox(hz('E4'), 0.8), 0.22, 0.8)
    return finish(reverb(b, 0.2), 0.62)
def s_flip():
    n = int(0.09 * SR); y = lp(rng.standard_normal(n), 2400) * env_exp(n, 0.004, 0.02); y = np.pad(y, (0, int(0.1 * SR)))
    place(y, marimba(hz('A5'), 0.12), 0.05, 0.35); return finish(y, 0.6)
def s_star():
    b = buf(1.0)
    for i, nme in enumerate(['G5', 'B5', 'D6']):
        place(b, glock(hz(nme), 0.8), i * 0.1, 0.9)
    return finish(reverb(b, 0.22), 0.8)
def s_page():
    n = int(0.22 * SR); t = np.arange(n) / SR
    y = lp(rng.standard_normal(n), 1800) * np.sin(np.pi * t / 0.22) ** 2 * 0.5
    b = np.pad(y, (0, int(0.4 * SR))); place(b, musicbox(hz('E5'), 0.5), 0.16, 0.6)
    return finish(reverb(b, 0.16), 0.6)

def s_wind():                       # 바람 친구 "후~": 숨소리 같은 잡음이 부드럽게 커졌다 작아짐 + 아주 작은 휘파람
    n = int(1.6 * SR); t = np.arange(n) / SR
    env = np.sin(np.pi * np.clip(t / 1.6, 0, 1)) ** 1.6
    nz = rng.standard_normal(n)
    from scipy.signal import butter as _b, lfilter as _l
    fc = 520 + 380 * np.sin(np.pi * t / 1.6)                    # 중심 주파수가 살짝 올라갔다 내려옴
    out = np.zeros(n); blk = 2048
    for i in range(0, n, blk):
        lo, hi = max(120, fc[i] * 0.55), fc[i] * 1.5
        bb, aa = _b(2, [lo / (SR / 2), hi / (SR / 2)], btype='band'); out[i:i + blk] = _l(bb, aa, nz[i:i + blk])
    out *= env * 1.8
    whistle = np.sin(2 * np.pi * np.cumsum(780 + 40 * np.sin(2 * np.pi * 5.5 * t)) / SR) * env * 0.05
    return finish(reverb(out + whistle, 0.2, 0.5), 0.6, 0.08)
def s_door():                       # 문 열림 "딩동": 맑은 종 두 음(미→도), 끼익 소리 없음
    b = buf(1.5)
    place(b, glock(hz('E6'), 1.2), 0.0, 1.0); place(b, marimba(hz('E5'), 0.4), 0.0, 0.3)
    place(b, glock(hz('C6'), 1.3), 0.30, 1.0); place(b, marimba(hz('C5'), 0.4), 0.30, 0.3)
    return finish(reverb(b, 0.24, 0.6), 0.8)

# ---- BGM: 자작 자장가 (뮤직박스, C 장조, 78 BPM, 16마디 ≈ 49초 루프) ----
def bgm():
    bpm = 78; beat = 60 / bpm; bars = 16; total = bars * 4 * beat
    b = buf(total + 2.0)
    chords = [('C', ['C3', 'G3', 'E4']), ('A', ['A2', 'E3', 'C4']), ('F', ['F2', 'C3', 'A3']), ('G', ['G2', 'D3', 'B3'])]
    prog = [0, 1, 2, 3] * 4
    mel = [                                             # 마디마다 8분음표 8칸 ('.' = 쉼)
        'E5 . G5 . E5 D5 C5 .', 'C5 . E5 . A4 . C5 .', 'A4 C5 F5 . E5 . C5 .', 'D5 . G5 . B4 D5 . .',
        'E5 . G5 . A5 G5 E5 .', 'C5 . E5 D5 C5 . A4 .', 'A4 . C5 . F5 E5 C5 .', 'D5 . B4 . G4 . . .',
        'G5 . E5 . G5 A5 G5 .', 'E5 . C5 . E5 . A5 .', 'F5 . A5 . F5 E5 C5 .', 'D5 . B4 . D5 . G5 .',
        'E5 . G5 . C6 . G5 .', 'A5 . E5 . C5 D5 E5 .', 'F5 . E5 . C5 . A4 .', 'G4 . B4 . C5 . . .',
    ]
    for bar in range(bars):
        t0 = bar * 4 * beat; _, notes = chords[prog[bar]]
        for k in range(8):                              # 아르페지오: 저음-중음-고음 반복
            nm = notes[[0, 1, 2, 1, 2, 1, 2, 1][k]]
            place(b, musicbox(hz(nm), 1.0), t0 + k * beat / 2, 0.30 if k else 0.4)
        for k, nm in enumerate(mel[bar].split()):
            if nm != '.': place(b, musicbox(hz(nm), 1.4), t0 + k * beat / 2, 0.55)
    b = reverb(b, 0.3, 0.9)
    # 루프 이음새: 꼬리를 앞부분에 겹쳐 더한다
    L = int(total * SR); tail = b[L:]; b = b[:L]; b[:len(tail)] += tail
    f = int(0.01 * SR); b[:f] *= np.linspace(0, 1, f)
    return b / (np.abs(b).max() + 1e-9) * 0.7

if __name__ == '__main__':
    for name, fn in [('tap', s_tap), ('pick', s_pick), ('drop', s_drop), ('ok', s_ok), ('celebrate', s_celebrate), ('hmm', s_hmm), ('flip', s_flip), ('star', s_star), ('page', s_page), ('wind', s_wind), ('door', s_door)]:
        save(name, fn())
    save('bgm', bgm(), 22050)
