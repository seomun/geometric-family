/* 기하학 원정대 — 영웅 움직임 프리셋 조작 (gf-asset). hero_anim.css 와 짝. 전역 GFHeroAnim.
   GFHeroAnim.mount(parent, {id, el:'fire'|'grass'|'water', base:'경로/', lite}) → 요소 반환(대기 상태)
   GFHeroAnim.play(node, 'atk'|'hit'|'skill') → 끝나면 대기로 돌아옴(Promise) · GFHeroAnim.down(node) · GFHeroAnim.up(node)
   포즈 그림이 있으면 spr_<id>_<포즈>.webp 로 바꿔 끼우고(@2x 는 srcset), 없으면(onerror) 대기 그림 그대로 변형만 쓴다. */
(function (root) {
  'use strict';
  const DUR = { atk: 500, hit: 200, skill: 900 };
  const src = (n, p) => n.dataset.base + 'spr_' + n.dataset.id + '_' + p + '.webp';
  const setPose = (n, p) => { const im = n.querySelector('.gfh-body'); if (n.dataset['no' + p]) p = 'idle'; im.onerror = () => { if (p !== 'idle') { n.dataset['no' + p] = 1; setPose(n, 'idle'); } }; im.src = src(n, p); im.srcset = src(n, p).replace(/\.webp$/, '@2x.webp') + ' 2x'; };
  const state = (n, s) => { n.className = n.className.replace(/\bis-\w+/g, '').trim() + ' is-' + s; };
  function mount(parent, o) {
    const n = document.createElement('div'); n.className = 'gfh gfh--' + (o.el || 'fire') + (o.lite ? ' gfh--lite' : '') + ' is-idle';
    n.dataset.id = o.id; n.dataset.base = o.base || '';
    n.innerHTML = '<i class="gfh-halo"></i><img class="gfh-body" alt="" draggable="false"><i class="gfh-fx"></i>'; setPose(n, 'idle'); parent.appendChild(n); return n;
  }
  function play(n, p) {
    return new Promise((res) => { if (n.classList.contains('is-down')) return res(); setPose(n, p); state(n, p); clearTimeout(n._t); n._t = setTimeout(() => { setPose(n, 'idle'); state(n, 'idle'); res(); }, DUR[p] || 400); });
  }
  /* 쓰러짐: 눕힌 그림(spr_<id>_down)이 있으면 그대로(가로 128×64), 없으면 피격·대기 그림을 CSS 로 눕힌다 */
  const down = (n) => { clearTimeout(n._t); const im = n.querySelector('.gfh-body'); state(n, 'down');
    if (n.dataset.nodown) { setPose(n, 'hit'); return; }
    im.onload = () => { im.onload = null; n.classList.add('gfh-downimg'); }; im.onerror = () => { n.dataset.nodown = 1; n.classList.remove('gfh-downimg'); setPose(n, 'hit'); };
    im.src = src(n, 'down'); im.srcset = src(n, 'down').replace(/\.webp$/, '@2x.webp') + ' 2x'; };
  const up = (n) => { n.classList.remove('gfh-downimg'); setPose(n, 'idle'); state(n, 'idle'); };
  root.GFHeroAnim = { mount, play, down, up };
})(typeof self !== 'undefined' ? self : this);
