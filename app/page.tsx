import { redirect } from "next/navigation";

export default function Home() {
  // ログイン後、イベント一覧にリダイレクト
  redirect("/events");
}
