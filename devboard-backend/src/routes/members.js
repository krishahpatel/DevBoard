const express = require('express');
const router = express.Router({ mergeParams: true });
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

// Middleware — check if logged in user is owner of the project
const requireOwner = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (result.rows.length === 0 || result.rows[0].role !== 'owner') {
      return res.status(403).json({ error: 'Only the project owner can do this' });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/projects/:id/members — list all members
router.get('/', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if requesting user is a member of this project
    const memberCheck = await pool.query(
      'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }

    // Get all members with their user info
    const result = await pool.query(
      `SELECT pm.id, pm.role, pm.joined_at, u.id as user_id, u.name, u.email
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1
       ORDER BY pm.joined_at ASC`,
      [id]
    );

    res.json({ members: result.rows });
  } catch (err) {
    console.error('Get members error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects/:id/members — invite a member (owner only)
router.post('/', requireOwner, async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // 1. Find user by email
    const userResult = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'No user found with that email' });
    }

    const invitedUser = userResult.rows[0];

    // 2. Check if already a member
    const existingMember = await pool.query(
      'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, invitedUser.id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a member of this project' });
    }

    // 3. Add as member
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [id, invitedUser.id, 'member']
    );

    res.status(201).json({
      message: `${invitedUser.name} added to the project successfully`,
      user: invitedUser
    });
  } catch (err) {
    console.error('Add member error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id/members/:userId — remove a member (owner only)
router.delete('/:userId', requireOwner, async (req, res) => {
  const { id, userId } = req.params;

  // Owner can't remove themselves
  if (parseInt(userId) === req.user.userId) {
    return res.status(400).json({ error: 'Owner cannot remove themselves from the project' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('Remove member error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;