/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_PROJECT_ID?: string;
  readonly VITE_GITHUB_CLIENT_ID?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_SERA_AI_PROVIDER?: string;
  readonly VITE_SERA_ADMIN_BOOTSTRAP_EMAIL?: string;
  readonly VITE_SERA_ADMIN_BOOTSTRAP_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
