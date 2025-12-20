-- 1. Member（メンバー）
CREATE TABLE members (
    id VARCHAR(255) PRIMARY KEY,        -- ユーザーID (ZITADELのID)
    name VARCHAR(100) NOT NULL,
    school_email VARCHAR(255) UNIQUE NOT NULL,
    personal_gmail VARCHAR(255),        -- 個人Gmail（非公開：アプリ側でis_adminを参照し管理者のみ閲覧制限をかける）
    enrollment_year INT NOT NULL,
    is_repeated_year BOOLEAN DEFAULT FALSE,
    major VARCHAR(100),
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    current_status TEXT,  -- 今のところは文字制限がないTEXT型で保存するようにしています。(今日は図書館で勉強しています。夜までいます！)のような少し長い文字を書くかもしれないので
    status_updated_at TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE
);

-- 2. Tag（タグ）と紐付け
CREATE TABLE tags ( -- メンバーに「趣味」や「スキル」などのラベルを付けるためのマスターです
    id SERIAL PRIMARY KEY,  -- タブを登録すると番号を割り振ってくれます
    name VARCHAR(50) UNIQUE NOT NULL  -- 50文字までで同じ名前のタグは複数作れないようにしています
);

CREATE TABLE member_tags ( -- 中間テーブル　ユーザーとタグの組み合わせを主キーにします
    member_id VARCHAR(255) REFERENCES members(id), -- 存在しないメンバーIDを登録しようとするとはじかれるようにしている
    tag_id INT REFERENCES tags(id), -- 存在しないタグIDを登録しようとするとはじかれるようにしている
    PRIMARY KEY (member_id, tag_id) -- 複合主キーで誰がどのタグをのセットを主キーにすることで強いルールを持たせる
);

-- 3. Timetables（時間割）と紐付け
CREATE TABLE timetables (
    id SERIAL PRIMARY KEY, -- 各授業に振られる固有の番号です（例：プログラミング演習 ID:10)
    course_name VARCHAR(200) NOT NULL,  -- 授業の名前
    day_of_week VARCHAR(10) NOT NULL, -- どの曜日か
    period INT NOT NULL, -- 何限目か
    target_major VARCHAR(100), -- どの専攻の
    target_grade INT,          -- 何年生向けか
    classroom VARCHAR(50)      -- 教室名
);

CREATE TABLE member_timetables ( -- だれがどの授業を履修しているかを管理する中間テーブル
    member_id VARCHAR(255) REFERENCES members(id), -- どの学生がかを参照する
    timetable_id INT REFERENCES timetables(id), -- どの授業を受けているかを参照する
    PRIMARY KEY (member_id, timetable_id) -- 誰がどの授業を受けているかのペアを作るため
);

-- 4. Events（イベント）と参加者リスト
CREATE TABLE events (
    id SERIAL PRIMARY KEY, -- イベントごとの番号
    title VARCHAR(200) NOT NULL, -- タイトル
    description TEXT, -- 詳細について
    start_at TIMESTAMP NOT NULL, -- いつ開催されるかを
    location VARCHAR(100), -- 開催場所はどこか
    capacity INT, -- 定員について
    created_by VARCHAR(255) REFERENCES members(id), -- 誰がイベントを主催しているか
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- いつイベントが投稿されたか
);
-- event_participants テーブルを見て例えば田中さん（ID: user_1）が何回参加したかを見たいときはmember_id が user_1 になっている行を探すことで何回参加したかわかる
CREATE TABLE event_participants (
    event_id INT REFERENCES events(id), -- どのイベントに参加するかを参照します
    member_id VARCHAR(255) REFERENCES members(id), -- 誰が参加するのかを参照します
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- いつ参加したか(TIMESTAMP日付と時刻両方を保存するデータ型)を記録します
    PRIMARY KEY (event_id, member_id) -- イベントとメンバーのIDのペアを主キーにすることで一人が同じイベントに2回申し込むミスを防ぎます
);
