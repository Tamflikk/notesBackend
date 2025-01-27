import { supabase } from '../config/supabase.js';

// Crear una nueva etiqueta
export const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    // Verificar si la etiqueta ya existe
    const { data, error } = await supabase
      .from('tags')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name)
      .limit(1); // Limitar a 1 para mejorar el rendimiento

    if (error) {
      // Log de error para depuración
      console.log("Error checking tag:", error);
      return res.status(500).json({ error: 'Error checking tag' });
    }

    // Si no se encuentra ningún registro
    if (data && data.length > 0) {
      return res.status(400).json({ error: 'Tag already exists' });
    }

    // Crear la nueva etiqueta
    const { data: createdTag, error: insertError } = await supabase
      .from('tags')
      .insert({ name, user_id: userId })
      .select()
      .single();

    if (insertError) {
      console.log("Error creating tag:", insertError);
      return res.status(500).json({ error: 'Failed to create tag' });
    }

    res.status(201).json({ message: 'Tag created successfully', tag: createdTag });
  } catch (error) {
    console.log("Unexpected error:", error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
}; 

// Obtener todas las etiquetas de un usuario
export const getTags = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId);

    if (error) return res.status(500).json({ error: 'Failed to retrieve tags' });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tags' });
  }
};

// Eliminar una etiqueta
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { newTagId } = req.body; // ID de la nueva etiqueta para reasignar notas

    // Eliminar la relación de la etiqueta con las notas
    if (newTagId) {
      await supabase
        .from('note_tags')
        .update({ tag_id: newTagId })
        .eq('tag_id', id)
        .eq('user_id', userId);
    }

    // Eliminar la etiqueta
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) return res.status(500).json({ error: 'Failed to delete tag' });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tag' });
  }
};
