import { supabase } from '@/lib/supabase'

// ── PersonaService: toda la lógica de negocio para personas ──────

export const PersonaService = {

  async obtenerTodas() {
    const { data, error } = await supabase
      .from('persona')
      .select('*')
      .order('nombre', { ascending: true })
    if (error) throw error
    return data
  },

  async obtenerPorId(id) {
    const { data, error } = await supabase
      .from('persona')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async obtenerPorRol(rol) {
    const { data, error } = await supabase
      .from('persona')
      .select('*')
      .eq('rol', rol)
      .eq('activo', true)
      .order('nombre')
    if (error) throw error
    return data
  },

  async obtenerMisSubordinados(idSuperior) {
    const { data, error } = await supabase
      .from('relacion_jerarquica')
      .select(`
        id_subordinado,
        tipo_relacion,
        persona:id_subordinado (*)
      `)
      .eq('id_superior', idSuperior)
      .eq('activo', true)
    if (error) throw error
    return data.map(r => ({ ...r.persona, tipo_relacion: r.tipo_relacion }))
  },

  async crear(persona) {
    // Si tiene correo, crear usuario en Supabase Auth primero
    if (persona.correo && persona.password) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: persona.correo,
        password: persona.password,
      })
      if (authError) throw authError

      const { data, error } = await supabase
        .from('persona')
        .insert({
          nombre: persona.nombre.trim(),
          apellido: persona.apellido.trim(),
          telefono: persona.telefono?.trim() || null,
          correo: persona.correo.trim(),
          rol: persona.rol,
          supabase_uid: authData.user?.id || null,
          activo: true,
        })
        .select()
        .single()
      if (error) throw error
      return data
    }

    // Sin login (ciudadanos)
    const { data, error } = await supabase
      .from('persona')
      .insert({
        nombre: persona.nombre.trim(),
        apellido: persona.apellido.trim(),
        telefono: persona.telefono?.trim() || null,
        correo: persona.correo?.trim() || null,
        rol: persona.rol,
        activo: true,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async actualizar(id, persona) {
    const { data, error } = await supabase
      .from('persona')
      .update({
        nombre: persona.nombre.trim(),
        apellido: persona.apellido.trim(),
        telefono: persona.telefono?.trim() || null,
        correo: persona.correo?.trim() || null,
        rol: persona.rol,
        activo: persona.activo,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async desactivar(id) {
    const { data, error } = await supabase
      .from('persona')
      .update({ activo: false })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async eliminar(id) {
    const { error } = await supabase
      .from('persona')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async obtenerEstadisticas() {
    const { data, error } = await supabase
      .from('persona')
      .select('rol, activo')
    if (error) throw error

    const stats = {
      total: data.length,
      activos: data.filter(p => p.activo).length,
      por_rol: {},
    }
    data.forEach(p => {
      stats.por_rol[p.rol] = (stats.por_rol[p.rol] || 0) + 1
    })
    return stats
  },
}
