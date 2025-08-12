export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_market_intel_cache: {
        Row: {
          created_at: string
          data: Json
          expires_at: string
          key: string
          source: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          data: Json
          expires_at: string
          key: string
          source?: string
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          data?: Json
          expires_at?: string
          key?: string
          source?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      latest_token_prices: {
        Row: {
          change_1h: number | null
          change_24h: number | null
          change_7d: number | null
          coin_gecko_id: string | null
          data: Json | null
          image: string | null
          market_cap: number | null
          name: string | null
          price: number | null
          symbol: string
          updated_at: string
        }
        Insert: {
          change_1h?: number | null
          change_24h?: number | null
          change_7d?: number | null
          coin_gecko_id?: string | null
          data?: Json | null
          image?: string | null
          market_cap?: number | null
          name?: string | null
          price?: number | null
          symbol: string
          updated_at?: string
        }
        Update: {
          change_1h?: number | null
          change_24h?: number | null
          change_7d?: number | null
          coin_gecko_id?: string | null
          data?: Json | null
          image?: string | null
          market_cap?: number | null
          name?: string | null
          price?: number | null
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      limit_orders: {
        Row: {
          amount: number
          chain: string
          created_at: string
          evm_from_token: string | null
          evm_to_token: string | null
          executed_at: string | null
          id: string
          limit_price: number
          side: string
          sol_mint: string | null
          status: string
          symbol: string
          triggered_at: string | null
          tx_hash: string | null
          updated_at: string
          user_address: string
        }
        Insert: {
          amount: number
          chain: string
          created_at?: string
          evm_from_token?: string | null
          evm_to_token?: string | null
          executed_at?: string | null
          id?: string
          limit_price: number
          side: string
          sol_mint?: string | null
          status?: string
          symbol: string
          triggered_at?: string | null
          tx_hash?: string | null
          updated_at?: string
          user_address: string
        }
        Update: {
          amount?: number
          chain?: string
          created_at?: string
          evm_from_token?: string | null
          evm_to_token?: string | null
          executed_at?: string | null
          id?: string
          limit_price?: number
          side?: string
          sol_mint?: string | null
          status?: string
          symbol?: string
          triggered_at?: string | null
          tx_hash?: string | null
          updated_at?: string
          user_address?: string
        }
        Relationships: []
      }
      market_snapshots: {
        Row: {
          created_at: string
          data: Json
          id: string
          page_count: number
          snapshot_time: string
          source: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          page_count?: number
          snapshot_time?: string
          source?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          page_count?: number
          snapshot_time?: string
          source?: string
        }
        Relationships: []
      }
      meme_tokens_cache: {
        Row: {
          category: string
          created_at: string
          data: Json
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          data: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      news_cache: {
        Row: {
          created_at: string
          data: Json
          expires_at: string
          key: string
        }
        Insert: {
          created_at?: string
          data: Json
          expires_at: string
          key: string
        }
        Update: {
          created_at?: string
          data?: Json
          expires_at?: string
          key?: string
        }
        Relationships: []
      }
      order_history: {
        Row: {
          base_amount: number | null
          base_mint: string | null
          chain: string
          created_at: string
          event_type: string
          fee_quote: number | null
          id: string
          meta: Json | null
          price_quote: number | null
          price_usd: number | null
          quote_amount: number | null
          quote_mint: string | null
          side: string | null
          source: string | null
          symbol: string | null
          tx_hash: string | null
          updated_at: string
          user_address: string
        }
        Insert: {
          base_amount?: number | null
          base_mint?: string | null
          chain?: string
          created_at?: string
          event_type: string
          fee_quote?: number | null
          id?: string
          meta?: Json | null
          price_quote?: number | null
          price_usd?: number | null
          quote_amount?: number | null
          quote_mint?: string | null
          side?: string | null
          source?: string | null
          symbol?: string | null
          tx_hash?: string | null
          updated_at?: string
          user_address: string
        }
        Update: {
          base_amount?: number | null
          base_mint?: string | null
          chain?: string
          created_at?: string
          event_type?: string
          fee_quote?: number | null
          id?: string
          meta?: Json | null
          price_quote?: number | null
          price_usd?: number | null
          quote_amount?: number | null
          quote_mint?: string | null
          side?: string | null
          source?: string | null
          symbol?: string | null
          tx_hash?: string | null
          updated_at?: string
          user_address?: string
        }
        Relationships: []
      }
      tokens_catalog: {
        Row: {
          address: string
          chain: string
          first_seen_at: string
          image: string | null
          last_meta: Json | null
          last_price: Json | null
          last_seen_at: string
          name: string | null
          symbol: string | null
        }
        Insert: {
          address: string
          chain?: string
          first_seen_at?: string
          image?: string | null
          last_meta?: Json | null
          last_price?: Json | null
          last_seen_at?: string
          name?: string | null
          symbol?: string | null
        }
        Update: {
          address?: string
          chain?: string
          first_seen_at?: string
          image?: string | null
          last_meta?: Json | null
          last_price?: Json | null
          last_seen_at?: string
          name?: string | null
          symbol?: string | null
        }
        Relationships: []
      }
      trading_wallets: {
        Row: {
          acknowledged_backup: boolean
          created_at: string
          id: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          acknowledged_backup?: boolean
          created_at?: string
          id?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          acknowledged_backup?: boolean
          created_at?: string
          id?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          chain: string
          created_at: string | null
          id: string
          user_id: string
          verified_at: string | null
          wallet_address: string
        }
        Insert: {
          chain: string
          created_at?: string | null
          id?: string
          user_id: string
          verified_at?: string | null
          wallet_address: string
        }
        Update: {
          chain?: string
          created_at?: string | null
          id?: string
          user_id?: string
          verified_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      wallet_verification_proofs: {
        Row: {
          address: string
          chain: string
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          address: string
          chain: string
          created_at?: string
          expires_at?: string
          id?: string
          user_id: string
        }
        Update: {
          address?: string
          chain?: string
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_owns_wallet: {
        Args: { wallet_addr: string }
        Returns: boolean
      }
      verified_by_recent_proof: {
        Args: { p_user_id: string; p_address: string; p_chain: string }
        Returns: boolean
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
    Enums: {},
  },
} as const
