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

  if (!tokenRes.ok) {
    const error = await tokenRes.text()
    return new Response(JSON.stringify({ error: 'Failed to exchange token', detail: error }), { status: 400 })
  }

  const tokenData = await tokenRes.json()
  const { access_token, refresh_token, expires_in } = tokenData

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
    headers: { Authorization: `Bearer ${access_token}` }
  })
  const profile = await profileRes.json()

  // Encrypt refresh token via RPC
  const encryptResult = await supabase.rpc('encrypt_refresh_token', {
    token: refresh_token
  })

  if (encryptResult.error) {
    return new Response(JSON.stringify({ error: 'Token encryption failed', detail: encryptResult.error.message }), { status: 500 })
  }

  const result = await supabase.from('email_accounts').insert({
    user_id,
    workspace_id,
    email_address: profile.email,
    refresh_token_encrypted: encryptResult.data,
    access_token,
    token_expiry: new Date(Date.now() + expires_in * 1000).toISOString()
  })

  return new Response(JSON.stringify({ success: true, result }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
