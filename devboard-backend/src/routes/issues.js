const express = require('express');
const router = express.Router({ mergeParams: true });
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

// Middleware — check if logged in user is a member of the project
const requireMember = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }

    req.userRole = result.rows[0].role;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/projects/:id/issues — get all issues with optional filters
router.get('/', requireMember, async (req, res) => {
  const { id } = req.params;
  const { status, priority, assignee_id } = req.query;

  try {
    let query = `
      SELECT i.*, 
        u1.name as assignee_name, 
        u1.email as assignee_email,
        u2.name as created_by_name
      FROM issues i
      LEFT JOIN users u1 ON i.assignee_id = u1.id
      LEFT JOIN users u2 ON i.created_by = u2.id
      WHERE i.project_id = $1
    `;

    const params = [id];

    if (status) {
      params.push(status);
      query += ` AND i.status = $${params.length}`;
    }

    if (priority) {
      params.push(priority);
      query += ` AND i.priority = $${params.length}`;
    }

    if (assignee_id) {
      params.push(assignee_id);
      query += ` AND i.assignee_id = $${params.length}`;
    }

    query += ' ORDER BY i.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ issues: result.rows });
  } catch (err) {
    console.error('Get issues error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects/:id/issues/:issueId — get single issue
router.get('/:issueId', requireMember, async (req, res) => {
  const { id, issueId } = req.params;

  try {
    const result = await pool.query(
      `SELECT i.*,
        u1.name as assignee_name,
        u1.email as assignee_email,
        u2.name as created_by_name
       FROM issues i
       LEFT JOIN users u1 ON i.assignee_id = u1.id
       LEFT JOIN users u2 ON i.created_by = u2.id
       WHERE i.id = $1 AND i.project_id = $2`,
      [issueId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ issue: result.rows[0] });
  } catch (err) {
    console.error('Get issue error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects/:id/issues — create an issue
router.post('/', requireMember, async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, assignee_id, due_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Issue title is required' });
  }

  try {
    // If assignee provided, verify they are a project member
    if (assignee_id) {
      const memberCheck = await pool.query(
        'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
        [id, assignee_id]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Assignee must be a project member' });
      }
    }

    const result = await pool.query(
      `INSERT INTO issues 
        (title, description, priority, assignee_id, due_date, project_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, priority || 'medium', assignee_id || null, due_date || null, id, req.user.userId]
    );

    res.status(201).json({
      message: 'Issue created successfully',
      issue: result.rows[0]
    });
  } catch (err) {
    console.error('Create issue error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/projects/:id/issues/:issueId — update an issue
router.patch('/:issueId', requireMember, async (req, res) => {
  const { id, issueId } = req.params;
  const { title, description, status, priority, assignee_id, due_date } = req.body;

  try {
    // Check issue exists in this project
    const issueCheck = await pool.query(
      'SELECT * FROM issues WHERE id = $1 AND project_id = $2',
      [issueId, id]
    );

    if (issueCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const current = issueCheck.rows[0];

    // If assignee provided, verify they are a project member
    if (assignee_id) {
      const memberCheck = await pool.query(
        'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
        [id, assignee_id]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Assignee must be a project member' });
      }
    }

    const result = await pool.query(
      `UPDATE issues SET
        title = $1,
        description = $2,
        status = $3,
        priority = $4,
        assignee_id = $5,
        due_date = $6
       WHERE id = $7 AND project_id = $8
       RETURNING *`,
      [
        title || current.title,
        description || current.description,
        status || current.status,
        priority || current.priority,
        assignee_id || current.assignee_id,
        due_date || current.due_date,
        issueId,
        id
      ]
    );

    res.json({
      message: 'Issue updated successfully',
      issue: result.rows[0]
    });
  } catch (err) {
    console.error('Update issue error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/projects/:id/issues/:issueId/status — transition issue status
router.patch('/:issueId/status', requireMember, async (req, res) => {
  const { id, issueId } = req.params;
  const { status } = req.body;

  // 1. Validate status value
  const validStatuses = ['todo', 'in_progress', 'done'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status. Must be todo, in_progress, or done' 
    });
  }

  try {
    // 2. Get current status
    const issueResult = await pool.query(
      'SELECT * FROM issues WHERE id = $1 AND project_id = $2',
      [issueId, id]
    );

    if (issueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const currentStatus = issueResult.rows[0].status;

    // 3. Validate transition
    const validTransitions = {
      todo: ['in_progress'],
      in_progress: ['done', 'todo'],
      done: ['todo']
    };

    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({ 
        error: `Cannot transition from ${currentStatus} to ${status}` 
      });
    }

    // 4. Update status
    const result = await pool.query(
      'UPDATE issues SET status = $1 WHERE id = $2 AND project_id = $3 RETURNING *',
      [status, issueId, id]
    );

    res.json({
      message: `Issue status updated to ${status}`,
      issue: result.rows[0]
    });
  } catch (err) {
    console.error('Status transition error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id/issues/:issueId — delete an issue
router.delete('/:issueId', requireMember, async (req, res) => {
  const { id, issueId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM issues WHERE id = $1 AND project_id = $2 RETURNING *',
      [issueId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    console.error('Delete issue error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;