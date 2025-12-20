// Database types for Supabase
// This file will be auto-generated when you run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          zitadel_id: string;
          student_id: string | null;
          name: string;
          school_email: string;
          gmail_address: string | null;
          enrollment_year: number;
          is_repeating: boolean;
          repeat_years: number | null;
          major: string | null;
          onboarding_completed: boolean;
          current_status: string | null;
          status_updated_at: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          zitadel_id: string;
          student_id?: string | null;
          name: string;
          school_email: string;
          gmail_address?: string | null;
          enrollment_year: number;
          is_repeating?: boolean;
          repeat_years?: number | null;
          major?: string | null;
          onboarding_completed?: boolean;
          current_status?: string | null;
          status_updated_at?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          zitadel_id?: string;
          student_id?: string | null;
          name?: string;
          school_email?: string;
          gmail_address?: string | null;
          enrollment_year?: number;
          is_repeating?: boolean;
          repeat_years?: number | null;
          major?: string | null;
          onboarding_completed?: boolean;
          current_status?: string | null;
          status_updated_at?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          category: "skill" | "interest";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: "skill" | "interest";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: "skill" | "interest";
          created_at?: string;
        };
        Relationships: [];
      };
      member_tags: {
        Row: {
          member_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          member_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          member_id?: string;
          tag_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_date: string;
          location: string | null;
          capacity: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_date: string;
          location?: string | null;
          capacity?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          location?: string | null;
          capacity?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      event_participants: {
        Row: {
          event_id: string;
          member_id: string;
          participated: boolean;
          registered_at: string;
        };
        Insert: {
          event_id: string;
          member_id: string;
          participated?: boolean;
          registered_at?: string;
        };
        Update: {
          event_id?: string;
          member_id?: string;
          participated?: boolean;
          registered_at?: string;
        };
        Relationships: [];
      };
      timetables: {
        Row: {
          id: string;
          member_id: string;
          day_of_week: number;
          period: number;
          course_name: string;
          semester: "spring" | "fall" | null;
          year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          day_of_week: number;
          period: number;
          course_name: string;
          semester?: "spring" | "fall" | null;
          year: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          day_of_week?: number;
          period?: number;
          course_name?: string;
          semester?: "spring" | "fall" | null;
          year?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      event_participation_stats: {
        Row: {
          event_id: string;
          title: string;
          event_date: string;
          capacity: number | null;
          registered_count: number;
          participated_count: number;
          available_spots: number | null;
        };
        Relationships: [];
      };
      timetable_by_grade_major: {
        Row: {
          member_id: string;
          member_name: string;
          current_grade: number;
          major: string | null;
          day_of_week: number;
          period: number;
          course_name: string;
          semester: "spring" | "fall" | null;
          year: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      calculate_current_grade: {
        Args: {
          enrollment_year: number;
          is_repeating: boolean;
        };
        Returns: number;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}
