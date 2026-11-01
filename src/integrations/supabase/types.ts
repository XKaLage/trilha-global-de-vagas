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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          authorization_note: string | null
          authorized_at: string | null
          authorized_by: string | null
          candidate_id: string
          confirmed_at: string | null
          created_at: string
          id: string
          job_id: string
          owner_id: string
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          authorization_note?: string | null
          authorized_at?: string | null
          authorized_by?: string | null
          candidate_id: string
          confirmed_at?: string | null
          created_at?: string
          id?: string
          job_id: string
          owner_id: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          authorization_note?: string | null
          authorized_at?: string | null
          authorized_by?: string | null
          candidate_id?: string
          confirmed_at?: string | null
          created_at?: string
          id?: string
          job_id?: string
          owner_id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_authorized_by_fkey"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_candidate_id_owner_id_fkey"
            columns: ["candidate_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id", "owner_id"]
          },
          {
            foreignKeyName: "applications_job_id_owner_id_fkey"
            columns: ["job_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id", "owner_id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          candidate_id: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          occurred_at: string
          owner_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          candidate_id?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          occurred_at?: string
          owner_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          candidate_id?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_candidate_owner"
            columns: ["candidate_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id", "owner_id"]
          },
          {
            foreignKeyName: "audit_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_certifications: {
        Row: {
          candidate_id: string
          expires_on: string | null
          id: string
          issued_on: string | null
          issuer: string | null
          name: string | null
          owner_id: string
        }
        Insert: {
          candidate_id: string
          expires_on?: string | null
          id?: string
          issued_on?: string | null
          issuer?: string | null
          name?: string | null
          owner_id?: string
        }
        Update: {
          candidate_id?: string
          expires_on?: string | null
          id?: string
          issued_on?: string | null
          issuer?: string | null
          name?: string | null
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_certifications_candidate_id_owner_id_fkey"
            columns: ["candidate_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id", "owner_id"]
          },
        ]
      }
      candidate_documents: {
        Row: {
          candidate_id: string
          created_at: string
          file_name: string
          id: string
          mime_type: string
          owner_id: string
          processing_state: string
          size_bytes: number
          storage_path: string
          version: number
        }
        Insert: {
          candidate_id: string
          created_at?: string
          file_name: string
          id?: string
          mime_type: string
          owner_id: string
          processing_state?: string
          size_bytes: number
          storage_path: string
          version?: number
        }
        Update: {
          candidate_id?: string
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string
          owner_id?: string
          processing_state?: string
          size_bytes?: number
          storage_path?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "candidate_documents_candidate_id_owner_id_fkey"
            columns: ["candidate_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id", "owner_id"]
          },
        ]
      }
      candidate_education: {
        Row: {
          candidate_id: string
          ended_on: string | null
          field_of_study: string | null
          id: string
          institution: string | null
          owner_id: string
          qualification: string | null
          started_on: string | null
        }
        Insert: {
          candidate_id: string
          ended_on?: string | null
          field_of_study?: string | null
          id?: string
          institution?: string | null
          owner_id?: string
          qualification?: string | null
          started_on?: string | null
        }
        Update: {
          candidate_id?: string
          ended_on?: string | null
          field_of_study?: string | null
          id?: string
          institution?: string | null
          owner_id?: string
          qualification?: string | null
          started_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_education_candidate_id_owner_id_fkey"
            columns: ["candidate_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id", "owner_id"]
          },
        ]
      }
      candidate_experiences: {
        Row: {
          candidate_id: string
          country: string | null
          description: string | null
          employer: string | null
          ended_on: string | null
          id: string
          owner_id: string
          started_on: string | null
          title: string | null
          verified_at: string | null
        }
        Insert: {
          candidate_id: string
          country?: string | null
          description?: string | null
          employer?: string | null
          ended_on?: string | null
          id?: string
          owner_id?: string
          started_on?: string | null
          title?: string | null
          verified_at?: string | null
        }
        Update: {
          candidate_id?: string
          country?: string | null
          description?: string | null
          employer?: string | null
          ended_on?: string | null
          id?: string
          owner_id?: string
          started_on?: string | null
          title?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_experiences_candidate_id_owner_id_fkey"
            columns: ["candidate_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id", "owner_id"]
          },
        ]
      }
      candidate_profiles: {
        Row: {
          availability_date: string | null
          created_at: string
          display_name: string | null
          id: string
          interest_countries: string[] | null
          interest_regions: string[] | null
          language_levels: Json
          owner_id: string
          professional_summary: string | null
          sponsorship_required: boolean | null
          visa_status: string | null
          work_authorization: string | null
        }
        Insert: {
          availability_date?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          interest_countries?: string[] | null
          interest_regions?: string[] | null
          language_levels?: Json
          owner_id: string
          professional_summary?: string | null
          sponsorship_required?: boolean | null
          visa_status?: string | null
          work_authorization?: string | null
        }
        Update: {
          availability_date?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          interest_countries?: string[] | null
          interest_regions?: string[] | null
          language_levels?: Json
          owner_id?: string
          professional_summary?: string | null
          sponsorship_required?: boolean | null
          visa_status?: string | null
          work_authorization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_profiles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_messages: {
        Row: {
          candidate_id: string
          classification: string
          gmail_message_id: string
          gmail_thread_id: string
          id: string
          job_id: string | null
          owner_id: string
          received_at: string | null
          sender: string | null
          subject: string | null
        }
        Insert: {
          candidate_id: string
          classification?: string
          gmail_message_id: string
          gmail_thread_id: string
          id?: string
          job_id?: string | null
          owner_id: string
          received_at?: string | null
          sender?: string | null
          subject?: string | null
        }
        Update: {
          candidate_id?: string
          classification?: string
          gmail_message_id?: string
          gmail_thread_id?: string
          id?: string
          job_id?: string | null
          owner_id?: string
          received_at?: string | null
          sender?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_messages_candidate_id_owner_id_fkey"
            columns: ["candidate_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id", "owner_id"]
          },
          {
            foreignKeyName: "employer_messages_job_id_owner_id_fkey"
            columns: ["job_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id", "owner_id"]
          },
        ]
      }
      job_evaluations: {
        Row: {
          candidate_id: string
          classification: string
          evaluated_at: string
          id: string
          job_id: string
          missing_data: Json
          owner_id: string
          reasons: Json
          rule_set_id: string
          score: number
        }
        Insert: {
          candidate_id: string
          classification: string
          evaluated_at?: string
          id?: string
          job_id: string
          missing_data?: Json
          owner_id: string
          reasons: Json
          rule_set_id: string
          score: number
        }
        Update: {
          candidate_id?: string
          classification?: string
          evaluated_at?: string
          id?: string
          job_id?: string
          missing_data?: Json
          owner_id?: string
          reasons?: Json
          rule_set_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_evaluations_candidate_id_owner_id_fkey"
            columns: ["candidate_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id", "owner_id"]
          },
          {
            foreignKeyName: "job_evaluations_job_id_owner_id_fkey"
            columns: ["job_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id", "owner_id"]
          },
          {
            foreignKeyName: "job_evaluations_rule_set_id_candidate_id_owner_id_fkey"
            columns: ["rule_set_id", "candidate_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "rule_sets"
            referencedColumns: ["id", "candidate_id", "owner_id"]
          },
        ]
      }
      job_sources: {
        Row: {
          allowed: boolean
          base_url: string
          configuration: Json
          created_at: string
          id: string
          name: string
        }
        Insert: {
          allowed?: boolean
          base_url: string
          configuration?: Json
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          allowed?: boolean
          base_url?: string
          configuration?: Json
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          canonical_url: string | null
          collected_at: string
          country: string | null
          currency: string | null
          dedup_key: string
          description: string | null
          employer: string
          experience_years: number | null
          fingerprint: string
          housing: boolean | null
          id: string
          international_eligible: boolean | null
          languages: string[] | null
          location: string | null
          original_url: string | null
          owner_id: string
          pay_max: number | null
          pay_min: number | null
          pay_period: string | null
          source_id: string | null
          title: string
          visa_sponsorship: boolean | null
          work_type: string | null
        }
        Insert: {
          canonical_url?: string | null
          collected_at?: string
          country?: string | null
          currency?: string | null
          dedup_key: string
          description?: string | null
          employer: string
          experience_years?: number | null
          fingerprint: string
          housing?: boolean | null
          id?: string
          international_eligible?: boolean | null
          languages?: string[] | null
          location?: string | null
          original_url?: string | null
          owner_id: string
          pay_max?: number | null
          pay_min?: number | null
          pay_period?: string | null
          source_id?: string | null
          title: string
          visa_sponsorship?: boolean | null
          work_type?: string | null
        }
        Update: {
          canonical_url?: string | null
          collected_at?: string
          country?: string | null
          currency?: string | null
          dedup_key?: string
          description?: string | null
          employer?: string
          experience_years?: number | null
          fingerprint?: string
          housing?: boolean | null
          id?: string
          international_eligible?: boolean | null
          languages?: string[] | null
          location?: string | null
          original_url?: string | null
          owner_id?: string
          pay_max?: number | null
          pay_min?: number | null
          pay_period?: string | null
          source_id?: string | null
          title?: string
          visa_sponsorship?: boolean | null
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "job_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      rule_sets: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          note: string | null
          owner_id: string
          rules: Json
          status: string
          version: number
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          note?: string | null
          owner_id: string
          rules: Json
          status?: string
          version: number
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          note?: string | null
          owner_id?: string
          rules?: Json
          status?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "rule_sets_candidate_id_owner_id_fkey"
            columns: ["candidate_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id", "owner_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          role: string
          user_id: string
        }
        Insert: {
          role: string
          user_id: string
        }
        Update: {
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      foundation_admin: { Args: never; Returns: boolean }
      foundation_authorize_application: {
        Args: { p_confirmation: boolean; p_id: string; p_note: string }
        Returns: undefined
      }
      foundation_health: { Args: never; Returns: Json }
      foundation_owned_candidate: { Args: never; Returns: string }
      foundation_record_evaluation: {
        Args: {
          p_classification: string
          p_job: string
          p_missing: Json
          p_reasons: Json
          p_rule: string
          p_score: number
        }
        Returns: string
      }
      foundation_save_job: { Args: { p_job: Json }; Returns: string }
      foundation_save_rules: {
        Args: { p_note: string; p_rules: Json }
        Returns: string
      }
      foundation_select_job: { Args: { p_job: string }; Returns: string }
      foundation_set_rule_status: {
        Args: { p_id: string; p_status: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
