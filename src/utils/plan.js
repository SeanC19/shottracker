import { supabase } from '../supabase'

export async function getUserPlan() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'
  const { data } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  return data?.plan ?? 'free'
}
