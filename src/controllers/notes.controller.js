import { supabase } from '../config/supabase.js';

export const createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.user?.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required to create a note.' });
    }

    const { data: note, error } = await supabase
      .from('notes')
      .insert({ title, content, user_id: userId })
      .select()
      .single();

    if (error) return res.status(400).json({ error: `Failed to create note: ${error.message}` });

    if (tags?.length) {
      const tagInserts = tags.map(tagName => ({ user_id: userId, name: tagName }));
      const { data: createdTags, error: tagError } = await supabase
        .from('tags')
        .upsert(tagInserts, { onConflict: 'user_id,name' })
        .select();

      if (tagError) return res.status(400).json({ error: `Failed to associate tags: ${tagError.message}` });

      const noteTags = createdTags.map(tag => ({ note_id: note.id, tag_id: tag.id }));
      const { error: noteTagError } = await supabase.from('note_tags').insert(noteTags);

      if (noteTagError) return res.status(400).json({ error: `Failed to link tags to note: ${noteTagError.message}` });
    }

    res.status(201).json({ message: 'Note created successfully.', note });
  } catch (error) {
    res.status(500).json({ error: `Unexpected error: ${error.message}` });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { archived, tag } = req.query;
    const userId = req.user?.id;

    let query = supabase
      .from('notes')
      .select('*, tags:note_tags(tag:tags(*))')
      .eq('user_id', userId);

    if (archived !== undefined) query = query.eq('is_archived', archived === 'true');
    if (tag) query = query.contains('tags.tag.name', [tag]);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: `Failed to retrieve notes: ${error.message}` });

    res.json({ message: 'Notes retrieved successfully.', notes: data });
  } catch (error) {
    res.status(500).json({ error: `Unexpected error: ${error.message}` });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('notes')
      .select('*, tags:note_tags(tag:tags(*))')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) return res.status(400).json({ error: `Failed to retrieve note: ${error.message}` });
    if (!data) return res.status(404).json({ message: 'Note not found' });

    res.json({ message: 'Note retrieved successfully.', note: data });
  } catch (error) {
    res.status(500).json({ error: `Unexpected error: ${error.message}` });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user?.id;

    if (!title && content === undefined) {
      return res.status(400).json({ error: 'At least title or content must be provided for updating.' });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (title) updates.title = title;
    if (content !== undefined) updates.content = content;

    const { data: note, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: `Failed to update note: ${error.message}` });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (tags) {
      await supabase.from('note_tags').delete().eq('note_id', id);

      const tagInserts = tags.map(tagName => ({ user_id: userId, name: tagName }));
      const { data: createdTags, error: tagError } = await supabase
        .from('tags')
        .upsert(tagInserts, { onConflict: 'user_id,name' })
        .select();

      if (tagError) return res.status(400).json({ error: `Failed to associate tags: ${tagError.message}` });

      const noteTags = createdTags.map(tag => ({ note_id: id, tag_id: tag.id }));
      const { error: noteTagError } = await supabase.from('note_tags').insert(noteTags);

      if (noteTagError) return res.status(400).json({ error: `Failed to link tags to note: ${noteTagError.message}` });
    }

    res.json({ message: 'Note updated successfully.', note });
  } catch (error) {
    res.status(500).json({ error: `Unexpected error: ${error.message}` });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', userId);

    if (error) return res.status(400).json({ error: `Failed to delete note: ${error.message}` });

    res.status(204).json({ message: 'Note deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: `Unexpected error: ${error.message}` });
  }
};

export const toggleArchiveNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const { data: currentNote, error: fetchError } = await supabase
      .from('notes')
      .select('is_archived')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) return res.status(400).json({ error: `Failed to retrieve note state: ${fetchError.message}` });
    if (!currentNote) return res.status(404).json({ message: 'Note not found' });

    const newArchivedState = !currentNote.is_archived;

    const { data, error } = await supabase
      .from('notes')
      .update({ is_archived: newArchivedState })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: `Failed to toggle archive state: ${error.message}` });

    res.json({ message: `Note archive state changed to ${newArchivedState ? 'archived' : 'unarchived'}.`, note: data });
  } catch (error) {
    res.status(500).json({ error: `Unexpected error: ${error.message}` });
  }
};

export const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('notes')
      .select('*, tags:note_tags(tag:tags(*))')
      .eq('user_id', userId)
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`);

    if (error) return res.status(400).json({ error: `Failed to search notes: ${error.message}` });

    res.json({ message: 'Search results retrieved successfully.', notes: data });
  } catch (error) {
    res.status(500).json({ error: `Unexpected error: ${error.message}` });
  }
};
