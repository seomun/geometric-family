"""④ 막둥이 색칠북 페이지 데이터 생성: python tools/color_gen.py → data/color_pages.json (+ 방 아이템 추가)
페이지 = 데이터 한 줄(type + 그림 지정). 새 페이지는 이 목록(또는 JSON)에 한 줄 더하면 늘어난다."""
import json
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
# 4) 스티커 장면 — 배경 위에 가족·가구 스티커
STK = ['chr:baby.joy','chr:nemo_kids.kid1','chr:wife.joy','chr:dong_dad.good','chr:nemo_dad.joy','chr:nemo_mom.joy','art:plant','art:lamp','art:sofa','art:table','art:tree','art:train','shp:0:2','shp:1:2','shp:2:2','art:globe']
DECO = {'home':[('tree',50,330,90),('party',255,340,110)], 'stream':[('tree',300,300,100),('train',90,420,130)], 'night':[('tree',60,360,100),('lamp',290,380,50),('globe',180,420,50)], 'house':[('party',90,330,120),('plant',280,370,50),('tree',320,310,90)], 'seaside':[('bowl',90,430,60),('tree',300,330,90),('suitcase',200,440,60)], 'hill':[('tree',70,320,100),('tree',290,340,110),('sofa',180,470,120)]}
for bg in ['home','stream','night','house','seaside','hill']: add('sticker','s_'+bg,bg=bg,tray=STK,deco=[dict(art=a,x=x,y=y,w=w) for a,x,y,w in DECO[bg]])
# 5) 벽지 만들기 — 도형 무늬 두 색으로 아이 방 벽지
for i,(bg,fg,shp) in enumerate([('#FFE3C2','#FF8FA8',0),('#D8F0FF','#4DABF7',1),('#E2E6FA','#9775FA',2),('#FFF0B8','#69DB7C',0),('#FFE0E8','#FFD43B',1),('#E3F6DC','#FFA94D',2)]):
    add('wall','w_%d'%(i+1),pat=shp,bg=bg,fg=fg)
# 6) 웹툰 컷 색칠 — 장마다 한 장면(네모·세모·동그라미 도형 인물 + 가구) [제안]
def S(*items): return [list(x) for x in items]
SC = [
 ('저녁 식사', S(('art','table',60,150,180,110),('shp',0,2,20,70,90,90),('shp',0,1,120,100,60,60),('shp',2,2,200,70,90,90),('art','bowl',100,140,50,30))),
 ('소파에서', S(('art','sofa',50,120,200,130),('shp',0,2,80,40,70,70),('shp',0,1,160,70,50,50),('art','lamp',230,70,50,130))),
 ('이삿짐', S(('art','drawer',20,140,110,100),('art','suitcase',150,160,80,70),('shp',1,2,230,120,60,60),('art','plant',250,170,40,70))),
 ('화장실 줄', S(('shp',0,2,20,90,70,70),('shp',0,2,100,90,70,70),('shp',0,1,180,110,50,50),('shp',2,1,240,110,50,50),('art','clock',120,20,60,60))),
 ('냉장고 앞', S(('art','shelf',30,50,110,180),('shp',0,2,160,100,80,80),('art','bowl',200,200,60,40))),
 ('거실 꾸미기', S(('art','set_living',20,100,260,150),('art','window',120,10,70,80),('shp',1,1,40,50,50,50))),
 ('김장하는 날', S(('art','table',40,170,220,100),('shp',0,2,30,70,80,80),('shp',2,2,120,60,80,80),('shp',1,2,210,70,80,80),('art','bowl',130,150,50,30))),
 ('손님이 온다', S(('art','rug',30,200,240,70),('shp',1,2,30,70,90,90),('shp',2,2,170,70,90,90),('art','plant',130,100,50,90))),
 ('큰 상 차리기', S(('art','table',20,150,260,120),('art','bowl',70,130,50,30),('art','bowl',150,130,50,30),('art','bowl',230,130,50,30),('shp',0,1,125,60,50,50))),
 ('이사 가는 날', S(('art','train',20,170,260,100),('shp',0,2,60,80,70,70),('shp',1,2,180,90,70,70))),
 ('동네 한 바퀴', S(('art','tree',20,60,80,180),('art','party',110,120,100,90),('shp',2,2,220,120,70,70))),
 ('세 가족 한자리', S(('art','table',30,170,240,100),('shp',0,2,30,70,80,80),('shp',1,2,110,60,80,80),('shp',2,2,190,70,80,80),('art','set_study',100,10,100,60))),
]
for i,(t,sc) in enumerate(SC): add('webtoon','x_%d'%(i+1),scene=sc,caption=t,chapter=i+1)
json.dump({'version':1,'note':'색칠북 페이지 데이터(생성기 tools/color_gen.py). type: free·number·trace·sticker·wall·webtoon','types':{'free':'자유 색칠','number':'번호 색칠','trace':'점 잇기','sticker':'스티커 장면','wall':'벽지 만들기','webtoon':'웹툰 컷 색칠'},'pages':P}, open('data/color_pages.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)
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
