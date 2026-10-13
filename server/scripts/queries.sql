-- ⑪ 운영 대시보드 쿼리 (원격: wrangler d1 execute expedition-db --remote --file scripts/queries.sql / 로컬: node scripts/admin.js stats)
-- 일 활성 계정(접속 집계)
SELECT day, n AS sessions FROM telemetry_daily WHERE name='session' ORDER BY day DESC LIMIT 30;
-- 스테이지 퍼널(시작 → 클리어/실패)
SELECT day, SUM(CASE WHEN name='stage_start' THEN n END) AS start, SUM(CASE WHEN name='stage_clear' THEN n END) AS clear, SUM(CASE WHEN name='stage_fail' THEN n END) AS fail FROM telemetry_daily GROUP BY day ORDER BY day DESC LIMIT 14;
-- 월 매출·결제자·1인당 결제
SELECT ym, COUNT(*) AS orders, COUNT(DISTINCT account) AS payers, SUM(amount_krw) AS krw, ROUND(1.0*SUM(amount_krw)/COUNT(DISTINCT account)) AS arppu FROM purchases WHERE state='granted' GROUP BY ym ORDER BY ym DESC;
-- 환불 건수·금액
SELECT ym, COUNT(*) AS refunds, SUM(amount_krw) AS krw FROM purchases WHERE state='refunded' GROUP BY ym ORDER BY ym DESC;
-- 월 상한 근접 계정(상한의 80% 이상)
SELECT s.account, s.ym, s.krw, a.cap_krw, a.age_band FROM spend_month s JOIN accounts a ON a.id=s.account WHERE a.cap_krw>0 AND s.krw >= 0.8*a.cap_krw ORDER BY s.krw DESC LIMIT 50;
-- 마이너스 잔고(환불 뒤 미상환)
SELECT account, paid_gems FROM wallet WHERE paid_gems<0;
-- 이상 징후(최근 7일, 종류별)
SELECT kind, COUNT(*) AS n, COUNT(DISTINCT account) AS accounts FROM flags WHERE ts > (strftime('%s','now')-7*86400)*1000 GROUP BY kind ORDER BY n DESC;
-- 전투 기록 불일치가 잦은 계정
SELECT account, COUNT(*) AS n FROM flags WHERE kind='bad_replay' GROUP BY account HAVING n>=5 ORDER BY n DESC LIMIT 20;
-- 모집 횟수 분포(계정별) — 확률표 점검용
SELECT pulls, COUNT(*) AS accounts FROM pity GROUP BY pulls/20 ORDER BY pulls;
-- 광고 보상 일 집계
SELECT day, kind, SUM(claimed) AS claimed, COUNT(*) AS seen FROM ad_claims GROUP BY day, kind ORDER BY day DESC LIMIT 20;
