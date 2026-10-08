"""④ 막둥이 색칠북 페이지 데이터 생성: python tools/color_gen.py → data/color_pages.json (+ 방 아이템 추가)
페이지 = 데이터 한 줄(type + 그림 지정). 새 페이지는 이 목록(또는 JSON)에 한 줄 더하면 늘어난다."""
import json, math
P = []
def add(type_, id_, **kw): P.append(dict(id=id_, type=type_, **kw))
# 1) 자유 색칠 — 집 가구·소품·도형 얼굴(룸 아이템 그림을 그대로 선화로)
for a in ['sofa','shelf','window','table','lamp','rug','tv','plant','clock','bed','train','party','bowl','tree','drawer','suitcase','globe','set_living','set_home','set_study']:
    add('free', 'f_'+a, art=a)
for c in range(3):
    for t in (1,2): add('free', f'f_shape{c}{t}', shape=[c,t])
# 2) 번호 색칠 — 칸이 적은 그림, 원래 색을 번호로(맞는 색을 고르면 칠해짐)
for a in ['sofa','drawer','clock','bowl','suitcase','globe','tree','train','window','bed']:
    add('number', 'n_'+a, art=a)
# 3) 따라 그리기(점 잇기) — 점을 1부터 차례로 이으면 모양이 나타나고 색칠
DOTS = {
 'house': [[150,40],[250,130],[220,130],[220,250],[80,250],[80,130],[50,130]],
 'star': [[150,30],[183,110],[270,115],[203,170],[225,255],[150,208],[75,255],[97,170],[30,115],[117,110]],
 'heart': [[150,90],[190,45],[245,60],[262,115],[150,255],[38,115],[55,60],[110,45]],
 'fish': [[40,150],[110,90],[190,95],[250,60],[250,240],[190,205],[110,210]],
 'boat': [[40,160],[260,160],[225,240],[75,240]],
 'flower': [[150,40],[190,90],[250,100],[210,150],[240,215],[150,185],[60,215],[90,150],[50,100],[110,90]],
 'car': [[40,190],[40,140],[90,130],[120,80],[200,80],[235,130],[265,140],[265,190],[230,190],[225,215],[175,215],[170,190],[130,190],[125,215],[75,215],[70,190]],
 'moon': [[190,40],[130,80],[100,150],[130,220],[190,260],[160,210],[150,150],[160,90]],
 'tree': [[150,30],[210,110],[180,110],[235,185],[170,185],[170,255],[130,255],[130,185],[65,185],[120,110],[90,110]],
 'kite': [[150,30],[235,130],[150,230],[65,130]],
 'umbrella': [[40,150],[80,80],[150,50],[220,80],[260,150],[205,130],[150,150],[95,130]],
 'cake': [[60,120],[240,120],[250,240],[50,240],[60,170],[100,150],[150,170],[200,150],[240,170]],
}
def spread(pts, minD=52):
    pts=[list(map(float,p)) for p in pts]
    for _ in range(80):
        moved=False
        for i in range(len(pts)):
            for j in range(i+1,len(pts)):
                dx=pts[j][0]-pts[i][0]; dy=pts[j][1]-pts[i][1]; d=(dx*dx+dy*dy)**0.5 or 0.01
                if d<minD:
                    push=(minD-d)/2+0.5; ux,uy=dx/d,dy/d
                    pts[i][0]-=ux*push; pts[i][1]-=uy*push; pts[j][0]+=ux*push; pts[j][1]+=uy*push; moved=True
        for p in pts: p[0]=min(272,max(28,p[0])); p[1]=min(272,max(28,p[1]))
        if not moved: break
    return [[round(x),round(y)] for x,y in pts]
for k,v in DOTS.items():
    sp=spread(v)
    md=min(((sp[i][0]-sp[j][0])**2+(sp[i][1]-sp[j][1])**2)**0.5 for i in range(len(sp)) for j in range(i+1,len(sp)))
    add('trace','t_'+k,dots=sp,minGap=round(md))
# 2-2) 번호 색칠 추가분
for a in ['lamp','table','plant']:
    add('number', 'n_'+a, art=a)
