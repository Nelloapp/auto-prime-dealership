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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          car_id: string | null
          created_at: string
          customer_name: string
          email: string | null
          id: string
          notes: string | null
          phone: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          car_id?: string | null
          created_at?: string
          customer_name: string
          email?: string | null
          id?: string
          notes?: string | null
          phone: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          car_id?: string | null
          created_at?: string
          customer_name?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      car_images: {
        Row: {
          car_id: string
          created_at: string
          id: string
          is_primary: boolean
          position: number
          url: string
        }
        Insert: {
          car_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          url: string
        }
        Update: {
          car_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_images_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          brand: string
          color: string | null
          created_at: string
          description: string | null
          engine_size: number | null
          featured: boolean
          fuel: Database["public"]["Enums"]["fuel_type"]
          gearbox: Database["public"]["Enums"]["gearbox_type"]
          id: string
          inspection_until: string | null
          km: number
          model: string
          owners: number | null
          power_hp: number | null
          previous_price: number | null
          price: number
          ready_delivery: boolean
          slug: string
          status: Database["public"]["Enums"]["car_status"]
          updated_at: string
          version: string | null
          warranty: string | null
          year: number
        }
        Insert: {
          brand: string
          color?: string | null
          created_at?: string
          description?: string | null
          engine_size?: number | null
          featured?: boolean
          fuel?: Database["public"]["Enums"]["fuel_type"]
          gearbox?: Database["public"]["Enums"]["gearbox_type"]
          id?: string
          inspection_until?: string | null
          km?: number
          model: string
          owners?: number | null
          power_hp?: number | null
          previous_price?: number | null
          price: number
          ready_delivery?: boolean
          slug: string
          status?: Database["public"]["Enums"]["car_status"]
          updated_at?: string
          version?: string | null
          warranty?: string | null
          year: number
        }
        Update: {
          brand?: string
          color?: string | null
          created_at?: string
          description?: string | null
          engine_size?: number | null
          featured?: boolean
          fuel?: Database["public"]["Enums"]["fuel_type"]
          gearbox?: Database["public"]["Enums"]["gearbox_type"]
          id?: string
          inspection_until?: string | null
          km?: number
          model?: string
          owners?: number | null
          power_hp?: number | null
          previous_price?: number | null
          price?: number
          ready_delivery?: boolean
          slug?: string
          status?: Database["public"]["Enums"]["car_status"]
          updated_at?: string
          version?: string | null
          warranty?: string | null
          year?: number
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          car_id: string | null
          contact: string
          created_at: string
          id: string
          message: string
          name: string
          status: Database["public"]["Enums"]["lead_status"]
        }
        Insert: {
          car_id?: string | null
          contact: string
          created_at?: string
          id?: string
          message: string
          name: string
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Update: {
          car_id?: string | null
          contact?: string
          created_at?: string
          id?: string
          message?: string
          name?: string
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string
          body: string
          car_label: string | null
          created_at: string
          id: string
          position: number
          published: boolean
          rating: number
          source: string | null
          updated_at: string
        }
        Insert: {
          author_name: string
          body: string
          car_label?: string | null
          created_at?: string
          id?: string
          position?: number
          published?: boolean
          rating?: number
          source?: string | null
          updated_at?: string
        }
        Update: {
          author_name?: string
          body?: string
          car_label?: string | null
          created_at?: string
          id?: string
          position?: number
          published?: boolean
          rating?: number
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_text: string
          address: string
          color_accent: string
          color_background: string
          color_header: string
          color_primary: string
          company_name: string
          custom_pages: Json
          email: string
          featured_title: string
          finance_default_term: number
          finance_disclaimer: string
          finance_down_default_pct: number
          finance_down_max_pct: number
          finance_enabled: boolean
          finance_tan: number
          finance_terms: Json
          finance_title: string
          font_body: string
          font_heading: string
          footer_logo_height: number
          footer_logo_path: string
          footer_note: string
          hero_cta_label: string
          hero_eyebrow: string
          hero_image_path: string
          hero_logo_height: number
          hero_show_logo: boolean
          hero_subtitle: string
          hero_title: string
          how_steps: Json
          id: boolean
          logo_height: number
          logo_path: string
          nav_items: Json
          opening_hours: string
          owner_name: string
          phone: string
          pluses: Json
          radius_px: number
          show_admin_link: boolean
          show_featured: boolean
          show_how_it_works: boolean
          show_pluses: boolean
          show_reviews: boolean
          social_facebook: string
          social_instagram: string
          social_tiktok: string
          social_youtube: string
          updated_at: string
          vat_number: string
          whatsapp: string
        }
        Insert: {
          about_text?: string
          address?: string
          color_accent?: string
          color_background?: string
          color_header?: string
          color_primary?: string
          company_name?: string
          custom_pages?: Json
          email?: string
          featured_title?: string
          finance_default_term?: number
          finance_disclaimer?: string
          finance_down_default_pct?: number
          finance_down_max_pct?: number
          finance_enabled?: boolean
          finance_tan?: number
          finance_terms?: Json
          finance_title?: string
          font_body?: string
          font_heading?: string
          footer_logo_height?: number
          footer_logo_path?: string
          footer_note?: string
          hero_cta_label?: string
          hero_eyebrow?: string
          hero_image_path?: string
          hero_logo_height?: number
          hero_show_logo?: boolean
          hero_subtitle?: string
          hero_title?: string
          how_steps?: Json
          id?: boolean
          logo_height?: number
          logo_path?: string
          nav_items?: Json
          opening_hours?: string
          owner_name?: string
          phone?: string
          pluses?: Json
          radius_px?: number
          show_admin_link?: boolean
          show_featured?: boolean
          show_how_it_works?: boolean
          show_pluses?: boolean
          show_reviews?: boolean
          social_facebook?: string
          social_instagram?: string
          social_tiktok?: string
          social_youtube?: string
          updated_at?: string
          vat_number?: string
          whatsapp?: string
        }
        Update: {
          about_text?: string
          address?: string
          color_accent?: string
          color_background?: string
          color_header?: string
          color_primary?: string
          company_name?: string
          custom_pages?: Json
          email?: string
          featured_title?: string
          finance_default_term?: number
          finance_disclaimer?: string
          finance_down_default_pct?: number
          finance_down_max_pct?: number
          finance_enabled?: boolean
          finance_tan?: number
          finance_terms?: Json
          finance_title?: string
          font_body?: string
          font_heading?: string
          footer_logo_height?: number
          footer_logo_path?: string
          footer_note?: string
          hero_cta_label?: string
          hero_eyebrow?: string
          hero_image_path?: string
          hero_logo_height?: number
          hero_show_logo?: boolean
          hero_subtitle?: string
          hero_title?: string
          how_steps?: Json
          id?: boolean
          logo_height?: number
          logo_path?: string
          nav_items?: Json
          opening_hours?: string
          owner_name?: string
          phone?: string
          pluses?: Json
          radius_px?: number
          show_admin_link?: boolean
          show_featured?: boolean
          show_how_it_works?: boolean
          show_pluses?: boolean
          show_reviews?: boolean
          social_facebook?: string
          social_instagram?: string
          social_tiktok?: string
          social_youtube?: string
          updated_at?: string
          vat_number?: string
          whatsapp?: string
        }
        Relationships: []
      }
      trade_in_requests: {
        Row: {
          brand: string
          conditions: string | null
          created_at: string
          customer_name: string
          email: string | null
          fuel: Database["public"]["Enums"]["fuel_type"] | null
          id: string
          km: number
          model: string
          notes: string | null
          phone: string
          photos: string[]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          year: number
        }
        Insert: {
          brand: string
          conditions?: string | null
          created_at?: string
          customer_name: string
          email?: string | null
          fuel?: Database["public"]["Enums"]["fuel_type"] | null
          id?: string
          km: number
          model: string
          notes?: string | null
          phone: string
          photos?: string[]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          year: number
        }
        Update: {
          brand?: string
          conditions?: string | null
          created_at?: string
          customer_name?: string
          email?: string | null
          fuel?: Database["public"]["Enums"]["fuel_type"] | null
          id?: string
          km?: number
          model?: string
          notes?: string | null
          phone?: string
          photos?: string[]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      attach_trade_in_photos: {
        Args: { _id: string; _photos: string[] }
        Returns: boolean
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
      appointment_status:
        | "in_attesa"
        | "confermato"
        | "rifiutato"
        | "riprogrammato"
      car_status: "disponibile" | "venduta" | "riservata" | "in_arrivo"
      fuel_type:
        | "benzina"
        | "diesel"
        | "gpl"
        | "metano"
        | "ibrida"
        | "elettrica"
      gearbox_type: "manuale" | "automatico"
      lead_status: "nuovo" | "in_lavorazione" | "chiuso"
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
      appointment_status: [
        "in_attesa",
        "confermato",
        "rifiutato",
        "riprogrammato",
      ],
      car_status: ["disponibile", "venduta", "riservata", "in_arrivo"],
      fuel_type: ["benzina", "diesel", "gpl", "metano", "ibrida", "elettrica"],
      gearbox_type: ["manuale", "automatico"],
      lead_status: ["nuovo", "in_lavorazione", "chiuso"],
    },
  },
} as const
