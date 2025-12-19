/**
 * DatabaseClient
 * Supabaseクライアントのラッパー
 */

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createClient as createSupabaseAdminClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export class DatabaseClient {
  /**
   * サーバーコンポーネント用のクライアント取得
   * RLSが有効
   */
  static async getServerClient(): Promise<SupabaseClient<Database>> {
    const cookieStore = await cookies();

    return createSupabaseServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    ) as unknown as SupabaseClient<Database>;
  }

  /**
   * 管理者用のクライアント取得
   * RLSをバイパス（サービスロールキー使用）
   */
  static getAdminClient(): SupabaseClient<Database> {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }

    return createSupabaseAdminClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  /**
   * 環境変数の検証
   */
  static validateEnvironment() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    }
  }
}

// 起動時に環境変数を検証（ビルド時はスキップ）
if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE !== 'phase-production-build') {
  // Only validate in development or runtime (not during build)
  try {
    DatabaseClient.validateEnvironment();
  } catch {
    // Ignore validation errors during build
  }
}
