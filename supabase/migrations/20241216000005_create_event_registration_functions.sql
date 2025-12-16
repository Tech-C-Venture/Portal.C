-- PostgreSQL関数: イベント参加登録
-- トランザクション処理により原子性を保証

-- register_for_event関数
CREATE OR REPLACE FUNCTION register_for_event(
  p_event_id UUID,
  p_member_id UUID
) RETURNS void AS $$
DECLARE
  v_capacity INTEGER;
  v_current_count INTEGER;
BEGIN
  -- イベント情報を取得（行ロック）
  SELECT capacity INTO v_capacity
  FROM events
  WHERE id = p_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found: %', p_event_id;
  END IF;

  -- 現在の参加者数を取得
  SELECT COUNT(*) INTO v_current_count
  FROM participations
  WHERE event_id = p_event_id;

  -- 定員チェック（NULLは無制限）
  IF v_capacity IS NOT NULL AND v_current_count >= v_capacity THEN
    RAISE EXCEPTION 'Event is full';
  END IF;

  -- 重複チェック
  IF EXISTS (
    SELECT 1 FROM participations
    WHERE event_id = p_event_id AND member_id = p_member_id
  ) THEN
    RAISE EXCEPTION 'Already registered for this event';
  END IF;

  -- 参加登録
  INSERT INTO participations (event_id, member_id)
  VALUES (p_event_id, p_member_id);
END;
$$ LANGUAGE plpgsql;

-- unregister_from_event関数
CREATE OR REPLACE FUNCTION unregister_from_event(
  p_event_id UUID,
  p_member_id UUID
) RETURNS void AS $$
BEGIN
  -- 参加登録解除
  DELETE FROM participations
  WHERE event_id = p_event_id AND member_id = p_member_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not registered for this event';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- コメント追加
COMMENT ON FUNCTION register_for_event IS 'イベント参加登録（トランザクション処理）';
COMMENT ON FUNCTION unregister_from_event IS 'イベント参加解除';
