"""효과음 슬롯을 Kenney.nl CC0 팩으로 다시 만든다(허브 지시 2026-10-09: 자작 합성음 → 상업 이용 가능 CC0). 같은 슬롯 id·같은 파일 이름(games/audio/*.wav) — 코드·sounds.json 변경 없음.
원본 팩은 notes/sfx_dl/ (gitignore 아님, 라이선스 파일 포함). 한 슬롯 = 여러 원본 조각을 시간차·음높이(반음)로 쌓은 것(저작물 아님, 원본이 모두 CC0).
음량: 짧은 소리는 K-가중 −16 LUFS 근처(탭류는 약간 낮게, 기쁜 순간 celebrate·star·ok 는 −14), 피크 −1 dBFS 로 제한. 실행: python tools/make_sfx_cc0.py [--check]"""
import sys, wave, pathlib, numpy as np, soundfile as sf, pyloudnorm as pln
R = pathlib.Path(__file__).resolve().parents[1]; SRC = R / 'notes' / 'sfx_dl'; OUT = R / 'games' / 'audio'; SR = 44100
P = {'I': 'kenney_interface-sounds', 'U': 'kenney_ui-audio', 'D': 'kenney_digital-audio', 'R': 'kenney_rpg-audio', 'P': 'kenney_impact-sounds', 'C': 'kenney_casino-audio'}
# 슬롯: (목표 LUFS, [(원본, 시작초, 반음, 게인)])
S = {
    'tap': (-21, [('I/select_003', 0, 0, 1)]),
    'pick': (-19, [('I/select_004', 0, 4, 1)]),
    'drop': (-19, [('I/drop_002', 0, 0, 1)]),
    'ok': (-15, [('I/confirmation_002', 0, 0, 1), ('I/glass_003', 0.12, 7, 0.45)]),
    'hmm': (-20, [('I/question_002', 0, -2, 1)]),
    'flip': (-20, [('C/card-slide-3', 0, 0, 1)]),
    'page': (-19, [('R/bookFlip2', 0, 0, 1)]),
    'star': (-15, [('I/confirmation_004', 0, 0, 1), ('I/glass_005', 0.05, 5, 0.6)]),
    'celebrate': (-14, [('I/confirmation_001', 0, 0, 1), ('I/confirmation_003', 0.16, 4, 1), ('I/confirmation_004', 0.34, 7, 1), ('I/glass_005', 0.55, 12, 0.8), ('I/glass_002', 0.7, 16, 0.55), ('C/cards-pack-open-1', 0.0, 0, 0.35)]),
    'door': (-17, [('I/bong_001', 0, 5, 1), ('I/bong_001', 0.42, 0, 1)]),
    'tukdak': (-16, [('P/impactWood_light_001', 0, 0, 1), ('P/impactWood_medium_002', 0.2, 0, 1), ('I/glass_001', 0.42, 7, 0.55)]),
    'shutter': (-18, [('R/metalClick', 0, 0, 1), ('I/click_004', 0.07, 0, 0.8)]),
    'note1': (-19, [('I/pluck_002', 0, 0, 1)]), 'note2': (-19, [('I/pluck_002', 0, 2, 1)]), 'note3': (-19, [('I/pluck_002', 0, 4, 1)]), 'note4': (-19, [('I/pluck_002', 0, 7, 1)]), 'note5': (-19, [('I/pluck_002', 0, 9, 1)]),
    'snd_bell': (-17, [('I/bong_001', 0, 0, 1), ('I/bong_001', 0.5, 0, 0.8)]),
    'snd_drum': (-17, [('P/impactSoft_heavy_001', 0, -5, 1), ('P/impactSoft_heavy_002', 0.4, -5, 0.9)]),
    'snd_drop': (-19, [('I/drop_003', 0, 0, 1), ('I/drop_003', 0.45, 2, 0.8)]),
    'snd_gourd': (-16, [('P/impactWood_heavy_001', 0, 0, 1), ('I/glass_002', 0.1, 9, 0.55)]),
    'snd_clap': (-17, [('P/impactSoft_medium_001', 0, 6, 1), ('P/impactSoft_medium_002', 0.17, 6, 1), ('P/impactSoft_medium_003', 0.34, 6, 1)]),
    'snd_swallow': (-19, [('I/pluck_001', 0, 14, 0.9), ('I/pluck_001', 0.11, 17, 0.9), ('I/pluck_001', 0.2, 14, 0.8), ('I/pluck_001', 0.31, 19, 0.8)]),
}
KEEP = ['wind', 'whistle']   # CC0 팩에 비슷한 소리가 없어 자작 유지(SOUND_CREDITS 에 명시)
def load(ref):
    p, n = ref.split('/'); d, r = sf.read(SRC / P[p] / 'Audio' / (n + '.ogg'), always_2d=True); d = d.mean(1)
    if r != SR: d = np.interp(np.arange(0, len(d) * SR / r), np.arange(len(d)) * SR / r, d)
    return d
def shift(d, st):
    if not st: return d
    f = 2 ** (st / 12); return np.interp(np.arange(0, len(d) - 1, f), np.arange(len(d)), d)
def mix(parts):
    L = max(int(t * SR) + len(shift(load(r), s)) for r, t, s, g in parts); y = np.zeros(L + 2000)
    for r, t, s, g in parts:
        d = shift(load(r), s) * g; i = int(t * SR); y[i:i + len(d)] += d
    n = np.max(np.nonzero(np.abs(y) > 1e-3)[0]) if np.any(np.abs(y) > 1e-3) else len(y); y = y[:n + 1200]; f = min(len(y), 800); y[-f:] *= np.linspace(1, 0, f); return y
def lufs(y):
    z = np.concatenate([y, np.zeros(max(0, int(0.5 * SR) - len(y)))]); return pln.Meter(SR).integrated_loudness(z)
def norm(y, tgt):
    g = 10 ** ((tgt - lufs(y)) / 20); y = y * g; pk = np.max(np.abs(y)); lim = 10 ** (-1 / 20)
    return y * (lim / pk) if pk > lim else y
if __name__ == '__main__':
    rows = []
    for k, (tgt, parts) in S.items():
        y = norm(mix(parts), tgt); pcm = (np.clip(y, -1, 1) * 32767).astype('<i2')
        if '--check' not in sys.argv:
            w = wave.open(str(OUT / f'{k}.wav'), 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
        rows.append((k, len(y) / SR, lufs(y), 20 * np.log10(np.max(np.abs(y)))))
    for r in rows: print('%-12s %.2fs  %.1f LUFS  peak %.1f dB' % r)
