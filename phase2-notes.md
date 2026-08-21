# Jobs Phase 2

The Supabase `search_jobs_page` RPC provides cursor-based pages capped at 50 rows. The existing V7 personalized renderer remains the UI source of truth. Client pagination scaffolding is present for the next integration pass; do not activate a second renderer.