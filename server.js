import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import itemRoutes from './routes/item.routes.js';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 

app.use('/api', itemRoutes);


app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, error: `ფაილის ატვირთვის შეცდომა: ${err.message}` });
    }
    if (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
    next();
});

app.listen(PORT, () => {
    console.log(`🚀 სერვერი წარმატებით გაეშვა პორტზე: http://localhost:${PORT}`);
});