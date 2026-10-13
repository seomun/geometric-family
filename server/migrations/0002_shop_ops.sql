-- ⑪ S1 WP5~8: 결제·광고·원격 설정·운영. (스토어 연동은 어댑터 뒤에 두고 로컬은 mock)
ALTER TABLE accounts ADD COLUMN has_paid INTEGER NOT NULL DEFAULT 0;      -- 결제 이력(전면 광고 제외 근거)
ALTER TABLE accounts ADD COLUMN no_inter INTEGER NOT NULL DEFAULT 0;      -- 광고 제거 구매
ALTER TABLE accounts ADD COLUMN cap_user INTEGER;                         -- 사용자가 낮춘 월 상한(원). 낮추기는 즉시, 올리기는 다음 달부터
ALTER TABLE accounts ADD COLUMN cap_next INTEGER;
ALTER TABLE accounts ADD COLUMN cap_next_ym TEXT;
ALTER TABLE wallet ADD COLUMN tickets INTEGER NOT NULL DEFAULT 0;         -- 소탕권(보상형 광고 지급분)
ALTER TABLE purchases ADD COLUMN gems INTEGER NOT NULL DEFAULT 0;         -- 지급한 유상 반짝석(보너스 포함)
ALTER TABLE purchases ADD COLUMN bonus INTEGER NOT NULL DEFAULT 0;
ALTER TABLE purchases ADD COLUMN ym TEXT;                                 -- 집계 월(KST)
ALTER TABLE ad_claims ADD COLUMN day TEXT;
CREATE INDEX purchases_acc ON purchases(account, ts);
CREATE INDEX ad_claims_day ON ad_claims(account, kind, day);
CREATE TABLE config_kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);       -- maintenance, min_client, notice …
CREATE TABLE events (id TEXT PRIMARY KEY, start_ts INTEGER NOT NULL, end_ts INTEGER NOT NULL, title TEXT NOT NULL, payload TEXT NOT NULL DEFAULT '{}');
CREATE TABLE rate_limit (k TEXT PRIMARY KEY, win INTEGER NOT NULL, n INTEGER NOT NULL);
CREATE TABLE flags (id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT, ts INTEGER NOT NULL, kind TEXT NOT NULL, detail TEXT);
CREATE INDEX flags_acc ON flags(account, ts);
