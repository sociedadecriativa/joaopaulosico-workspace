import { useState, useEffect } from 'react'
import type { BrandContext } from '../types'
import { supabase } from '../lib/supabase'
import { DEFAULT_BRAND } from '../lib/brandPrompt'

export function useBrand() {
  const [brand, setBrand] = useState<BrandContext>(DEFAULT_BRAND)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBrand()
  }, [])

  async function loadBrand() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('brand_context')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) setBrand(data as BrandContext)
    } catch {
      // use default
    } finally {
      setLoading(false)
    }
  }

  async function updateBrand(updates: Partial<BrandContext>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const updated = { ...brand, ...updates }
    setBrand(updated)

    await supabase
      .from('brand_context')
      .upsert({ ...updated, user_id: user.id })
  }

  return { brand, loading, updateBrand, reload: loadBrand }
}
