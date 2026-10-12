/* 공통 결과 공유 이미지 GF.share (games/22_IP_SYNERGY.md ⑥): 성인 7앱 결과 화면의 「공유 카드 저장」 — 「당신은 어느 도형인가요?」 + 내 도형 + 결과 + 기하학 가족 로고.
   코드(SVG→canvas→PNG)로만 만들고 SDK 없음. 저장: APK 는 GFSave(MediaStore, 권한 없음), 웹은 내려받기. 사용자가 눌렀을 때만 만든다. 로고는 코드 SVG(임시) — 아트 패스 때 슬롯 brand:logo 로 교체. */
(function () {
  'use strict';
  const S = (GF.share = {});
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const me = () => { try { const m = window.Room && Room.me && Room.me(), T = m && Room.data.meTypes && Room.data.meTypes[m.f]; if (T) return { char: T.char, color: T.color, bg: T.bg, name: T.sub[m.s] || T.name }; } catch (e) {} const T0 = (window.Room && Room.data && Room.data.meTypes && Room.data.meTypes.nemo) || { char: 'nemo_dad.joy', color: '#E8870F', bg: '#FFE3C2', name: '네모' }; return { char: T0.char, color: T0.color, bg: T0.bg, name: '' }; };
  /** SVG(360×450) 한 장: o = {title, stars, line} */
  S.svg = function (o) {
    const M = me(), W = 360, H = 450, appName = (GF.data.ops.appNames || {})[(GF.ops && GF.ops.app) || ''] || '', stars = '★'.repeat(o.stars || 0) + '☆'.repeat(3 - (o.stars || 0));
    const logo = `<g transform="translate(180 392)"><rect x="-58" y="-14" width="26" height="26" rx="6" fill="#E8870F"/><path d="M0 -16L16 12H-16z" fill="#FF8FA8" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><circle cx="46" cy="-1" r="14" fill="#6C7BD9"/></g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" rx="26" fill="${M.bg}"/><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="20" fill="#fff" opacity=".55"/>`
      + `<text x="180" y="44" font-size="22" font-weight="900" text-anchor="middle" fill="${M.color}">당신은 어느 도형인가요?</text><image href="${GF.src(M.char)}" x="100" y="58" width="160" height="184" preserveAspectRatio="xMidYMid meet"/>`
      + (M.name ? `<text x="180" y="262" font-size="16" font-weight="800" text-anchor="middle" fill="#3A2E39">${esc(M.name)}</text>` : '')
      + `<text x="180" y="300" font-size="24" font-weight="900" text-anchor="middle" fill="#3A2E39">${esc(o.title || '클리어!')}</text><text x="180" y="334" font-size="28" text-anchor="middle" fill="#F2B100">${stars}</text>`
      + (o.line ? `<text x="180" y="358" font-size="13" font-weight="700" text-anchor="middle" fill="#7a6f84">${esc(o.line)}</text>` : '') + logo
      + `<text x="180" y="425" font-size="13" font-weight="800" text-anchor="middle" fill="#7a6f84">기하학 가족${appName ? ' · ' + esc(appName) : ''}</text></svg>`;
  };
  S.save = async function (o) {
    const svg = S.svg(o), img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await img.decode();
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; c.getContext('2d').drawImage(img, 0, 0, 1080, 1350);
    const nm = 'gihaha-family-' + ((GF.ops && GF.ops.app) || 'app') + '.png';
    if (window.GFSave && GFSave.image) { if (!GFSave.image(c.toDataURL('image/png'), nm)) throw new Error('save'); return 1; }
    const blob = await new Promise((r) => c.toBlob(r, 'image/png')); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nm; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); return 1;
  };
  /** 결과 시트에 버튼을 붙인다(ads.js 의 UK.result 래퍼가 부른다). 성인 앱 전용 */
  S.attach = function (sc, o) {
    try { if (!sc || (document.documentElement.getAttribute('data-uk') || 'kid') === 'kid') return; const acts = sc.querySelector('.acts'); if (!acts || acts.querySelector('.sh-card')) return;
      const b = UK.btn({ text: GF.t('ops.ip.share'), icon: 'share', cls: 'sky sh-card', onclick: () => { S.save({ title: o.title, stars: o.stars }).then(() => UK.toast(GF.t('ops.ip.shared'), document.getElementById('safe'))).catch(() => UK.toast(GF.t('ops.ip.sharefail'), document.getElementById('safe'))); } }, acts); void b; } catch (e) {}
  };
})();
