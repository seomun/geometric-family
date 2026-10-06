/* 소리 찾기 그림 8종 (코드 SVG, 100×100). 소리가 나면 그림이 움직인다: .sf.play 아래 클래스에 애니메이션이 걸린다(gf.css).
   id 는 소리 슬롯 이름과 같다: snd_<id>. 래스터로 바꾸고 싶으면 id 만 맞춰 교체. */
(function () {
  const K = '#4A3030';
  const S = (inner) => `<svg viewBox="0 0 100 100" class="sfsvg"><g stroke="${K}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round">${inner}</g></svg>`;
  const ICONS = {
    swallow: S(`<g class="sw-all"><path d="M26 60L6 54l7 14-5 12 22-10z" fill="#3B4A7A"/><ellipse cx="50" cy="58" rx="27" ry="19" fill="#3B4A7A"/><ellipse cx="52" cy="67" rx="17" ry="9" fill="#fff" stroke="none"/><circle cx="71" cy="47" r="14" fill="#3B4A7A"/><path d="M83 47l11 4-11 4z" fill="#FFB347"/><circle cx="74" cy="45" r="3.4" fill="#fff" stroke="none"/><circle cx="74.8" cy="45" r="1.6" fill="${K}" stroke="none"/><circle cx="66" cy="55" r="3.4" fill="#FF8FA8" stroke="none"/>`
      + `<g class="wing" style="transform-origin:46px 54px"><path d="M38 54Q46 18 80 24Q68 44 56 58z" fill="#4C5F9B"/></g></g>`),
    bell: S(`<g class="bell" style="transform-origin:50px 14px"><circle cx="50" cy="12" r="6" fill="#FFC933"/><path d="M50 16c-19 0-27 15-27 35v9l-9 11h72l-9-11v-9c0-20-8-35-27-35z" fill="#FFC933"/><path d="M34 44c1-10 6-18 14-21" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/><circle class="clapper" cx="50" cy="80" r="8" fill="#B8860B"/></g>`),
    drum: S(`<g class="drum" style="transform-origin:50px 62px"><ellipse cx="50" cy="38" rx="37" ry="13" fill="#FFF3C2"/><path d="M13 38v34c0 8 17 14 37 14s37-6 37-14V38c0 8-17 14-37 14S13 46 13 38z" fill="#E5566D"/><path d="M24 50l10 28M42 54l8 30M60 54l-8 30M78 50l-10 28" fill="none" stroke="#FFF3C2" stroke-width="3"/></g>`
      + `<g class="stick-l" style="transform-origin:14px 14px"><path d="M6 6l30 22" stroke="#C98F5A" stroke-width="6"/><circle cx="36" cy="28" r="5" fill="#C98F5A"/></g><g class="stick-r" style="transform-origin:86px 14px"><path d="M94 6L64 28" stroke="#C98F5A" stroke-width="6"/><circle cx="64" cy="28" r="5" fill="#C98F5A"/></g>`),
    train: S(`<g class="train"><rect x="14" y="46" width="52" height="34" rx="9" fill="#FFB347"/><rect x="56" y="32" width="32" height="48" rx="8" fill="#FF8FA8"/><rect x="62" y="40" width="20" height="16" rx="4" fill="#fff"/><rect x="20" y="28" width="13" height="22" fill="#6B5F70"/><circle cx="30" cy="82" r="9" fill="#4A3030"/><circle cx="54" cy="82" r="9" fill="#4A3030"/><circle cx="76" cy="82" r="9" fill="#4A3030"/></g>`
      + `<g class="steam" fill="#fff" stroke="none"><circle cx="26" cy="20" r="7"/><circle cx="34" cy="12" r="5"/><circle cx="20" cy="9" r="4"/></g>`),
    drop: S(`<path d="M50 10C50 10 27 40 27 58a23 23 0 0 0 46 0C73 40 50 10 50 10z" fill="#4DABF7"/><path d="M38 56c0 8 5 14 11 16" fill="none" stroke="#fff" stroke-width="4" opacity=".75"/><ellipse class="ripple" cx="50" cy="90" rx="14" ry="4" fill="none" stroke="#4DABF7" stroke-width="3"/><ellipse class="ripple r2" cx="50" cy="90" rx="14" ry="4" fill="none" stroke="#4DABF7" stroke-width="3"/>`),
    gourd: S(`<g class="g-left"><path d="M50 24c-9 0-15 6-15 14 0 6 3 9 3 13-9 3-13 10-13 19 0 12 11 18 25 18z" fill="#C8D84A"/></g><g class="g-right"><path d="M50 24c9 0 15 6 15 14 0 6-3 9-3 13 9 3 13 10 13 19 0 12-11 18-25 18z" fill="#B6CB3C"/></g>`
      + `<path d="M50 24c0-8 4-12 10-12" fill="none" stroke="#6CCB8A" stroke-width="4"/><path d="M56 14q8-6 14 0q-6 6-14 0z" fill="#6CCB8A"/><g class="spark" stroke="none" fill="#FFD36B"><circle cx="50" cy="52" r="6"/><circle cx="44" cy="66" r="4"/><circle cx="56" cy="62" r="3.4"/></g>`),
    wind: S(`<g class="swirl"><path d="M12 36q20-14 40 0t30-6" fill="none" stroke="#6BB6E8" stroke-width="7"/><path d="M8 54q26-16 52 0t26-5" fill="none" stroke="#8FD3F4" stroke-width="7"/><path d="M18 72q16-12 32 0t22-4" fill="none" stroke="#6BB6E8" stroke-width="7"/></g><circle cx="80" cy="30" r="5" fill="#fff" stroke="none"/>`),
    clap: S(`<g class="hand-l" style="transform-origin:42px 82px"><g transform="rotate(14 30 60)"><rect x="14" y="52" width="30" height="34" rx="12" fill="#FFD9A8"/><rect x="14" y="26" width="7" height="32" rx="3.5" fill="#FFD9A8"/><rect x="22" y="20" width="7" height="38" rx="3.5" fill="#FFD9A8"/><rect x="30" y="22" width="7" height="36" rx="3.5" fill="#FFD9A8"/><rect x="38" y="30" width="7" height="30" rx="3.5" fill="#FFD9A8"/><ellipse cx="12" cy="68" rx="6" ry="11" fill="#FFD9A8" transform="rotate(20 12 68)"/></g></g>`
      + `<g class="hand-r" style="transform-origin:58px 82px"><g transform="rotate(-14 70 60)"><rect x="56" y="52" width="30" height="34" rx="12" fill="#FFC896"/><rect x="79" y="26" width="7" height="32" rx="3.5" fill="#FFC896"/><rect x="71" y="20" width="7" height="38" rx="3.5" fill="#FFC896"/><rect x="63" y="22" width="7" height="36" rx="3.5" fill="#FFC896"/><rect x="55" y="30" width="7" height="30" rx="3.5" fill="#FFC896"/><ellipse cx="88" cy="68" rx="6" ry="11" fill="#FFC896" transform="rotate(-20 88 68)"/></g></g>`
      + `<g class="burst" fill="none" stroke="#FFC933" stroke-width="4"><path d="M50 6v10M32 12l5 8M68 12l-5 8"/></g>`),
  };
  // 도깨비(귀여운 외뿔): 그림책용 정지 그림
  const dok = `<g stroke="${K}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"><path d="M44 14Q50 -2 56 14z" fill="#FFD36B"/><ellipse cx="50" cy="52" rx="30" ry="32" fill="#7FD6C2"/><path d="M22 40Q14 26 24 22M78 40Q86 26 76 22" fill="#7FD6C2"/>`
    + `<ellipse cx="38" cy="48" rx="7" ry="9" fill="#fff"/><ellipse cx="62" cy="48" rx="7" ry="9" fill="#fff"/><circle cx="39" cy="50" r="4" fill="${K}"/><circle cx="61" cy="50" r="4" fill="${K}"/><circle cx="40" cy="48" r="1.4" fill="#fff" stroke="none"/><circle cx="62" cy="48" r="1.4" fill="#fff" stroke="none"/>`
    + `<path d="M40 64q10 10 20 0" fill="#fff"/><path d="M45 64l2 5 3-5M50 64l2 5 3-5" fill="#fff" stroke-width="2.4"/><circle cx="29" cy="60" r="5" fill="#FF8FA8" stroke="none" opacity=".8"/><circle cx="71" cy="60" r="5" fill="#FF8FA8" stroke="none" opacity=".8"/>`
    + `<path d="M26 82q-10 6-8 16h14z" fill="#7FD6C2"/><path d="M74 82q10 6 8 16H68z" fill="#7FD6C2"/><rect x="30" y="80" width="40" height="20" rx="8" fill="#FF8FA8"/>`
    + `<path d="M80 62L94 20" stroke="#C98F5A" stroke-width="7" fill="none"/><circle cx="95" cy="16" r="9" fill="#C98F5A"/><path d="M90 10l-4-6M100 14l6-3M96 24l5 5" stroke="#8A5A3B" fill="none"/></g>`;
  GF.art['art.dokkaebi'] = { src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 104" width="330" height="312">${dok}</svg>`), w: 110, h: 104 };
  GF.icons = ICONS;
  // 그림책용 큰 그림(제비·박): 움직임 없이 정지 상태로 art.* 에 등록
  ['swallow', 'gourd'].forEach((k) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="300" height="300">${ICONS[k].replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg>`;
    GF.art['art.' + k] = { src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), w: 100, h: 100 };
  });
})();
