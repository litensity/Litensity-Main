
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "admin_profiles": {
                  Row: {
                    "created_at": string,"display_name": string | null,"role": Database["public"]['Enums']["admin_role"],"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"display_name"?: string | null,"role"?: Database["public"]['Enums']["admin_role"],"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string | null,"role"?: Database["public"]['Enums']["admin_role"],"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"brands": {
                  Row: {
                    "card_media_id": string | null,"category": string | null,"color_ink": string,"color_primary": string,"color_surface": string,"created_at": string,"differentiation": string | null,"external_url": string | null,"external_url_enabled": boolean,"feature_brochure_download": boolean,"feature_investment": boolean,"feature_investment_enquiry": boolean,"feature_menu_download": boolean,"format_summary": string | null,"hero_media_id": string | null,"hero_object": string,"hero_video_media_id": string | null,"id": string,"investment_field": Database["public"]['Enums']["investment_field"],"investment_format_options": (string)[],"investment_heading": string | null,"investment_intro": string | null,"logo_media_id": string | null,"logo_reverse_media_id": string | null,"name": string,"ownership": Database["public"]['Enums']["brand_ownership"],"positioning": string | null,"slug": string,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"story_body": string | null,"story_heading": string | null,"tagline": string | null,"ticket_size_confirmed": boolean,"ticket_size_label": string | null,"typeface": Database["public"]['Enums']["typeface_preset"],"updated_at": string
                  }
                  Insert: {
                    "card_media_id"?: string | null,"category"?: string | null,"color_ink"?: string,"color_primary"?: string,"color_surface"?: string,"created_at"?: string,"differentiation"?: string | null,"external_url"?: string | null,"external_url_enabled"?: boolean,"feature_brochure_download"?: boolean,"feature_investment"?: boolean,"feature_investment_enquiry"?: boolean,"feature_menu_download"?: boolean,"format_summary"?: string | null,"hero_media_id"?: string | null,"hero_object"?: string,"hero_video_media_id"?: string | null,"id"?: string,"investment_field"?: Database["public"]['Enums']["investment_field"],"investment_format_options"?: (string)[],"investment_heading"?: string | null,"investment_intro"?: string | null,"logo_media_id"?: string | null,"logo_reverse_media_id"?: string | null,"name": string,"ownership": Database["public"]['Enums']["brand_ownership"],"positioning"?: string | null,"slug": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"story_body"?: string | null,"story_heading"?: string | null,"tagline"?: string | null,"ticket_size_confirmed"?: boolean,"ticket_size_label"?: string | null,"typeface"?: Database["public"]['Enums']["typeface_preset"],"updated_at"?: string
                  }
                  Update: {
                    "card_media_id"?: string | null,"category"?: string | null,"color_ink"?: string,"color_primary"?: string,"color_surface"?: string,"created_at"?: string,"differentiation"?: string | null,"external_url"?: string | null,"external_url_enabled"?: boolean,"feature_brochure_download"?: boolean,"feature_investment"?: boolean,"feature_investment_enquiry"?: boolean,"feature_menu_download"?: boolean,"format_summary"?: string | null,"hero_media_id"?: string | null,"hero_object"?: string,"hero_video_media_id"?: string | null,"id"?: string,"investment_field"?: Database["public"]['Enums']["investment_field"],"investment_format_options"?: (string)[],"investment_heading"?: string | null,"investment_intro"?: string | null,"logo_media_id"?: string | null,"logo_reverse_media_id"?: string | null,"name"?: string,"ownership"?: Database["public"]['Enums']["brand_ownership"],"positioning"?: string | null,"slug"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"story_body"?: string | null,"story_heading"?: string | null,"tagline"?: string | null,"ticket_size_confirmed"?: boolean,"ticket_size_label"?: string | null,"typeface"?: Database["public"]['Enums']["typeface_preset"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "brands_card_media_id_fkey"
      columns: ["card_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "brands_hero_media_id_fkey"
      columns: ["hero_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "brands_hero_video_media_id_fkey"
      columns: ["hero_video_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "brands_logo_media_id_fkey"
      columns: ["logo_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "brands_logo_reverse_media_id_fkey"
      columns: ["logo_reverse_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"campaigns": {
                  Row: {
                    "body": string | null,"brand_id": string,"cta_href": string | null,"cta_label": string | null,"id": string,"kind": string,"media_id": string | null,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"title": string,"updated_at": string
                  }
                  Insert: {
                    "body"?: string | null,"brand_id": string,"cta_href"?: string | null,"cta_label"?: string | null,"id"?: string,"kind"?: string,"media_id"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "body"?: string | null,"brand_id"?: string,"cta_href"?: string | null,"cta_label"?: string | null,"id"?: string,"kind"?: string,"media_id"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "campaigns_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "campaigns_media_id_fkey"
      columns: ["media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"contact_departments": {
                  Row: {
                    "description": string | null,"email": string | null,"enquiry_types": (string)[],"id": string,"name": string,"phone": string | null,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"updated_at": string
                  }
                  Insert: {
                    "description"?: string | null,"email"?: string | null,"enquiry_types"?: (string)[],"id"?: string,"name": string,"phone"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Update: {
                    "description"?: string | null,"email"?: string | null,"enquiry_types"?: (string)[],"id"?: string,"name"?: string,"phone"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"content_items": {
                  Row: {
                    "body": string | null,"brand_id": string | null,"href": string | null,"icon": string | null,"id": string,"list_key": string | null,"media_id": string | null,"meta": string | null,"section_id": string | null,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"title": string,"updated_at": string
                  }
                  Insert: {
                    "body"?: string | null,"brand_id"?: string | null,"href"?: string | null,"icon"?: string | null,"id"?: string,"list_key"?: string | null,"media_id"?: string | null,"meta"?: string | null,"section_id"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "body"?: string | null,"brand_id"?: string | null,"href"?: string | null,"icon"?: string | null,"id"?: string,"list_key"?: string | null,"media_id"?: string | null,"meta"?: string | null,"section_id"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "content_items_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "content_items_media_id_fkey"
      columns: ["media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "content_items_section_id_fkey"
      columns: ["section_id"]
isOneToOne: false
      referencedRelation: "page_sections"
      referencedColumns: ["id"]
    }
                  ]
                },"csr_initiatives": {
                  Row: {
                    "description": string | null,"event_date": string | null,"id": string,"location": string | null,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"title": string,"updated_at": string
                  }
                  Insert: {
                    "description"?: string | null,"event_date"?: string | null,"id"?: string,"location"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "description"?: string | null,"event_date"?: string | null,"id"?: string,"location"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"delivery_links": {
                  Row: {
                    "brand_id": string,"id": string,"platform": string,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"updated_at": string,"url": string
                  }
                  Insert: {
                    "brand_id": string,"id"?: string,"platform": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string,"url": string
                  }
                  Update: {
                    "brand_id"?: string,"id"?: string,"platform"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string,"url"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "delivery_links_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    }
                  ]
                },"downloads": {
                  Row: {
                    "brand_id": string,"description": string | null,"file_media_id": string | null,"id": string,"kind": Database["public"]['Enums']["download_kind"],"requires_otp": boolean,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"title": string,"updated_at": string
                  }
                  Insert: {
                    "brand_id": string,"description"?: string | null,"file_media_id"?: string | null,"id"?: string,"kind": Database["public"]['Enums']["download_kind"],"requires_otp"?: boolean,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "brand_id"?: string,"description"?: string | null,"file_media_id"?: string | null,"id"?: string,"kind"?: Database["public"]['Enums']["download_kind"],"requires_otp"?: boolean,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "downloads_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "downloads_file_media_id_fkey"
      columns: ["file_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"faqs": {
                  Row: {
                    "answer": string,"brand_id": string | null,"id": string,"question": string,"scope": string,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"updated_at": string
                  }
                  Insert: {
                    "answer": string,"brand_id"?: string | null,"id"?: string,"question": string,"scope": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Update: {
                    "answer"?: string,"brand_id"?: string | null,"id"?: string,"question"?: string,"scope"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "faqs_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    }
                  ]
                },"form_settings": {
                  Row: {
                    "ack_body": string | null,"ack_subject": string | null,"budget_options": (string)[],"consent_label": string | null,"enquiry_types": (string)[],"form_key": string,"is_enabled": boolean,"label": string,"notify_emails": (string)[],"sheet_id": string | null,"sheet_tab": string,"success_message": string | null,"ticket_size_options": (string)[],"timeline_options": (string)[],"updated_at": string
                  }
                  Insert: {
                    "ack_body"?: string | null,"ack_subject"?: string | null,"budget_options"?: (string)[],"consent_label"?: string | null,"enquiry_types"?: (string)[],"form_key": string,"is_enabled"?: boolean,"label": string,"notify_emails"?: (string)[],"sheet_id"?: string | null,"sheet_tab": string,"success_message"?: string | null,"ticket_size_options"?: (string)[],"timeline_options"?: (string)[],"updated_at"?: string
                  }
                  Update: {
                    "ack_body"?: string | null,"ack_subject"?: string | null,"budget_options"?: (string)[],"consent_label"?: string | null,"enquiry_types"?: (string)[],"form_key"?: string,"is_enabled"?: boolean,"label"?: string,"notify_emails"?: (string)[],"sheet_id"?: string | null,"sheet_tab"?: string,"success_message"?: string | null,"ticket_size_options"?: (string)[],"timeline_options"?: (string)[],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"gallery_items": {
                  Row: {
                    "brand_id": string | null,"caption": string | null,"collection": string,"csr_initiative_id": string | null,"id": string,"media_id": string,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"tag": string | null,"updated_at": string
                  }
                  Insert: {
                    "brand_id"?: string | null,"caption"?: string | null,"collection": string,"csr_initiative_id"?: string | null,"id"?: string,"media_id": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"tag"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "brand_id"?: string | null,"caption"?: string | null,"collection"?: string,"csr_initiative_id"?: string | null,"id"?: string,"media_id"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"tag"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "gallery_items_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "gallery_items_csr_fk"
      columns: ["csr_initiative_id"]
isOneToOne: false
      referencedRelation: "csr_initiatives"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "gallery_items_media_id_fkey"
      columns: ["media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"investment_models": {
                  Row: {
                    "area_requirement": string | null,"assumptions": string | null,"brand_id": string,"description": string | null,"figures_confirmed": boolean,"format": string | null,"id": string,"includes": (string)[],"investment_range": string | null,"name": string,"payback_range": string | null,"return_range": string | null,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"updated_at": string
                  }
                  Insert: {
                    "area_requirement"?: string | null,"assumptions"?: string | null,"brand_id": string,"description"?: string | null,"figures_confirmed"?: boolean,"format"?: string | null,"id"?: string,"includes"?: (string)[],"investment_range"?: string | null,"name": string,"payback_range"?: string | null,"return_range"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Update: {
                    "area_requirement"?: string | null,"assumptions"?: string | null,"brand_id"?: string,"description"?: string | null,"figures_confirmed"?: boolean,"format"?: string | null,"id"?: string,"includes"?: (string)[],"investment_range"?: string | null,"name"?: string,"payback_range"?: string | null,"return_range"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "investment_models_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    }
                  ]
                },"jobs": {
                  Row: {
                    "brand_id": string | null,"created_at": string,"description": string | null,"employment_type": string,"id": string,"is_open": boolean,"location": string,"requirements": string | null,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"summary": string | null,"title": string,"updated_at": string
                  }
                  Insert: {
                    "brand_id"?: string | null,"created_at"?: string,"description"?: string | null,"employment_type"?: string,"id"?: string,"is_open"?: boolean,"location": string,"requirements"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"summary"?: string | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "brand_id"?: string | null,"created_at"?: string,"description"?: string | null,"employment_type"?: string,"id"?: string,"is_open"?: boolean,"location"?: string,"requirements"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"summary"?: string | null,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "jobs_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    }
                  ]
                },"lead_submissions": {
                  Row: {
                    "brand_slug": string | null,"created_at": string,"email": string | null,"email_error": string | null,"email_status": string,"form_key": string,"id": string,"payload": NonNullable<Json>,"phone": string | null,"sheet_error": string | null,"sheet_range": string | null,"sheet_status": string,"source_page": string | null
                  }
                  Insert: {
                    "brand_slug"?: string | null,"created_at"?: string,"email"?: string | null,"email_error"?: string | null,"email_status"?: string,"form_key": string,"id"?: string,"payload": NonNullable<Json>,"phone"?: string | null,"sheet_error"?: string | null,"sheet_range"?: string | null,"sheet_status"?: string,"source_page"?: string | null
                  }
                  Update: {
                    "brand_slug"?: string | null,"created_at"?: string,"email"?: string | null,"email_error"?: string | null,"email_status"?: string,"form_key"?: string,"id"?: string,"payload"?: NonNullable<Json>,"phone"?: string | null,"sheet_error"?: string | null,"sheet_range"?: string | null,"sheet_status"?: string,"source_page"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"legal_documents": {
                  Row: {
                    "body": string,"slug": string,"status": Database["public"]['Enums']["publish_status"],"title": string,"updated_at": string
                  }
                  Insert: {
                    "body": string,"slug": string,"status"?: Database["public"]['Enums']["publish_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "body"?: string,"slug"?: string,"status"?: Database["public"]['Enums']["publish_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"media": {
                  Row: {
                    "alt": string,"bucket": string,"created_at": string,"height": number | null,"id": string,"kind": Database["public"]['Enums']["media_kind"],"mime_type": string,"path": string,"size_bytes": number,"title": string | null,"updated_at": string,"width": number | null
                  }
                  Insert: {
                    "alt"?: string,"bucket"?: string,"created_at"?: string,"height"?: number | null,"id"?: string,"kind": Database["public"]['Enums']["media_kind"],"mime_type": string,"path": string,"size_bytes": number,"title"?: string | null,"updated_at"?: string,"width"?: number | null
                  }
                  Update: {
                    "alt"?: string,"bucket"?: string,"created_at"?: string,"height"?: number | null,"id"?: string,"kind"?: Database["public"]['Enums']["media_kind"],"mime_type"?: string,"path"?: string,"size_bytes"?: number,"title"?: string | null,"updated_at"?: string,"width"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"milestones": {
                  Row: {
                    "body": string | null,"id": string,"media_id": string | null,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"title": string,"updated_at": string,"year_label": string
                  }
                  Insert: {
                    "body"?: string | null,"id"?: string,"media_id"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"title": string,"updated_at"?: string,"year_label": string
                  }
                  Update: {
                    "body"?: string | null,"id"?: string,"media_id"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"title"?: string,"updated_at"?: string,"year_label"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "milestones_media_id_fkey"
      columns: ["media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"navigation_items": {
                  Row: {
                    "href": string,"id": string,"label": string,"location": string,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"updated_at": string
                  }
                  Insert: {
                    "href": string,"id"?: string,"label": string,"location": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Update: {
                    "href"?: string,"id"?: string,"label"?: string,"location"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"otp_requests": {
                  Row: {
                    "attempts": number,"channel": string,"code_hash": string,"created_at": string,"destination": string,"download_id": string,"expires_at": string,"id": string,"ip_hash": string,"last_sent_at": string,"lead_submission_id": string | null,"max_attempts": number,"release_expires_at": string | null,"release_token_hash": string | null,"send_count": number,"status": Database["public"]['Enums']["otp_status"],"verified_at": string | null
                  }
                  Insert: {
                    "attempts"?: number,"channel": string,"code_hash": string,"created_at"?: string,"destination": string,"download_id": string,"expires_at": string,"id"?: string,"ip_hash": string,"last_sent_at"?: string,"lead_submission_id"?: string | null,"max_attempts"?: number,"release_expires_at"?: string | null,"release_token_hash"?: string | null,"send_count"?: number,"status"?: Database["public"]['Enums']["otp_status"],"verified_at"?: string | null
                  }
                  Update: {
                    "attempts"?: number,"channel"?: string,"code_hash"?: string,"created_at"?: string,"destination"?: string,"download_id"?: string,"expires_at"?: string,"id"?: string,"ip_hash"?: string,"last_sent_at"?: string,"lead_submission_id"?: string | null,"max_attempts"?: number,"release_expires_at"?: string | null,"release_token_hash"?: string | null,"send_count"?: number,"status"?: Database["public"]['Enums']["otp_status"],"verified_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "otp_requests_download_id_fkey"
      columns: ["download_id"]
isOneToOne: false
      referencedRelation: "downloads"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "otp_requests_lead_submission_id_fkey"
      columns: ["lead_submission_id"]
isOneToOne: false
      referencedRelation: "lead_submissions"
      referencedColumns: ["id"]
    }
                  ]
                },"page_sections": {
                  Row: {
                    "body": string | null,"cta_href": string | null,"cta_label": string | null,"cta2_href": string | null,"cta2_label": string | null,"eyebrow": string | null,"heading": string | null,"id": string,"is_enabled": boolean,"kind": string,"layout": string | null,"media_id": string | null,"page_key": string,"section_key": string,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"subheading": string | null,"tone": string | null,"updated_at": string,"video_media_id": string | null
                  }
                  Insert: {
                    "body"?: string | null,"cta_href"?: string | null,"cta_label"?: string | null,"cta2_href"?: string | null,"cta2_label"?: string | null,"eyebrow"?: string | null,"heading"?: string | null,"id"?: string,"is_enabled"?: boolean,"kind"?: string,"layout"?: string | null,"media_id"?: string | null,"page_key": string,"section_key": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"subheading"?: string | null,"tone"?: string | null,"updated_at"?: string,"video_media_id"?: string | null
                  }
                  Update: {
                    "body"?: string | null,"cta_href"?: string | null,"cta_label"?: string | null,"cta2_href"?: string | null,"cta2_label"?: string | null,"eyebrow"?: string | null,"heading"?: string | null,"id"?: string,"is_enabled"?: boolean,"kind"?: string,"layout"?: string | null,"media_id"?: string | null,"page_key"?: string,"section_key"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"subheading"?: string | null,"tone"?: string | null,"updated_at"?: string,"video_media_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "page_sections_media_id_fkey"
      columns: ["media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "page_sections_page_key_fkey"
      columns: ["page_key"]
isOneToOne: false
      referencedRelation: "pages"
      referencedColumns: ["key"]
    },{
      foreignKeyName: "page_sections_video_media_id_fkey"
      columns: ["video_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"pages": {
                  Row: {
                    "key": string,"name": string,"updated_at": string
                  }
                  Insert: {
                    "key": string,"name": string,"updated_at"?: string
                  }
                  Update: {
                    "key"?: string,"name"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"people": {
                  Row: {
                    "background": string | null,"bio": string | null,"designation": string | null,"id": string,"kind": Database["public"]['Enums']["person_kind"],"linkedin_url": string | null,"name": string,"photo_media_id": string | null,"responsibility": string | null,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"updated_at": string
                  }
                  Insert: {
                    "background"?: string | null,"bio"?: string | null,"designation"?: string | null,"id"?: string,"kind": Database["public"]['Enums']["person_kind"],"linkedin_url"?: string | null,"name": string,"photo_media_id"?: string | null,"responsibility"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Update: {
                    "background"?: string | null,"bio"?: string | null,"designation"?: string | null,"id"?: string,"kind"?: Database["public"]['Enums']["person_kind"],"linkedin_url"?: string | null,"name"?: string,"photo_media_id"?: string | null,"responsibility"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "people_photo_media_id_fkey"
      columns: ["photo_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"product_categories": {
                  Row: {
                    "brand_id": string,"description": string | null,"id": string,"media_id": string | null,"name": string,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"updated_at": string
                  }
                  Insert: {
                    "brand_id": string,"description"?: string | null,"id"?: string,"media_id"?: string | null,"name": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Update: {
                    "brand_id"?: string,"description"?: string | null,"id"?: string,"media_id"?: string | null,"name"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_categories_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_categories_media_id_fkey"
      columns: ["media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "brand_id": string,"category_id": string | null,"description": string | null,"id": string,"is_bestseller": boolean,"is_veg": boolean | null,"media_id": string | null,"name": string,"price_label": string | null,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"updated_at": string
                  }
                  Insert: {
                    "brand_id": string,"category_id"?: string | null,"description"?: string | null,"id"?: string,"is_bestseller"?: boolean,"is_veg"?: boolean | null,"media_id"?: string | null,"name": string,"price_label"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Update: {
                    "brand_id"?: string,"category_id"?: string | null,"description"?: string | null,"id"?: string,"is_bestseller"?: boolean,"is_veg"?: boolean | null,"media_id"?: string | null,"name"?: string,"price_label"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "products_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "products_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "product_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "products_media_id_fkey"
      columns: ["media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"rate_limits": {
                  Row: {
                    "bucket": string,"hits": number,"window_start": string
                  }
                  Insert: {
                    "bucket": string,"hits"?: number,"window_start": string
                  }
                  Update: {
                    "bucket"?: string,"hits"?: number,"window_start"?: string
                  }
                  Relationships: [
                    
                  ]
                },"sample_records": {
                  Row: {
                    "created_at": string,"record_id": string,"table_name": string
                  }
                  Insert: {
                    "created_at"?: string,"record_id": string,"table_name": string
                  }
                  Update: {
                    "created_at"?: string,"record_id"?: string,"table_name"?: string
                  }
                  Relationships: [

                  ]
                },"sample_field_backups": {
                  Row: {
                    "column_name": string,"created_at": string,"original": Json | null,"pk_column": string,"pk_value": string,"table_name": string
                  }
                  Insert: {
                    "column_name": string,"created_at"?: string,"original"?: Json | null,"pk_column"?: string,"pk_value": string,"table_name": string
                  }
                  Update: {
                    "column_name"?: string,"created_at"?: string,"original"?: Json | null,"pk_column"?: string,"pk_value"?: string,"table_name"?: string
                  }
                  Relationships: [

                  ]
                },"seo_metadata": {
                  Row: {
                    "canonical_path": string | null,"description": string | null,"noindex": boolean,"og_description": string | null,"og_media_id": string | null,"og_title": string | null,"route_key": string,"title": string | null,"updated_at": string
                  }
                  Insert: {
                    "canonical_path"?: string | null,"description"?: string | null,"noindex"?: boolean,"og_description"?: string | null,"og_media_id"?: string | null,"og_title"?: string | null,"route_key": string,"title"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "canonical_path"?: string | null,"description"?: string | null,"noindex"?: boolean,"og_description"?: string | null,"og_media_id"?: string | null,"og_title"?: string | null,"route_key"?: string,"title"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "seo_metadata_og_media_id_fkey"
      columns: ["og_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"site_settings": {
                  Row: {
                    "address": string | null,"analytics_measurement_id": string | null,"company_name": string,"default_og_media_id": string | null,"email": string | null,"enquire_href": string,"enquire_label": string,"footer_statement": string | null,"id": number,"latitude": number | null,"legal_name": string,"logo_media_id": string | null,"longitude": number | null,"map_url": string | null,"newsletter_enabled": boolean,"newsletter_heading": string | null,"phone": string | null,"positioning_line": string | null,"updated_at": string,"whatsapp_message": string | null,"whatsapp_number": string | null
                  }
                  Insert: {
                    "address"?: string | null,"analytics_measurement_id"?: string | null,"company_name": string,"default_og_media_id"?: string | null,"email"?: string | null,"enquire_href"?: string,"enquire_label"?: string,"footer_statement"?: string | null,"id"?: number,"latitude"?: number | null,"legal_name": string,"logo_media_id"?: string | null,"longitude"?: number | null,"map_url"?: string | null,"newsletter_enabled"?: boolean,"newsletter_heading"?: string | null,"phone"?: string | null,"positioning_line"?: string | null,"updated_at"?: string,"whatsapp_message"?: string | null,"whatsapp_number"?: string | null
                  }
                  Update: {
                    "address"?: string | null,"analytics_measurement_id"?: string | null,"company_name"?: string,"default_og_media_id"?: string | null,"email"?: string | null,"enquire_href"?: string,"enquire_label"?: string,"footer_statement"?: string | null,"id"?: number,"latitude"?: number | null,"legal_name"?: string,"logo_media_id"?: string | null,"longitude"?: number | null,"map_url"?: string | null,"newsletter_enabled"?: boolean,"newsletter_heading"?: string | null,"phone"?: string | null,"positioning_line"?: string | null,"updated_at"?: string,"whatsapp_message"?: string | null,"whatsapp_number"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "site_settings_default_og_media_id_fkey"
      columns: ["default_og_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "site_settings_logo_media_id_fkey"
      columns: ["logo_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"social_links": {
                  Row: {
                    "brand_id": string | null,"id": string,"platform": string,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"updated_at": string,"url": string
                  }
                  Insert: {
                    "brand_id"?: string | null,"id"?: string,"platform": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string,"url": string
                  }
                  Update: {
                    "brand_id"?: string | null,"id"?: string,"platform"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string,"url"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "social_links_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    }
                  ]
                },"stats": {
                  Row: {
                    "brand_id": string | null,"id": string,"label": string,"note": string | null,"scope": string,"section_id": string | null,"sort_order": number,"source": Database["public"]['Enums']["stat_source"],"status": Database["public"]['Enums']["publish_status"],"suffix": string | null,"updated_at": string,"value": string | null
                  }
                  Insert: {
                    "brand_id"?: string | null,"id"?: string,"label": string,"note"?: string | null,"scope": string,"section_id"?: string | null,"sort_order"?: number,"source"?: Database["public"]['Enums']["stat_source"],"status"?: Database["public"]['Enums']["publish_status"],"suffix"?: string | null,"updated_at"?: string,"value"?: string | null
                  }
                  Update: {
                    "brand_id"?: string | null,"id"?: string,"label"?: string,"note"?: string | null,"scope"?: string,"section_id"?: string | null,"sort_order"?: number,"source"?: Database["public"]['Enums']["stat_source"],"status"?: Database["public"]['Enums']["publish_status"],"suffix"?: string | null,"updated_at"?: string,"value"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "stats_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "stats_section_id_fkey"
      columns: ["section_id"]
isOneToOne: false
      referencedRelation: "page_sections"
      referencedColumns: ["id"]
    }
                  ]
                },"store_hours": {
                  Row: {
                    "closes_at": string | null,"day_of_week": number,"is_closed": boolean,"opens_at": string | null,"store_id": string
                  }
                  Insert: {
                    "closes_at"?: string | null,"day_of_week": number,"is_closed"?: boolean,"opens_at"?: string | null,"store_id": string
                  }
                  Update: {
                    "closes_at"?: string | null,"day_of_week"?: number,"is_closed"?: boolean,"opens_at"?: string | null,"store_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "store_hours_store_id_fkey"
      columns: ["store_id"]
isOneToOne: false
      referencedRelation: "stores"
      referencedColumns: ["id"]
    }
                  ]
                },"store_order_links": {
                  Row: {
                    "id": string,"platform": string,"sort_order": number,"store_id": string,"url": string
                  }
                  Insert: {
                    "id"?: string,"platform": string,"sort_order"?: number,"store_id": string,"url": string
                  }
                  Update: {
                    "id"?: string,"platform"?: string,"sort_order"?: number,"store_id"?: string,"url"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "store_order_links_store_id_fkey"
      columns: ["store_id"]
isOneToOne: false
      referencedRelation: "stores"
      referencedColumns: ["id"]
    }
                  ]
                },"stores": {
                  Row: {
                    "address": string,"brand_id": string,"city": string,"created_at": string,"hours_note": string | null,"id": string,"is_archived": boolean,"latitude": number,"locality": string | null,"longitude": number,"name": string,"phone": string,"photo_media_id": string | null,"pincode": string,"sort_order": number,"state": string,"store_status": Database["public"]['Enums']["store_status"],"updated_at": string
                  }
                  Insert: {
                    "address": string,"brand_id": string,"city": string,"created_at"?: string,"hours_note"?: string | null,"id"?: string,"is_archived"?: boolean,"latitude": number,"locality"?: string | null,"longitude": number,"name": string,"phone": string,"photo_media_id"?: string | null,"pincode": string,"sort_order"?: number,"state": string,"store_status"?: Database["public"]['Enums']["store_status"],"updated_at"?: string
                  }
                  Update: {
                    "address"?: string,"brand_id"?: string,"city"?: string,"created_at"?: string,"hours_note"?: string | null,"id"?: string,"is_archived"?: boolean,"latitude"?: number,"locality"?: string | null,"longitude"?: number,"name"?: string,"phone"?: string,"photo_media_id"?: string | null,"pincode"?: string,"sort_order"?: number,"state"?: string,"store_status"?: Database["public"]['Enums']["store_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "stores_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "stores_photo_media_id_fkey"
      columns: ["photo_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "form_options": {
                  Row: {
                    "budget_options": (string)[] | null,"consent_label": string | null,"enquiry_types": (string)[] | null,"form_key": string | null,"is_enabled": boolean | null,"success_message": string | null,"ticket_size_options": (string)[] | null,"timeline_options": (string)[] | null
                  }
                  Insert: {
                           "budget_options"?: (string)[] | null,"consent_label"?: string | null,"enquiry_types"?: (string)[] | null,"form_key"?: string | null,"is_enabled"?: boolean | null,"success_message"?: string | null,"ticket_size_options"?: (string)[] | null,"timeline_options"?: (string)[] | null
                         }
                        Update: {
                           "budget_options"?: (string)[] | null,"consent_label"?: string | null,"enquiry_types"?: (string)[] | null,"form_key"?: string | null,"is_enabled"?: boolean | null,"success_message"?: string | null,"ticket_size_options"?: (string)[] | null,"timeline_options"?: (string)[] | null
                         }
                        Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_owner":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"rate_limit_hit":
{ Args: { "p_bucket": string,"p_max": number,"p_window_seconds": number }; Returns: boolean
                           },
"reorder_page_sections":
{ Args: { "p_ids": (string)[],"p_page_key": string }; Returns: undefined
                           }
          }
          Enums: {
            "admin_role": "owner"|"editor","brand_ownership": "homegrown"|"franchise","download_kind": "menu"|"brochure","investment_field": "preferred_location"|"preferred_format","media_kind": "image"|"video"|"document","otp_status": "pending"|"verified"|"failed"|"expired","person_kind": "founder"|"leader","publish_status": "draft"|"published"|"archived","stat_source": "manual"|"stores_live"|"cities"|"states"|"brands","store_status": "live"|"opening_soon","typeface_preset": "serif"|"condensed"|"grotesk"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "admin_role": ["owner", "editor"],"brand_ownership": ["homegrown", "franchise"],"download_kind": ["menu", "brochure"],"investment_field": ["preferred_location", "preferred_format"],"media_kind": ["image", "video", "document"],"otp_status": ["pending", "verified", "failed", "expired"],"person_kind": ["founder", "leader"],"publish_status": ["draft", "published", "archived"],"stat_source": ["manual", "stores_live", "cities", "states", "brands"],"store_status": ["live", "opening_soon"],"typeface_preset": ["serif", "condensed", "grotesk"]
          }
        }
} as const
