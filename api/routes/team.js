import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const db = new Database(path.join(__dirname, '../data/sprint_strategist.db'));

// Get all team members
router.get('/', (req, res) => {
    try {
        const members = db.prepare('SELECT * FROM team_members WHERE is_active = 1').all();
        res.json({ success: true, data: members });
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add new member
router.post('/', (req, res) => {
    try {
        const { name, email, role, capacity } = req.body;
        const id = 'member-' + Math.random().toString(36).substr(2, 9);
        const avatar_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

        db.prepare(`
            INSERT INTO team_members (id, name, email, role, capacity, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, name, email, role, capacity, avatar_url);

        const newMember = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
        res.json({ success: true, data: newMember });
    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update member
router.patch('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(id);

        db.prepare(`
            UPDATE team_members 
            SET ${fields}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(...values);

        const updatedMember = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
        res.json({ success: true, data: updatedMember });
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete member (soft delete)
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        db.prepare('UPDATE team_members SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
        res.json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