# 4) 스티커 장면 — 배경 위에 가족·가구 스티커
STK = ['chr:baby.joy','chr:nemo_kids.kid1','chr:wife.joy','chr:dong_dad.good','chr:nemo_dad.joy','chr:nemo_mom.joy','art:plant','art:lamp','art:sofa','art:table','art:tree','art:train','shp:0:2','shp:1:2','shp:2:2','art:globe']
DECO = {'rails':[('train',60,400,150),('tree',290,310,90)], 'field':[('tree',60,330,100),('plant',280,380,50),('party',180,420,90)], 'home':[('tree',50,330,90),('party',255,340,110)], 'stream':[('tree',300,300,100),('train',90,420,130)], 'night':[('tree',60,360,100),('lamp',290,380,50),('globe',180,420,50)], 'house':[('party',90,330,120),('plant',280,370,50),('tree',320,310,90)], 'seaside':[('bowl',90,430,60),('tree',300,330,90),('suitcase',200,440,60)], 'hill':[('tree',70,320,100),('tree',290,340,110),('sofa',180,470,120)]}
for bg in ['home','stream','night','house','seaside','hill','rails','field']: add('sticker','s_'+bg,bg=bg,tray=STK,deco=[dict(art=a,x=x,y=y,w=w) for a,x,y,w in DECO[bg]])
# 5) 벽지 만들기 — 도형 무늬 두 색으로 아이 방 벽지
for i,(bg,fg,shp) in enumerate([('#FFE3C2','#FF8FA8',0),('#D8F0FF','#4DABF7',1),('#E2E6FA','#9775FA',2),('#FFF0B8','#69DB7C',0),('#FFE0E8','#FFD43B',1),('#E3F6DC','#FFA94D',2),('#FFF6E5','#F06595',0),('#E7F5FF','#339AF0',2),('#F3F0FF','#845EF4',1)]):
    add('wall','w_%d'%(i+1),pat=shp,bg=bg,fg=fg)
# 5-2) 계절 도안 20장([제안]) — 봄·여름·가을·겨울 따라 그리기 8 + 벽지 8 + 스티커 장면 4. season 키로 썸네일에 계절 표식
def ring(n, r, cx=150, cy=150, a0=-90): return [[cx + r * math.cos(math.radians(a0 + 360 * i / n)), cy + r * math.sin(math.radians(a0 + 360 * i / n))] for i in range(n)]
def star(tips, ro, ri, cx=150, cy=150):
    pts = []
    for i in range(tips * 2):
        r = ro if i % 2 == 0 else ri; a = math.radians(-90 + 180 * i / tips); pts.append([cx + r * math.cos(a), cy + r * math.sin(a)])
    return pts
SEASON_DOTS = [
 ('tulip', 'spring', [[150,40],[205,85],[210,150],[170,205],[170,255],[130,255],[130,205],[90,150],[95,85]]),
 ('sun', 'summer', star(8, 125, 78)),
 ('melon', 'summer', [[40,170],[70,115],[115,90],[185,90],[230,115],[260,170],[205,230],[95,230]]),
 ('maple', 'autumn', star(5, 125, 62) + [[150,255]]),
 ('acorn', 'autumn', [[150,35],[205,70],[225,115],[200,150],[180,215],[150,260],[120,215],[100,150],[75,115],[95,70]]),
 ('snowflake', 'winter', star(6, 130, 62)),
 ('mitten', 'winter', [[95,60],[165,50],[200,100],[215,170],[195,245],[115,245],[95,175],[60,150],[50,100]]),
 ('bell', 'winter', [[150,35],[205,85],[220,160],[250,215],[50,215],[80,160],[95,85],[150,255]]),
]
for k, ss, v in SEASON_DOTS:
    sp = spread(v); md = min(((sp[i][0]-sp[j][0])**2+(sp[i][1]-sp[j][1])**2)**0.5 for i in range(len(sp)) for j in range(i+1,len(sp)))
    add('trace', 't_' + k, dots=sp, minGap=round(md), season=ss)
for i, (bg, fg, shp, ss) in enumerate([('#FFE0EC','#FF8FA8',0,'spring'),('#E3F6DC','#69DB7C',2,'spring'),('#D8F0FF','#4DABF7',1,'summer'),('#FFF6C9','#FFC933',0,'summer'),('#FFE9C7','#E8870F',2,'autumn'),('#FFF3C2','#F06595',1,'autumn'),('#EAF2FF','#8FB4E8',0,'winter'),('#FFE3E3','#E5334A',1,'winter')]):
    add('wall', 'w_s%d' % (i + 1), pat=shp, bg=bg, fg=fg, season=ss)
SEASON_STK = {'spring': ('hill', ['emo:🌸','emo:🌷','emo:🐝','emo:🦋']), 'summer': ('seaside', ['emo:🏖️','emo:🍉','emo:🐚','emo:⛱️']), 'autumn': ('field', ['emo:🍁','emo:🌰','emo:🎃','emo:🍂']), 'winter': ('night', ['emo:⛄','emo:❄️','emo:🧣','emo:🎄'])}
for ss, (bg, emo) in SEASON_STK.items():
    add('sticker', 's_' + ss, bg=bg, tray=['chr:baby.joy','chr:nemo_kids.kid1','chr:wife.joy','chr:nemo_mom.joy'] + emo + ['art:tree','shp:0:2','shp:1:2','shp:2:2'], deco=[dict(art=a,x=x,y=y,w=w) for a,x,y,w in DECO[bg]], season=ss)
