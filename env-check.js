#!/usr/bin/env node

// Minimal environment check for dev server
const requiredVars = ['GEMINI_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
} else {
  console.log('✅ Required environment variables are set');
}

process.exit(0);
