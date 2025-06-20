
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const body = await req.json()
  const { code, user_id, workspace_id } = body

  const client_id = Deno.env.get('GMAIL_CLIENT_ID')
  const client_secret = Deno.env.get('GMAIL_CLIENT_SECRET')
  const redirect_uri = Deno.env.get('GMAIL_REDIRECT_URI')

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id,
      client_secret,
      redirect_uri,
      grant_type: 'authorization_code'
    })
  })

  const tokenData = await tokenRes.json()
  const { access_token, refresh_token, expires_in } = tokenData

  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
    headers: { Authorization: `Bearer ${access_token}` }
  })
  const profile = await profileRes.json()

  const result = await supabase.from('email_accounts').insert({
    user_id,
    workspace_id,
    email_address: profile.email,
    refresh_token,
    access_token,
    token_expiry: new Date(Date.now() + expires_in * 1000).toISOString()
  })

  return new Response(JSON.stringify({ success: true, result }), { headers: { 'Content-Type': 'application/json' } })
})
