-- ユーティリティ関数 (共通) 
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW(); -- 更新後のデータの『更新日時（updated_at）』を、今この瞬間の時刻に書き換えます
    RETURN NEW;
END;
$$ language 'plpgsql'; -- ここで命令は終わります 


-- Member（メンバー）
CREATE TABLE IF NOT EXISTS public.members ( -- すでにテーブルが存在する状態で同じSQLを実行したときの保険を入れておきました
    id VARCHAR(255) PRIMARY KEY, -- ZITADELのID
    name VARCHAR(100) NOT NULL,
    school_email VARCHAR(255) UNIQUE NOT NULL,
    personal_gmail VARCHAR(255),
    enrollment_year INT NOT NULL,
    is_repeated_year BOOLEAN DEFAULT FALSE,
    major VARCHAR(100),
    current_status TEXT,
    status_updated_at TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Tag（タグ）
CREATE TABLE IF NOT EXISTS public.tags ( -- タグの名前だけを管理するマスターリストです
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- member_tags（中間テーブル）
CREATE TABLE IF NOT EXISTS public.member_tags ( -- 「誰（member_id）」が「どのタグ（tag_id）」を持っているかを、IDのペアで記録します
    member_id VARCHAR(255) REFERENCES public.members(id) ON DELETE CASCADE,
    tag_id INT REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (member_id, tag_id)
);

-- Timetables（学校時間割マスター）
CREATE TABLE IF NOT EXISTS public.timetables (
    id SERIAL PRIMARY KEY,
    course_name VARCHAR(200) NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    period INT NOT NULL,
    target_major VARCHAR(100),
    target_grade INT,
    classroom VARCHAR(50)
);

-- private_timetables（個人時間割）
-- 以前の中間テーブル(member_timetables)の役割もここで果たします
DROP TABLE IF EXISTS member_timetables;

CREATE TABLE IF NOT EXISTS public.private_timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id VARCHAR(255) NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES public.timetables(id) ON DELETE SET NULL,

    custom_name TEXT,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 6), -- 
    location TEXT,
    year INTEGER NOT NULL,
    semester TEXT NOT NULL CHECK (semester IN ('1st', '2nd')), -- 
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT name_source_check CHECK (course_id IS NOT NULL OR custom_name IS NOT NULL)
);

-- Events（イベント）
CREATE TABLE IF NOT EXISTS public.events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_at TIMESTAMP NOT NULL,
    location VARCHAR(100),
    capacity INT,
    created_by VARCHAR(255) REFERENCES public.members(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- event_participants（イベント参加記録）
CREATE TABLE IF NOT EXISTS public.event_participants (
    event_id INT REFERENCES public.events(id) ON DELETE CASCADE,
    member_id VARCHAR(255) REFERENCES public.members(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, member_id)
);

-- トリガーとインデックス 

-- 更新時刻自動化
DROP TRIGGER IF EXISTS update_private_timetables_updated_at ON public.private_timetables; -- もし同じ名前のトリガーが既にあったら、一旦消します
CREATE TRIGGER update_private_timetables_updated_at
    BEFORE UPDATE ON public.private_timetables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 高速化
CREATE INDEX IF NOT EXISTS idx_private_timetables_member_id ON public.private_timetables(member_id);
CREATE INDEX IF NOT EXISTS idx_private_timetables_year_semester ON public.private_timetables(year, semester);
