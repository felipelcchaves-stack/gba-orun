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
      categories: {
        Row: {
          created_at: string
          description: string
          display_order: number
          icon_name: string
          id: string
          image_url: string | null
          is_active: boolean
          key: string
          label: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          icon_name?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          key: string
          label: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          icon_name?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          key?: string
          label?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          user_id?: string
        }
        Relationships: []
      }
      community_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      guidance_bubbles: {
        Row: {
          audio_url: string | null
          created_at: string
          id: string
          is_active: boolean
          message: string
          point_key: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          point_key: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          point_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      ire_ibi_types: {
        Row: {
          category: string
          created_at: string
          description: string
          display_order: number
          guidance_audio_url: string | null
          guidance_message: string
          id: string
          is_active: boolean
          name: string
          offering_id: string | null
          ritual_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string
          display_order?: number
          guidance_audio_url?: string | null
          guidance_message?: string
          id?: string
          is_active?: boolean
          name: string
          offering_id?: string | null
          ritual_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          display_order?: number
          guidance_audio_url?: string | null
          guidance_message?: string
          id?: string
          is_active?: boolean
          name?: string
          offering_id?: string | null
          ritual_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ire_ibi_types_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ire_ibi_types_ritual_id_fkey"
            columns: ["ritual_id"]
            isOneToOne: false
            referencedRelation: "rituals"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_tasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          guidance_audio_url: string | null
          guidance_message: string | null
          id: string
          journey_id: string
          offering_id: string | null
          ritual_id: string | null
          task_title: string
          task_type: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          guidance_audio_url?: string | null
          guidance_message?: string | null
          id?: string
          journey_id: string
          offering_id?: string | null
          ritual_id?: string | null
          task_title: string
          task_type: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          guidance_audio_url?: string | null
          guidance_message?: string | null
          id?: string
          journey_id?: string
          offering_id?: string | null
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
            foreignKeyName: "journey_tasks_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
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
      offerings: {
        Row: {
          audio_url: string | null
          category: string
          created_at: string
          description: string
          display_order: number
          id: string
          image_url: string | null
          ingredients: string
          instructions: string
          is_premium: boolean
          title: string
        }
        Insert: {
          audio_url?: string | null
          category?: string
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_url?: string | null
          ingredients?: string
          instructions?: string
          is_premium?: boolean
          title: string
        }
        Update: {
          audio_url?: string | null
          category?: string
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_url?: string | null
          ingredients?: string
          instructions?: string
          is_premium?: boolean
          title?: string
        }
        Relationships: []
      }
      oracle_configs: {
        Row: {
          color_type: string
          default_ire_ibi: string
          description_ibi: string
          description_ire: string
          display_order: number
          guidance_audio_url: string | null
          guidance_message: string
          id: string
          meaning: string
          name: string
          result_key: string
        }
        Insert: {
          color_type?: string
          default_ire_ibi?: string
          description_ibi?: string
          description_ire?: string
          display_order?: number
          guidance_audio_url?: string | null
          guidance_message?: string
          id?: string
          meaning?: string
          name: string
          result_key: string
        }
        Update: {
          color_type?: string
          default_ire_ibi?: string
          description_ibi?: string
          description_ire?: string
          display_order?: number
          guidance_audio_url?: string | null
          guidance_message?: string
          id?: string
          meaning?: string
          name?: string
          result_key?: string
        }
        Relationships: []
      }
      oracle_flow_edges: {
        Row: {
          flow_id: string
          id: string
          label: string
          source_handle: string
          source_node_id: string
          target_node_id: string
        }
        Insert: {
          flow_id: string
          id?: string
          label?: string
          source_handle?: string
          source_node_id: string
          target_node_id: string
        }
        Update: {
          flow_id?: string
          id?: string
          label?: string
          source_handle?: string
          source_node_id?: string
          target_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oracle_flow_edges_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "oracle_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oracle_flow_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "oracle_flow_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oracle_flow_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "oracle_flow_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      oracle_flow_nodes: {
        Row: {
          config: Json
          flow_id: string
          id: string
          label: string
          node_type: string
          position_x: number
          position_y: number
        }
        Insert: {
          config?: Json
          flow_id: string
          id?: string
          label?: string
          node_type: string
          position_x?: number
          position_y?: number
        }
        Update: {
          config?: Json
          flow_id?: string
          id?: string
          label?: string
          node_type?: string
          position_x?: number
          position_y?: number
        }
        Relationships: [
          {
            foreignKeyName: "oracle_flow_nodes_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "oracle_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      oracle_flows: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          updated_at?: string
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
          guidance_audio_url: string | null
          guidance_message: string | null
          id: string
          intention: string | null
          ire_or_ibi: string | null
          offering_id: string | null
          oracle_result_key: string | null
          ritual_id: string | null
          task_title: string
          task_type: string
        }
        Insert: {
          category: string
          condition?: string
          display_order?: number
          guidance_audio_url?: string | null
          guidance_message?: string | null
          id?: string
          intention?: string | null
          ire_or_ibi?: string | null
          offering_id?: string | null
          oracle_result_key?: string | null
          ritual_id?: string | null
          task_title: string
          task_type: string
        }
        Update: {
          category?: string
          condition?: string
          display_order?: number
          guidance_audio_url?: string | null
          guidance_message?: string | null
          id?: string
          intention?: string | null
          ire_or_ibi?: string | null
          offering_id?: string | null
          oracle_result_key?: string | null
          ritual_id?: string | null
          task_title?: string
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "oracle_task_templates_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
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
          avatar_url: string | null
          birth_date: string | null
          care_day: number | null
          created_at: string
          device_changed_at: string | null
          device_id: string | null
          display_name: string | null
          gender: string | null
          guru_id: string | null
          guru_subscription_id: string | null
          id: string
          ifa_status: string | null
          is_premium: boolean
          onboarding_completed: boolean
          religion: string | null
          subscription_expires_at: string | null
          subscription_plan_id: string | null
          subscription_started_at: string | null
          subscription_status: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          care_day?: number | null
          created_at?: string
          device_changed_at?: string | null
          device_id?: string | null
          display_name?: string | null
          gender?: string | null
          guru_id?: string | null
          guru_subscription_id?: string | null
          id?: string
          ifa_status?: string | null
          is_premium?: boolean
          onboarding_completed?: boolean
          religion?: string | null
          subscription_expires_at?: string | null
          subscription_plan_id?: string | null
          subscription_started_at?: string | null
          subscription_status?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          care_day?: number | null
          created_at?: string
          device_changed_at?: string | null
          device_id?: string | null
          display_name?: string | null
          gender?: string | null
          guru_id?: string | null
          guru_subscription_id?: string | null
          id?: string
          ifa_status?: string | null
          is_premium?: boolean
          onboarding_completed?: boolean
          religion?: string | null
          subscription_expires_at?: string | null
          subscription_plan_id?: string | null
          subscription_started_at?: string | null
          subscription_status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_clicks: {
        Row: {
          clicked_at: string
          id: string
          promotion_id: string
          user_id: string
        }
        Insert: {
          clicked_at?: string
          id?: string
          promotion_id: string
          user_id: string
        }
        Update: {
          clicked_at?: string
          id?: string
          promotion_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_clicks_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          banner_url: string | null
          checkout_url: string
          created_at: string
          description: string | null
          display_order: number
          force_show_all: boolean
          id: string
          is_active: boolean
          show_on_home: boolean
          target_knowledge_gaps: string[]
          title: string
        }
        Insert: {
          banner_url?: string | null
          checkout_url: string
          created_at?: string
          description?: string | null
          display_order?: number
          force_show_all?: boolean
          id?: string
          is_active?: boolean
          show_on_home?: boolean
          target_knowledge_gaps?: string[]
          title: string
        }
        Update: {
          banner_url?: string | null
          checkout_url?: string
          created_at?: string
          description?: string | null
          display_order?: number
          force_show_all?: boolean
          id?: string
          is_active?: boolean
          show_on_home?: boolean
          target_knowledge_gaps?: string[]
          title?: string
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
      subscription_plans: {
        Row: {
          billing_period: string
          created_at: string
          description: string | null
          display_order: number
          guru_checkout_url: string | null
          id: string
          is_active: boolean
          name: string
          price: number
        }
        Insert: {
          billing_period?: string
          created_at?: string
          description?: string | null
          display_order?: number
          guru_checkout_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          price: number
        }
        Update: {
          billing_period?: string
          created_at?: string
          description?: string | null
          display_order?: number
          guru_checkout_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
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
      user_knowledge: {
        Row: {
          created_at: string
          id: string
          ifa_status: string | null
          knows_ebo: boolean
          knows_egbe_orun: boolean
          knows_iyami: boolean
          knows_obi: boolean
          knows_ori: boolean
          onboarding_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ifa_status?: string | null
          knows_ebo?: boolean
          knows_egbe_orun?: boolean
          knows_iyami?: boolean
          knows_obi?: boolean
          knows_ori?: boolean
          onboarding_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ifa_status?: string | null
          knows_ebo?: boolean
          knows_egbe_orun?: boolean
          knows_iyami?: boolean
          knows_obi?: boolean
          knows_ori?: boolean
          onboarding_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reviews: {
        Row: {
          approved: boolean
          created_at: string
          display_name: string
          id: string
          rating: number
          review_text: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          display_name: string
          id?: string
          rating: number
          review_text: string
          user_id: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          display_name?: string
          id?: string
          rating?: number
          review_text?: string
          user_id?: string
        }
        Relationships: []
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
      admin_get_knowledge_stats: {
        Args: never
        Returns: {
          not_knows_ebo: number
          not_knows_egbe_orun: number
          not_knows_iyami: number
          not_knows_obi: number
          not_knows_ori: number
          total_babalawo: number
          total_iyanifa: number
          total_omo_ifa: number
          total_onboarded: number
          total_sem_ifa: number
        }[]
      }
      admin_get_stats: {
        Args: never
        Returns: {
          active_subscribers: number
          consultations_today: number
          free_users: number
          overdue_users: number
          premium_users: number
          promo_clicks_today: number
          total_consultations: number
          total_posts: number
          total_promo_clicks: number
          total_replies: number
          total_rituals: number
          total_users: number
        }[]
      }
      admin_list_profiles: {
        Args: never
        Returns: {
          birth_date: string
          care_day: number
          created_at: string
          device_changed_at: string
          device_id: string
          display_name: string
          email: string
          gender: string
          guru_id: string
          guru_subscription_id: string
          id: string
          ifa_status: string
          is_premium: boolean
          knows_ebo: boolean
          knows_egbe_orun: boolean
          knows_iyami: boolean
          knows_obi: boolean
          knows_ori: boolean
          onboarding_completed: boolean
          religion: string
          subscription_expires_at: string
          subscription_plan_id: string
          subscription_started_at: string
          subscription_status: string
          user_id: string
        }[]
      }
      get_user_id_by_email: { Args: { p_email: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reset_user_journey: { Args: { p_user_id: string }; Returns: undefined }
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
