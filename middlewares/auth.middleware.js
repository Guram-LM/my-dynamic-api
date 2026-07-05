import dotenv from 'dotenv';
dotenv.config();

export const authenticateAPI = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ 
            success: false, 
            error: 'მიწვდომა უარყოფილია: არასწორი ან არარსებული API გასაღები' 
        });
    }
    next();
};