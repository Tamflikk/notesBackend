import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { body } from 'express-validator';
import { createTag, getTags, deleteTag } from '../controllers/tags.controller.js';

const router = Router();

/**
 * @swagger
 * /api/tags:
 *   post:
 *     tags: [Tags]
 *     summary: Create a new tag
 *     description: This endpoint creates a new tag for the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "work"
 *     responses:
 *       201:
 *         description: Tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tag created successfully"
 *                 tag:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "12345"
 *                     name:
 *                       type: string
 *                       example: "work"
 *       400:
 *         description: Invalid input or tag already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', [
  body('name').isString().notEmpty().withMessage('Tag name is required'),
  validate
], authenticate, createTag);

/**
 * @swagger
 * /api/tags:
 *   get:
 *     tags: [Tags]
 *     summary: Get all tags of the user
 *     description: This endpoint retrieves all tags associated with the user.
 *     security:
 *       - BearerAuth: []  # This indicates the endpoint requires a Bearer token
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "12345"
 *                   name:
 *                     type: string
 *                     example: "work"
 *       401:
 *         description: Unauthorized - User not logged in
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, getTags);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     tags: [Tags]
 *     summary: Delete a tag
 *     description: This endpoint deletes a tag. Optionally, you can reassign notes to another tag.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the tag to delete
 *         schema:
 *           type: string
 *           example: "12345"
 *       - name: newTagId
 *         in: query
 *         required: false
 *         description: The ID of the tag to assign notes to
 *         schema:
 *           type: string
 *           example: "67890"
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tag deleted successfully"
 *       400:
 *         description: Tag not found or invalid data
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, deleteTag);

export const tagsRoutes = router;
