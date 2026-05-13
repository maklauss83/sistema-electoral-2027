import { supabase } from '@/lib/supabase'

export const JerarquiaService = {

  async obtenerTodas() {
    const { data, error } = await supabase
      .from('relacion_jerarquica')
      .select(`
        *,
        superior:id_superior (id, nombre, apellido, rol),
        subordinado:id_subordinado (id, nombre, apellido, rol),
        seccion:id_seccion (id, numero_seccion)
      `)
      .eq('activo', true)
      .order('creado_en', { ascending: false })
    if (error) throw error
    return data
  },

  async obtenerArbol(idPersona) {
    const { data, error } = await supabase
      .from('relacion_jerarquica')
      .select(`
        *,
        subordinado:id_subordinado (id, nombre, apellido, rol, telefono)
      `)
      .eq('id_superior', idPersona)
      .eq('activo', true)
    if (error) throw error
    return data
  },

  async crear(relacion) {
    const { data, error } = await supabase
      .from('relacion_jerarquica')
      .insert({
        id_superior: relacion.id_superior,
        id_subordinado: relacion.id_subordinado,
        id_seccion: relacion.id_seccion || null,
        tipo_relacion: relacion.tipo_relacion,
        activo: true,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async eliminar(id) {
    const { error } = await supabase
      .from('relacion_jerarquica')
      .update({ activo: false })
      .eq('id', id)
    if (error) throw error
  },

  async obtenerResumenArbol() {
    const { data, error } = await supabase
      .from('relacion_jerarquica')
      .select(`
        tipo_relacion,
        superior:id_superior (nombre, apellido, rol),
        subordinado:id_subordinado (nombre, apellido, rol)
      `)
      .eq('activo', true)
    if (error) throw error
    return data
  },
}
