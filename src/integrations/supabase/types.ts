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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          blockchain_registro: string | null
          created_at: string
          data_hora_login: string
          gps_location: Json | null
          id: string
          ip_address: string | null
          marca_aparelho: string | null
          modelo_aparelho: string | null
          user_id: string | null
        }
        Insert: {
          blockchain_registro?: string | null
          created_at?: string
          data_hora_login?: string
          gps_location?: Json | null
          id?: string
          ip_address?: string | null
          marca_aparelho?: string | null
          modelo_aparelho?: string | null
          user_id?: string | null
        }
        Update: {
          blockchain_registro?: string | null
          created_at?: string
          data_hora_login?: string
          gps_location?: Json | null
          id?: string
          ip_address?: string | null
          marca_aparelho?: string | null
          modelo_aparelho?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_approval_codes: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          created_by: string | null
          descricao: string | null
          id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          alert_type: string | null
          bird_id: string | null
          confidence: number | null
          created_at: string | null
          id: string
          severity: string | null
          timestamp_in_video: string | null
          user_id: string | null
          video_id: string | null
        }
        Insert: {
          alert_type?: string | null
          bird_id?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          severity?: string | null
          timestamp_in_video?: string | null
          user_id?: string | null
          video_id?: string | null
        }
        Update: {
          alert_type?: string | null
          bird_id?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          severity?: string | null
          timestamp_in_video?: string | null
          user_id?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_bird_id_fkey"
            columns: ["bird_id"]
            isOneToOne: false
            referencedRelation: "birds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_data: {
        Row: {
          created_at: string
          date: string
          id: string
          platform: string
          release_id: string
          revenue: number
          streams: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          platform: string
          release_id: string
          revenue?: number
          streams?: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          platform?: string
          release_id?: string
          revenue?: number
          streams?: number
        }
        Relationships: [
          {
            foreignKeyName: "analytics_data_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string | null
          bird_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          user_id: string | null
          vet_name: string | null
        }
        Insert: {
          appointment_date?: string | null
          bird_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id?: string | null
          vet_name?: string | null
        }
        Update: {
          appointment_date?: string | null
          bird_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id?: string | null
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_bird_id_fkey"
            columns: ["bird_id"]
            isOneToOne: false
            referencedRelation: "birds"
            referencedColumns: ["id"]
          },
        ]
      }
      birds: {
        Row: {
          age: string | null
          color: string | null
          created_at: string | null
          custom_name: string | null
          detected_name: string
          id: string
          image_path: string | null
          notes: string | null
          species: string | null
          user_id: string | null
        }
        Insert: {
          age?: string | null
          color?: string | null
          created_at?: string | null
          custom_name?: string | null
          detected_name: string
          id?: string
          image_path?: string | null
          notes?: string | null
          species?: string | null
          user_id?: string | null
        }
        Update: {
          age?: string | null
          color?: string | null
          created_at?: string | null
          custom_name?: string | null
          detected_name?: string
          id?: string
          image_path?: string | null
          notes?: string | null
          species?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          challenge_id: string
          id: string
          project_id: string | null
          submission_url: string
          submitted_at: string
          user_id: string
          votes: number
        }
        Insert: {
          challenge_id: string
          id?: string
          project_id?: string | null
          submission_url: string
          submitted_at?: string
          user_id: string
          votes?: number
        }
        Update: {
          challenge_id?: string
          id?: string
          project_id?: string | null
          submission_url?: string
          submitted_at?: string
          user_id?: string
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          id: string
          prize: string | null
          start_date: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          prize?: string | null
          start_date: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          prize?: string | null
          start_date?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      collaborations: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          proposed_role: string | null
          proposer_id: string
          recipient_id: string
          status: string
          terms: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          proposed_role?: string | null
          proposer_id: string
          recipient_id: string
          status?: string
          terms?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          proposed_role?: string | null
          proposer_id?: string
          recipient_id?: string
          status?: string
          terms?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      dj_sessions: {
        Row: {
          created_at: string
          duration: number | null
          id: string
          session_data: Json | null
          session_name: string
          tracks_mixed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          id?: string
          session_data?: Json | null
          session_name: string
          tracks_mixed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          id?: string
          session_data?: Json | null
          session_name?: string
          tracks_mixed?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exports: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          platform: string | null
          status: string | null
          track_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          platform?: string | null
          status?: string | null
          track_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          platform?: string | null
          status?: string | null
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exports_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          room_id: string
          timestamp_ms: number | null
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          room_id: string
          timestamp_ms?: number | null
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          room_id?: string
          timestamp_ms?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_comments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "feedback_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_rooms: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          project_id: string
          room_name: string
          status: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          project_id: string
          room_name: string
          status?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          project_id?: string
          room_name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_rooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_pending: {
        Row: {
          blockchain_registro: string | null
          created_at: string
          data_geracao: string
          id: string
          status: string
          tipo: string
          updated_at: string
          user_id: string | null
          valor: number
          vencimento: string
          visivel_somente_adm: boolean
        }
        Insert: {
          blockchain_registro?: string | null
          created_at?: string
          data_geracao?: string
          id?: string
          status?: string
          tipo: string
          updated_at?: string
          user_id?: string | null
          valor: number
          vencimento: string
          visivel_somente_adm?: boolean
        }
        Update: {
          blockchain_registro?: string | null
          created_at?: string
          data_geracao?: string
          id?: string
          status?: string
          tipo?: string
          updated_at?: string
          user_id?: string | null
          valor?: number
          vencimento?: string
          visivel_somente_adm?: boolean
        }
        Relationships: []
      }
      health_checks: {
        Row: {
          created_at: string
          details: Json | null
          error_message: string | null
          id: string
          response_time_ms: number
          service_name: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          response_time_ms: number
          service_name: string
          status: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          response_time_ms?: number
          service_name?: string
          status?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          plan_type: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string
          id?: string
          plan_type: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          plan_type?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      licenses: {
        Row: {
          buyer_id: string
          contract_address: string
          created_at: string
          id: string
          price_paid: number
          royalty_split: Json | null
          seller_id: string
          status: string
          stem_id: string
          transaction_hash: string
        }
        Insert: {
          buyer_id: string
          contract_address: string
          created_at?: string
          id?: string
          price_paid: number
          royalty_split?: Json | null
          seller_id: string
          status?: string
          stem_id: string
          transaction_hash: string
        }
        Update: {
          buyer_id?: string
          contract_address?: string
          created_at?: string
          id?: string
          price_paid?: number
          royalty_split?: Json | null
          seller_id?: string
          status?: string
          stem_id?: string
          transaction_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_stem_id_fkey"
            columns: ["stem_id"]
            isOneToOne: false
            referencedRelation: "stems"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_transactions: {
        Row: {
          buyer_id: string
          created_at: string
          currency: string
          gross_amount: number
          id: string
          platform_fee: number
          seller_amount: number
          seller_id: string
          status: string
          stripe_payment_intent_id: string
          track_id: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          currency?: string
          gross_amount: number
          id?: string
          platform_fee: number
          seller_amount: number
          seller_id: string
          status?: string
          stripe_payment_intent_id: string
          track_id?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          currency?: string
          gross_amount?: number
          id?: string
          platform_fee?: number
          seller_amount?: number
          seller_id?: string
          status?: string
          stripe_payment_intent_id?: string
          track_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_transactions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      mix_entries: {
        Row: {
          bpm_shift: number | null
          end_sec: number | null
          key_shift: string | null
          mix_id: string
          position: number
          start_sec: number | null
          track_id: string | null
        }
        Insert: {
          bpm_shift?: number | null
          end_sec?: number | null
          key_shift?: string | null
          mix_id: string
          position: number
          start_sec?: number | null
          track_id?: string | null
        }
        Update: {
          bpm_shift?: number | null
          end_sec?: number | null
          key_shift?: string | null
          mix_id?: string
          position?: number
          start_sec?: number | null
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mix_entries_mix_id_fkey"
            columns: ["mix_id"]
            isOneToOne: false
            referencedRelation: "mixes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mix_entries_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      mixes: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      news_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          news_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          news_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          news_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_comments_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "real_news"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_pinned: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_tokens: {
        Row: {
          card_token: string
          id: string
          user_id: string | null
        }
        Insert: {
          card_token: string
          id?: string
          user_id?: string | null
        }
        Update: {
          card_token?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_data"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          id: string
          max_mixes: number | null
          max_playlists: number | null
          max_tracks: number | null
        }
        Insert: {
          id: string
          max_mixes?: number | null
          max_playlists?: number | null
          max_tracks?: number | null
        }
        Update: {
          id?: string
          max_mixes?: number | null
          max_playlists?: number | null
          max_tracks?: number | null
        }
        Relationships: []
      }
      platform_connections: {
        Row: {
          access_token: string
          connected_at: string
          expires_at: string | null
          id: string
          platform_name: string
          refresh_token: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          connected_at?: string
          expires_at?: string | null
          id?: string
          platform_name: string
          refresh_token?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          connected_at?: string
          expires_at?: string | null
          id?: string
          platform_name?: string
          refresh_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      playlist_tracks: {
        Row: {
          added_at: string
          id: string
          playlist_id: string
          position: number
          track_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          playlist_id: string
          position: number
          track_id: string
        }
        Update: {
          added_at?: string
          id?: string
          playlist_id?: string
          position?: number
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          track_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          track_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          track_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          like_count: number | null
          remix_thread: boolean | null
          track_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          remix_thread?: boolean | null
          track_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          remix_thread?: boolean | null
          track_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_cache: {
        Row: {
          created_at: string | null
          credits_used: number
          expires_at: string
          id: string
          result: Json
          service_type: string
          track_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_used?: number
          expires_at: string
          id?: string
          result: Json
          service_type: string
          track_id: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string | null
          credits_used?: number
          expires_at?: string
          id?: string
          result?: Json
          service_type?: string
          track_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          credits_remaining: number | null
          id: string
          plan: string | null
          subscription_plan: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits_remaining?: number | null
          id: string
          plan?: string | null
          subscription_plan?: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits_remaining?: number | null
          id?: string
          plan?: string | null
          subscription_plan?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_plan_fkey"
            columns: ["plan"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          bpm: number | null
          created_at: string
          description: string | null
          file_url: string | null
          genre: string | null
          id: string
          key: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bpm?: number | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          genre?: string | null
          id?: string
          key?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bpm?: number | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          genre?: string | null
          id?: string
          key?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limit_logs: {
        Row: {
          endpoint: string
          id: string
          identifier: string
          ts: string
        }
        Insert: {
          endpoint: string
          id?: string
          identifier: string
          ts?: string
        }
        Update: {
          endpoint?: string
          id?: string
          identifier?: string
          ts?: string
        }
        Relationships: []
      }
      real_news: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          published_at: string
          source: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          published_at: string
          source: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          published_at?: string
          source?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      recommendations_log: {
        Row: {
          confidence_score: number | null
          feedback: string | null
          id: string
          item_type: string
          recommended_at: string
          recommended_item_id: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          feedback?: string | null
          id?: string
          item_type: string
          recommended_at?: string
          recommended_item_id?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          feedback?: string | null
          id?: string
          item_type?: string
          recommended_at?: string
          recommended_item_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      releases: {
        Row: {
          cover_art_url: string | null
          created_at: string
          id: string
          isrc: string | null
          landing_page_url: string | null
          project_id: string
          release_date: string
          status: string
        }
        Insert: {
          cover_art_url?: string | null
          created_at?: string
          id?: string
          isrc?: string | null
          landing_page_url?: string | null
          project_id: string
          release_date: string
          status?: string
        }
        Update: {
          cover_art_url?: string | null
          created_at?: string
          id?: string
          isrc?: string | null
          landing_page_url?: string | null
          project_id?: string
          release_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "releases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      remix_threads: {
        Row: {
          created_at: string | null
          id: string
          owner_id: string
          post_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          owner_id: string
          post_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          owner_id?: string
          post_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remix_threads_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      stems: {
        Row: {
          created_at: string
          file_url: string
          id: string
          is_premium: boolean
          price: number | null
          project_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          is_premium?: boolean
          price?: number | null
          project_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          is_premium?: boolean
          price?: number | null
          project_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stems_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_limits: {
        Row: {
          can_export: boolean | null
          can_use_community: boolean | null
          can_use_marketplace: boolean | null
          created_at: string
          id: string
          marketplace_commission_rate: number
          max_storage_mb: number
          max_tracks: number
          plan_type: string
        }
        Insert: {
          can_export?: boolean | null
          can_use_community?: boolean | null
          can_use_marketplace?: boolean | null
          created_at?: string
          id?: string
          marketplace_commission_rate?: number
          max_storage_mb: number
          max_tracks: number
          plan_type: string
        }
        Update: {
          can_export?: boolean | null
          can_use_community?: boolean | null
          can_use_marketplace?: boolean | null
          created_at?: string
          id?: string
          marketplace_commission_rate?: number
          max_storage_mb?: number
          max_tracks?: number
          plan_type?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      track_comments: {
        Row: {
          color_code: string | null
          content: string
          created_at: string
          id: string
          is_resolved: boolean | null
          parent_id: string | null
          timestamp_mark: number | null
          track_id: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color_code?: string | null
          content: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          parent_id?: string | null
          timestamp_mark?: number | null
          track_id: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color_code?: string | null
          content?: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          parent_id?: string | null
          timestamp_mark?: number | null
          track_id?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "track_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_comments_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_cues: {
        Row: {
          color: string | null
          created_at: string
          id: string
          label: string | null
          position_ms: number
          track_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          label?: string | null
          position_ms: number
          track_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          label?: string | null
          position_ms?: number
          track_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      track_features: {
        Row: {
          analysis: Json | null
          bpm: number | null
          camelot: string | null
          created_at: string
          energy_level: number | null
          id: string
          key_signature: string | null
          mode: string | null
          track_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          bpm?: number | null
          camelot?: string | null
          created_at?: string
          energy_level?: number | null
          id?: string
          key_signature?: string | null
          mode?: string | null
          track_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis?: Json | null
          bpm?: number | null
          camelot?: string | null
          created_at?: string
          energy_level?: number | null
          id?: string
          key_signature?: string | null
          mode?: string | null
          track_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      track_loops: {
        Row: {
          created_at: string
          end_ms: number
          id: string
          label: string | null
          start_ms: number
          track_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_ms: number
          id?: string
          label?: string | null
          start_ms: number
          track_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_ms?: number
          id?: string
          label?: string | null
          start_ms?: number
          track_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          artist: string
          bpm: number | null
          created_at: string
          deleted_at: string | null
          duration: string
          energy_level: number | null
          file_path: string | null
          file_size: number | null
          file_url: string | null
          genre: string | null
          id: string
          is_featured: boolean | null
          is_liked: boolean | null
          key_signature: string | null
          original_filename: string | null
          play_count: number | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          upload_status: string | null
          user_id: string
          waveform_data: Json | null
        }
        Insert: {
          artist: string
          bpm?: number | null
          created_at?: string
          deleted_at?: string | null
          duration: string
          energy_level?: number | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          is_liked?: boolean | null
          key_signature?: string | null
          original_filename?: string | null
          play_count?: number | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
          upload_status?: string | null
          user_id: string
          waveform_data?: Json | null
        }
        Update: {
          artist?: string
          bpm?: number | null
          created_at?: string
          deleted_at?: string | null
          duration?: string
          energy_level?: number | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          is_liked?: boolean | null
          key_signature?: string | null
          original_filename?: string | null
          play_count?: number | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          upload_status?: string | null
          user_id?: string
          waveform_data?: Json | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          currency: string
          id: string
          item_id: string | null
          item_type: string
          payment_method: string | null
          status: string
          transaction_date: string
          user_id: string
        }
        Insert: {
          amount: number
          currency?: string
          id?: string
          item_id?: string | null
          item_type: string
          payment_method?: string | null
          status?: string
          transaction_date?: string
          user_id: string
        }
        Update: {
          amount?: number
          currency?: string
          id?: string
          item_id?: string | null
          item_type?: string
          payment_method?: string | null
          status?: string
          transaction_date?: string
          user_id?: string
        }
        Relationships: []
      }
      upload_analytics: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          event_type: string
          file_size: number | null
          file_type: string | null
          id: string
          metadata: Json | null
          retry_count: number | null
          track_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_type: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          retry_count?: number | null
          track_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_type?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          retry_count?: number | null
          track_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upload_analytics_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          genre_preferences: Json | null
          instrument_preferences: Json | null
          recent_activity: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          genre_preferences?: Json | null
          instrument_preferences?: Json | null
          recent_activity?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          genre_preferences?: Json | null
          instrument_preferences?: Json | null
          recent_activity?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users_data: {
        Row: {
          aprovado: boolean
          blockchain_registro: string | null
          cartao_credito_token: string | null
          celular: string
          created_at: string
          data_cadastro: string
          device_data: Json | null
          email: string
          id: string
          nome_completo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          aprovado?: boolean
          blockchain_registro?: string | null
          cartao_credito_token?: string | null
          celular: string
          created_at?: string
          data_cadastro?: string
          device_data?: Json | null
          email: string
          id?: string
          nome_completo: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          aprovado?: boolean
          blockchain_registro?: string | null
          cartao_credito_token?: string | null
          celular?: string
          created_at?: string
          data_cadastro?: string
          device_data?: Json | null
          email?: string
          id?: string
          nome_completo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          analysis_status: string | null
          duration: number | null
          file_path: string
          filename: string
          id: string
          upload_date: string | null
          user_id: string | null
        }
        Insert: {
          analysis_status?: string | null
          duration?: number | null
          file_path: string
          filename: string
          id?: string
          upload_date?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_status?: string | null
          duration?: number | null
          file_path?: string
          filename?: string
          id?: string
          upload_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          received_at: string
          status: string
        }
        Insert: {
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          received_at?: string
          status?: string
        }
        Update: {
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          received_at?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_mix: {
        Args: { p_user: string }
        Returns: boolean
      }
      can_create_playlist: {
        Args: { p_user: string }
        Returns: boolean
      }
      can_create_track: {
        Args: { p_user: string }
        Returns: boolean
      }
      can_user_upload_track: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_max_requests: number
          p_window_minutes: number
        }
        Returns: boolean
      }
      cleanup_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_comment_color: {
        Args: { comment_type: string }
        Returns: string
      }
      get_user_subscription_info: {
        Args: { user_uuid?: string }
        Returns: {
          can_export: boolean
          can_use_community: boolean
          can_use_marketplace: boolean
          current_period_end: string
          marketplace_commission_rate: number
          max_storage_mb: number
          max_tracks: number
          plan_type: string
          status: string
        }[]
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_admin_by_email: {
        Args: { email: string }
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
