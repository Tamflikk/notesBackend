import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  toggleArchiveNote,
  searchNotes,
} from '../controllers/notes.controller.js';

const router = Router();

router.use(authenticate); // All notes routes require authentication

/**
 * @swagger
 * /api/notes:
 *   post:
 *     tags: [Notes]
 *     summary: Create a new note
 *     description: This endpoint creates a new note with title, content, and optional tags.
 *     security:
 *       - BearerAuth: []  # Esto indica que se necesita un token Bearer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My first note"
 *               content:
 *                 type: string
 *                 example: "This is the content of the note."
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["work", "important"]
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "My first note"
 *                 content:
 *                   type: string
 *                   example: "This is the content of the note."
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["work", "important"]
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.post('/', [
  body('title').notEmpty(),
  body('content').optional(),
  body('tags').optional().isArray(),
  validate
], createNote);


/**
 * @swagger
 * /api/notes:
 *   get:
 *     tags: [Notes]
 *     summary: Get all notes with optional filters
 *     description: This endpoint retrieves all notes with optional filters for archived status and tags.
 *     security:
 *       - BearerAuth: []  # Esto indica que se necesita un token Bearer
 *     parameters:
 *       - name: archived
 *         in: query
 *         description: Filter notes by archived status (true/false)
 *         required: false
 *         schema:
 *           type: boolean
 *       - name: tag
 *         in: query
 *         description: Filter notes by specific tag
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: "My first note"
 *                   content:
 *                     type: string
 *                     example: "This is the content of the note."
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["work", "important"]
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/', [
  query('archived').optional().isBoolean(),
  query('tag').optional(),
  validate
], getNotes);


/**
 * @swagger
 * /api/notes/search:
 *   get:
 *     tags: [Notes]
 *     summary: Search notes by query
 *     description: This endpoint allows searching for notes using a query string.
 *     security:
 *       - BearerAuth: []  # Esto indica que se necesita un token Bearer
 *     parameters:
 *       - name: q
 *         in: query
 *         description: Search query string for note content or title
 *         required: true
 *         schema:
 *           type: string
 *           example: "important work"
 *     responses:
 *       200:
 *         description: A list of notes matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: "Important work note"
 *                   content:
 *                     type: string
 *                     example: "Content of the note about work."
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["work", "urgent"]
 *       400:
 *         description: Invalid search query
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/search', [
  query('q').notEmpty(),
  validate
], searchNotes);

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     tags: [Notes]
 *     summary: Get a note by its ID
 *     description: This endpoint retrieves a specific note by its ID.
 *     security:
 *       - BearerAuth: []  # Esto indica que se necesita un token Bearer
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the note to retrieve
 *         required: true
 *         schema:
 *           type: string
 *           example: 1
 *     responses:
 *       200:
 *         description: The requested note
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "Important work note"
 *                 content:
 *                   type: string
 *                   example: "Content of the note about work."
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["work", "urgent"]
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Note not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getNoteById);

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     tags: [Notes]
 *     summary: Update a note by its ID
 *     description: This endpoint updates a note with new data for title, content, and tags.
 *     security:
 *       - BearerAuth: []  # Esto indica que se necesita un token Bearer
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the note to update
 *         required: true
 *         schema:
 *           type: string
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated note title"
 *               content:
 *                 type: string
 *                 example: "Updated content of the note."
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["work", "important"]
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "Updated note title"
 *                 content:
 *                   type: string
 *                   example: "Updated content of the note."
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["work", "important"]
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Note not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', [
  body('title').optional(),
  body('content').optional(),
  body('tags').optional().isArray(),
  validate
], updateNote);


/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     tags: [Notes]
 *     summary: Delete a note by its ID
 *     description: This endpoint deletes a specific note by its ID.
 *     security:
 *       - BearerAuth: []  # Esto indica que se necesita un token Bearer
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the note to delete
 *         required: true
 *         schema:
 *           type: string
 *           example: 1
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Note deleted successfully"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Note not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteNote);

/**
 * @swagger
 * /api/notes/{id}/toggle-archive:
 *   patch:
 *     tags: [Notes]
 *     summary: Toggle the archive state of a note by its ID
 *     description: This endpoint toggles the archive state (archived/unarchived) of a note by its ID.
 *     security:
 *       - BearerAuth: []  # Esto indica que se necesita un token Bearer
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the note to toggle archive state
 *         required: true
 *         schema:
 *           type: string
 *           example: 1
 *     responses:
 *       200:
 *         description: Note archive state toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Note archive state toggled successfully"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Note not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/toggle-archive', toggleArchiveNote);


export const notesRoutes = router;