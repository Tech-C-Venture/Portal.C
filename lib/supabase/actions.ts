import { createClient } from "./client";

/**
 * ログインしているユーザーのIDに紐づく「自分用時間割」を取得する関数
 */
export async function fetchMyTimetable(userId: string) {
  // client.tsで定義された接続設定を呼び出します
  const supabase = createClient();

  const { data, error } = await supabase
    .from("private_timetables") // あなたが作った個人テーブル
    .select(`
      *,
      timetables (*) 
    `) // timetablesテーブルの情報も一緒に持ってくる（結合）
    .eq("member_id", userId); // ここで「自分のデータだけ」に絞り込む

  if (error) {
    console.error("データ取得エラー:", error.message);
    return null;
  }

  return data;
}
