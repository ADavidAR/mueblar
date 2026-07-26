import { supabase } from './supabaseClient'

const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET

// Sube un archivo al bucket público de Supabase Storage y devuelve su URL pública.
export async function uploadFile(file, folder = '') {
  if (!supabase) throw new Error('Supabase no está configurado (faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).')

  const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const path = `${folder ? `${folder}/` : ''}${Date.now()}-${cleanName}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
