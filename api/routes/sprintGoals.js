import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const db = new Database(path.join(__dirname, '../data/sprint_strategist.db'));

// Initialize sprint goals table
db.exec(`
  CREATE TABLE IF NOT EXISTS sprint_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sprint_id TEXT DEFAULT 'SPRINT-2024-01',
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    target_value REAL NOT NULL,
    current_value REAL DEFAULT 0,
    unit TEXT DEFAULT 'points',
    status TEXT DEFAULT 'not_started',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get all goals for current sprint
router.get('/', (req, res) => {
  try {
    const goals = db.prepare(`
      SELECT * FROM sprint_goals 
      WHERE sprint_id = 'SPRINT-2024-01'
      ORDER BY created_at DESC
    `).all();

    res.json({
      success: true,
      goals: goals
    });
  } catch (error) {
    console.error('Error fetching sprint goals:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new goal
router.post('/', (req, res) => {
  try {
    const { title, description, priority, target_value = 100, unit = 'points' } = req.body;

    const result = db.prepare(`
      INSERT INTO sprint_goals (title, description, priority, target_value, unit)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, description, priority || 'medium', target_value, unit);

    const newGoal = db.prepare(`
      SELECT * FROM sprint_goals WHERE id = ?
    `).get(result.lastInsertRowid);

    res.json({
      success: true,
      goal: newGoal
    });
  } catch (error) {
    console.error('Error creating sprint goal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update goal
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);

    db.prepare(`
      UPDATE sprint_goals 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(...values);

    const updatedGoal = db.prepare(`
      SELECT * FROM sprint_goals WHERE id = ?
    `).get(id);

    res.json({
      success: true,
      goal: updatedGoal
    });
  } catch (error) {
    console.error('Error updating sprint goal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete goal
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    db.prepare(`
      DELETE FROM sprint_goals WHERE id = ?
    `).run(id);

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sprint goal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;