# 6) 옛이야기 색칠 12장(D13) — ③ 도형 합치기와 같은 12개 옛이야기의 명장면, 배역은 기하학 가족 [제안]. type 키는 호환 위해 'webtoon' 유지(화면 이름만 「옛이야기 색칠」)
def S(*items): return [list(x) for x in items]
SC = [
 ('아기돼지 삼형제', S(('art','set_home',90,90,150,130),('shp',0,2,15,150,70,70),('shp',0,1,225,160,60,60),('shp',0,2,120,200,70,70),('art','tree',250,80,50,90))),
 ('세 마리 곰', S(('art','table',30,150,240,110),('art','bowl',50,120,60,35),('art','bowl',130,120,50,30),('art','bowl',210,125,40,25),('shp',2,2,40,40,70,70),('shp',0,1,200,50,50,50))),
 ('구두장이와 요정', S(('art','table',40,160,220,100),('art','lamp',230,50,50,130),('shp',0,2,30,60,80,80),('shp',1,1,140,60,45,45))),
 ('콩쥐팥쥐', S(('art','bowl',100,150,100,70),('shp',0,2,20,70,80,80),('shp',0,1,210,90,60,60),('art','plant',250,170,40,70))),
 ('흥부 박', S(('art','tree',20,60,80,180),('art','party',110,130,110,90),('shp',0,2,225,110,70,70),('art','plant',130,50,50,70))),
 ('브레멘 음악대', S(('shp',0,2,100,190,80,80),('shp',1,2,100,120,80,80),('shp',1,1,110,60,60,60),('shp',2,1,125,10,50,50),('art','lamp',230,70,50,130))),
 ('혹부리 영감', S(('shp',0,2,30,100,90,90),('shp',2,1,190,110,80,80),('art','lamp',140,40,50,100),('art','tree',250,150,50,100))),
 ('금도끼 은도끼', S(('art','rug',40,190,220,70),('shp',0,2,30,60,85,85),('shp',2,2,190,60,85,85),('art','tree',250,40,45,100))),
 ('해님 달님', S(('art','tree',20,60,80,190),('shp',0,1,100,100,60,60),('shp',0,2,180,90,70,70),('art','clock',230,20,60,60))),
 ('개미와 베짱이', S(('art','table',30,170,240,100),('shp',0,2,30,80,80,80),('shp',1,2,190,80,80,80),('art','bowl',120,150,60,35))),
 ('피노키오', S(('art','drawer',20,150,110,100),('shp',0,2,150,90,85,85),('shp',1,1,60,70,50,50),('art','window',230,60,60,70))),
 ('잭과 콩나무', S(('art','tree',120,10,80,260),('shp',0,2,20,170,80,80),('shp',2,2,210,40,90,90),('art','globe',230,190,50,70))),
]
for i,(t,sc) in enumerate(SC): add('webtoon','x_%d'%(i+1),scene=sc,caption=t,chapter=i+1)
json.dump({'version':1,'note':'색칠북 페이지 데이터(생성기 tools/color_gen.py). type: free·number·trace·sticker·wall·webtoon','types':{'free':'자유 색칠','number':'번호 색칠','trace':'점 잇기','sticker':'스티커 장면','wall':'벽지 만들기','webtoon':'옛이야기 색칠'},'pages':P}, open('data/color_pages.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)
# 방 아이템: 벽지·액자 세트(아이 방, 유아 그룹) — 색칠 완성 개수로 열림
R = json.load(open('data/room_items.json',encoding='utf-8')); have = {x['id'] for x in R['items']}; no = max(x['no'] for x in R['items'])
for x in R['items']:
    if x['id']=='w_frame': x['w']=56; x['h']=64; x['name']='내 그림 액자'
new = [('w_frame_gold','황금 액자',5,'frame',['#FFC933'],None),('w_frame_pink','분홍 액자',10,'frame',['#FF8FA8'],None),('w_garland','깃발 줄',15,'emoji',['#FFFFFF'],'🎏'),('w_balloons','풍선',20,'emoji',['#FFFFFF'],'🎈'),('w_stars','별 모빌',30,'emoji',['#FFFFFF'],'⭐'),('w_rainbow','무지개',45,'emoji',['#FFFFFF'],'🌈'),('w_crown','왕관 걸이',60,'emoji',['#FFFFFF'],'👑')]
for id_,name,need,art,cols,emo in new:
    if id_ in have: continue
    no+=1; it={"no":no,"id":id_,"name":name,"set":"wall","room":"kid","w":60 if art=='frame' else 40,"h":70 if art=='frame' else 40,"slot":"wall","art":art,"colors":cols,"game":"coloring","season":None,"physical":None,"needPages":need}
    if emo: it['emoji']=emo
    R['items'].append(it)
json.dump(R,open('data/room_items.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print(len(P),'pages', {t:sum(1 for p in P if p['type']==t) for t in {p['type'] for p in P}})
