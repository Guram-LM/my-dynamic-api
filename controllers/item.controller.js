import db from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const deleteFileFromDisk = (imageUrl) => {
    if (!imageUrl) return;
    try {
  
        const fileName = imageUrl.split('/uploads/')[1];
        if (fileName) {
            const filePath = path.join(__dirname, '../public/uploads', fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    } catch (err) {
        console.error('ფაილის წაშლის შეცდომა დისკიდან:', err.message);
    }
};

export const createItem = (req, res) => {
    const { routeKey } = req.params;
    const payload = { ...req.body };
    
    let imageUrl = null;
    if (req.file) {
        imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    try {
        const stmt = db.prepare('INSERT INTO items (dynamic_key, data, image_url) VALUES (?, ?, ?)');
        const result = stmt.run(routeKey, JSON.stringify(payload), imageUrl);
        
        res.status(201).json({
            success: true,
            id: result.lastInsertRowid,
            image_url: imageUrl
        });
    } catch (error) {
        if (req.file) deleteFileFromDisk(imageUrl); 
        res.status(500).json({ success: false, error: 'მონაცემების შენახვისას დაფიქსირდა შეცდომა' });
    }
};

export const getAllItems = (req, res) => {
    const { routeKey } = req.params;

    try {
        const stmt = db.prepare('SELECT * FROM items WHERE dynamic_key = ? ORDER BY id DESC');
        const rows = stmt.all(routeKey);

        const formattedData = rows.map(row => ({
            id: row.id,
            dynamic_key: row.dynamic_key,
            data: JSON.parse(row.data),
            image_url: row.image_url,
            created_at: row.created_at
        }));

        res.json({ success: true, count: formattedData.length, data: formattedData });
    } catch (error) {
        res.status(500).json({ success: false, error: 'მონაცემების წამოღება ვერ მოხერხდა' });
    }
};


export const getItemsWithPagination = (req, res) => {
    const { routeKey } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    try {
        const stmt = db.prepare('SELECT * FROM items WHERE dynamic_key = ? ORDER BY id DESC LIMIT ? OFFSET ?');
        const rows = stmt.all(routeKey, limit, offset);

        const formattedData = rows.map(row => ({
            id: row.id,
            dynamic_key: row.dynamic_key,
            data: JSON.parse(row.data),
            image_url: row.image_url,
            created_at: row.created_at
        }));

        res.json({
            success: true,
            meta: { page, limit, count: formattedData.length },
            data: formattedData
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'მონაცემების წამოღება ვერ მოხერხდა' });
    }
};


export const updateItem = (req, res) => {
    const { id } = req.params;
    const payload = req.body;

    try {
        const currentItem = db.prepare('SELECT image_url FROM items WHERE id = ?').get(id);
        if (!currentItem) {
            if (req.file) fs.unlinkSync(req.file.path); 
            return res.status(404).json({ success: false, error: 'ჩანაწერი ვერ მოიძებნა' });
        }

        let imageUrl = currentItem.image_url;

        if (req.file) {
     
            deleteFileFromDisk(currentItem.image_url);
        
            imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const stmt = db.prepare('UPDATE items SET data = ?, image_url = ? WHERE id = ?');
        const result = stmt.run(JSON.stringify(payload), imageUrl, id);

        res.json({ success: true, message: `ჩანაწერი ID: ${id} წარმატებით განახლდა`, image_url: imageUrl });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, error: 'განახლებისას დაფიქსირდა შეცდომა' });
    }
};


export const deleteItem = (req, res) => {
    const { id } = req.params;

    try {
        
        const item = db.prepare('SELECT image_url FROM items WHERE id = ?').get(id);
        
        if (!item) {
            return res.status(404).json({ success: false, error: 'ჩანაწერი ვერ მოიძებნა' });
        }

        deleteFileFromDisk(item.image_url);

        const stmt = db.prepare('DELETE FROM items WHERE id = ?');
        stmt.run(id);

        res.json({ success: true, message: `ჩანაწერი ID: ${id} და მისი ფაილი წარმატებით წაიშალა` });
    } catch (error) {
        res.status(500).json({ success: false, error: 'წაშლისას დაფიქსირდა შეცდომა' });
    }
};