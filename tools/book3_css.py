"""3편 새 놀이 5종 CSS 를 gf.css 끝에 한 번만 붙인다(멱등)."""
p = 'games/engine/gf.css'
s = open(p, encoding='utf-8').read()
MARK = '/* ---- 3편 새 놀이 5종'
if MARK in s:
    print('already')
else:
    s += '''
/* ---- 3편 새 놀이 5종: 꽃 심기·나눠요·숨은 그림·눈송이·박자 ---- */
.plhole { position: absolute; touch-action: none; } .plfl { position: absolute; left: 14px; right: 14px; top: -14px; bottom: 6px; pointer-events: none; transform-origin: 50% 100%; } .plfl.wilt { animation: plwilt .7s; }
@keyframes plwilt { 30% { transform: rotate(-14deg) scaleY(.85) } 60% { transform: rotate(10deg) scaleY(.9) } }
.plok { position: absolute; width: 84px; height: 84px; } .blink { animation: blinkk .5s 3; } @keyframes blinkk { 50% { opacity: .2; transform: scale(1.2) } }
.shpile { position: absolute; width: 128px; height: 74px; } .shleft { position: absolute; display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; } .shleft i { width: 16px; height: 16px; border-radius: 50%; background: #FF6B6B; border: 3px solid #4A3030; }
.shplate { position: absolute; touch-action: none; } .shplate .who { position: absolute; left: 14%; right: 14%; top: 0; height: 52%; display: flex; justify-content: center; align-items: flex-end; } .shplate .who img { height: 100%; width: auto; } .shplate .sl { position: absolute; left: 6%; right: 6%; bottom: 14px; height: 44px; display: flex; flex-wrap: wrap; gap: 0; justify-content: center; align-content: flex-end; z-index: 2; } .shplate .slc { width: 46px; height: 28px; margin: 0 -6px; }
.hdcue { position: absolute; left: 12px; top: 10px; display: flex; gap: 8px; z-index: 6; background: rgba(255,255,255,.9); border-radius: 18px; padding: 6px 10px; box-shadow: 0 3px 0 rgba(0,0,0,.12); } .hdcue > div { width: 40px; height: 40px; } .hdcue > div.got { opacity: .35; filter: grayscale(.6); }
.hdfind, .hdleaf { position: absolute; touch-action: none; } .hdfind.got { filter: drop-shadow(0 0 8px #FFC933); z-index: 6 !important; } .rustle { animation: rustle .4s; } @keyframes rustle { 25% { transform: translateX(-5px) rotate(-6deg) } 75% { transform: translateX(5px) rotate(6deg) } }
.ctcue { position: absolute; right: 14px; top: 8px; width: 60px; height: 60px; z-index: 6; background: rgba(255,255,255,.9); border-radius: 50%; padding: 6px; box-shadow: 0 3px 0 rgba(0,0,0,.12); } .ctflake { position: absolute; touch-action: none; z-index: 4; } .ctflake.hl { filter: drop-shadow(0 0 10px #FFC933); }
.rhpad { position: absolute; border: 0; background: none; padding: 0; z-index: 3; touch-action: none; } .rhring { position: absolute; border: 6px solid #FFC933; border-radius: 50%; pointer-events: none; opacity: .75; } .rhring.hl { border-color: #FF8FA8; animation: blinkk .5s 3; }
.rhgrow { position: absolute; border: 6px solid #FF8FA8; border-radius: 50%; pointer-events: none; transform: scale(.1); opacity: .9; animation: rhgrow linear forwards; } @keyframes rhgrow { to { transform: scale(1); opacity: .5 } }
'''
    open(p, 'w', encoding='utf-8').write(s)
    print('css added')
