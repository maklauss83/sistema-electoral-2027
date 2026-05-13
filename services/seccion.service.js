import { supabase } from '@/lib/supabase'

export const SeccionService = {

  async obtenerTodas() {
    const { data, error } = await supabase
      .from('seccion')
      .select(`
        *,
        candidato:id_candidato (id, nombre, apellido),
        coordinadores:seccion_coordinador (
          id,
          activo,
          persona:id_persona (id, nombre, apellido, rol)
        )
      `)
      .order('numero_seccion', { ascending: true })
    if (error) throw error
    return data
  },

  async obtenerPorId(id) {
    const { data, error } = await supabase
      .from('seccion')
      .select(`
        *,
        candidato:id_candidato (id, nombre, apellido),
        coordinadores:seccion_coordinador (
          id, activo,
          persona:id_persona (id, nombre, apellido, rol, telefono, correo)
        )
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async obtenerMisSecciones(idPersona) {
    const { data, error } = await supabase
      .from('seccion_coordinador')
      .select(`
        seccion:id_seccion (*)
      `)
      .eq('id_persona', idPersona)
      .eq('activo', true)
    if (error) throw error
    return data.map(r => r.seccion)
  },

  async crear(seccion, idCandidato) {
    const { data, error } = await supabase
      .from('seccion')
      .insert({
        numero_seccion: seccion.numero_seccion.trim(),
        descripcion: seccion.descripcion?.trim() || null,
        id_candidato: idCandidato,
        activa: true,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async actualizar(id, seccion) {
    const { data, error } = await supabase
      .from('seccion')
      .update({
        numero_seccion: seccion.numero_seccion.trim(),
        descripcion: seccion.descripcion?.trim() || null,
        activa: seccion.activa,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async eliminar(id) {
    const { error } = await supabase
      .from('seccion')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async asignarCoordinador(idSeccion, idPersona) {
    const { data, error } = await supabase
      .from('seccion_coordinador')
      .insert({ id_seccion: idSeccion, id_persona: idPersona, activo: true })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async quitarCoordinador(idSeccion, idPersona) {
    const { error } = await supabase
      .from('seccion_coordinador')
      .delete()
      .eq('id_seccion', idSeccion)
      .eq('id_persona', idPersona)
    if (error) throw error
  },
}
