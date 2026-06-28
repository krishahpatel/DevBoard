const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

// All routes here are protected
router.use(authenticateToken);

// POST /api/projects — create a project
router.post('/', async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.user.userId]
    );

    res.status(201).json({
      message: 'Project created successfully',
      project: result.rows[0]
    });
  } catch (err) {
    console.error('Create project error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects — get all projects owned by logged in user
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE owner_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json({ projects: result.rows });
  } catch (err) {
    console.error('Get projects error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects/:id — get a single project
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND owner_id = $2',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project: result.rows[0] });
  } catch (err) {
    console.error('Get project error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/projects/:id — update a project
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE projects SET name = $1, description = $2 WHERE id = $3 AND owner_id = $4 RETURNING *',
      [name, description, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    res.json({
      message: 'Project updated successfully',
      project: result.rows[0]
    });
  } catch (err) {
    console.error('Update project error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id — delete a project
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND owner_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Delete project error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;