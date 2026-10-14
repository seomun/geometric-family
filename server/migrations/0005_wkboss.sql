-- ⑪ B26: 주간 협동 보스 — 모두의 피해 합계(순위 없음)와 참여 기록. week = 주 번호(KST 월요일 기준)
CREATE TABLE wkboss (week TEXT PRIMARY KEY, total INTEGER NOT NULL DEFAULT 0);
CREATE TABLE wkboss_part (week TEXT NOT NULL, account TEXT NOT NULL, dmg INTEGER NOT NULL DEFAULT 0, tries INTEGER NOT NULL DEFAULT 0, day TEXT NOT NULL DEFAULT '', dtries INTEGER NOT NULL DEFAULT 0, claim TEXT NOT NULL DEFAULT '{}', PRIMARY KEY (week, account));
