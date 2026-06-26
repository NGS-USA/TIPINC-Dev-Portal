import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadAttachment(file, requestContext) {
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${requestContext}/${timestamp}_${sanitizedName}`

  const { data, error } = await supabase.storage
    .from('request-attachments')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw new Error(error.message)

  const { data: urlData } = supabase.storage
    .from('request-attachments')
    .getPublicUrl(path)

  return {
    name: file.name,
    url: urlData.publicUrl,
    size: file.size,
    type: file.type,
    path
  }
}