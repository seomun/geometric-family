-- ⑪ B3: 요일 던전(하루 횟수)·방치 정찰(마지막 수령 시각)
CREATE TABLE dungeon_runs (account TEXT NOT NULL, day TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (account, day));
ALTER TABLE progress ADD COLUMN idle_ts INTEGER NOT NULL DEFAULT 0;
