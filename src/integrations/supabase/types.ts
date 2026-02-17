export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_ritual_links: {
        Row: {
          app_point: string
          created_at: string
          id: string
          ritual_id: string | null
        }
        Insert: {
          app_point: string
          created_at?: string
          id?: string
          ritual_id?: string | null
        }
        Update: {
          app_point?: string
          created_at?: string
          id?: string
          ritual_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_ritual_links_ritual_id_fkey"
            columns: ["ritual_id"]
            isOneToOne: false
            referencedRelation: "rituals"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      journey_tasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          journey_id: string
          ritual_id: string | null
          task_title: string
          task_type: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          journey_id: string
          ritual_id?: string | null
          task_title: string
          task_type: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          journey_id?: string
          ritual_id?: string | null
          task_title?: string
          task_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_tasks_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "user_journey"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_tasks_ritual_id_fkey"
            columns: ["ritual_id"]
            isOneToOne: false
            referencedRelation: "rituals"
            referencedColumns: ["id"]
          },
        ]
      }
      oracle_configs: {
        Row: {
          color_type: string
          description_ibi: string
          description_ire: string
          display_order: number
          id: string
          meaning: string
          name: string
          result_key: string
        }
        Insert: {
          color_type?: string
          description_ibi?: string
          description_ire?: string
          display_order?: number
          id?: string
          meaning?: string
          name: string
          result_key: string
        }
        Update: {
          color_type?: string
          description_ibi?: string
          description_ire?: string
          display_order?: number
          id?: string
          meaning?: string
          name?: string
          result_key?: string
        }
        Relationships: []
      }
      oracle_meanings: {
        Row: {
          action: string
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          action?: string
          created_at?: string
          description?: string
          id?: string
          name: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      oracle_step_texts: {
        Row: {
          description: string
          id: string
          step_key: string
          title: string
        }
        Insert: {
          description?: string
          id?: string
          step_key: string
          title?: string
        }
        Update: {
          description?: string
          id?: string
          step_key?: string
          title?: string
        }
        Relationships: []
      }
      oracle_task_templates: {
        Row: {
          category: string
          condition: string
          display_order: number
          id: string
          ire_or_ibi: string | null
          oracle_result_key: string | null
          ritual_id: string | null
          task_title: string
          task_type: string
        }
        Insert: {
          category: string
          condition?: string
          display_order?: number
          id?: string
          ire_or_ibi?: string | null
          oracle_result_key?: string | null
          ritual_id?: string | null
          task_title: string
          task_type: string
        }
        Update: {
          category?: string
          condition?: string
          display_order?: number
          id?: string
          ire_or_ibi?: string | null
          oracle_result_key?: string | null
          ritual_id?: string | null
          task_title?: string
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "oracle_task_templates_ritual_id_fkey"
            columns: ["ritual_id"]
            isOneToOne: false
            referencedRelation: "rituals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          care_day: number | null
          created_at: string
          display_name: string | null
          guru_id: string | null
          id: string
          is_premium: boolean
          religion: string | null
          user_id: string
        }
        Insert: {
          care_day?: number | null
          created_at?: string
          display_name?: string | null
          guru_id?: string | null
          id?: string
          is_premium?: boolean
          religion?: string | null
          user_id: string
        }
        Update: {
          care_day?: number | null
          created_at?: string
          display_name?: string | null
          guru_id?: string | null
          id?: string
          is_premium?: boolean
          religion?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rituals: {
        Row: {
          audio_url: string | null
          category: string
          content_full: string
          created_at: string
          id: string
          image_url: string | null
          is_premium: boolean
          title: string
          trigger_oracle: string | null
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          category?: string
          content_full?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_premium?: boolean
          title: string
          trigger_oracle?: string | null
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          category?: string
          content_full?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_premium?: boolean
          title?: string
          trigger_oracle?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_key: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_key: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_key?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_journey: {
        Row: {
          completed: boolean
          completed_at: string | null
          context: string | null
          created_at: string
          id: string
          notes: string | null
          oracle_result: string
          suggested_ritual_id: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          context?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          oracle_result: string
          suggested_ritual_id?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          context?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          oracle_result?: string
          suggested_ritual_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_suggested_ritual_id_fkey"
            columns: ["suggested_ritual_id"]
            isOneToOne: false
            referencedRelation: "rituals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          id: string
          last_active: string
          oracle_throws: number
          rituals_read: number
          streak_days: number
          user_id: string
          xp_total: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_active?: string
          oracle_throws?: number
          rituals_read?: number
          streak_days?: number
          user_id: string
          xp_total?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_active?: string
          oracle_throws?: number
          rituals_read?: number
          streak_days?: number
          user_id?: string
          xp_total?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_stats: {
        Args: never
        Returns: {
          consultations_today: number
          free_users: number
          premium_users: number
          total_consultations: number
          total_rituals: number
          total_users: number
        }[]
      }
      admin_list_profiles: {
        Args: never
        Returns: {
          care_day: number
          created_at: string
          display_name: string
          email: string
          guru_id: string
          id: string
          is_premium: boolean
          religion: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
