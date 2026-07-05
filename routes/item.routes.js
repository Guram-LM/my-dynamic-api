import { Router } from 'express';
import { 
    createItem, 
    getAllItems, 
    getItemsWithPagination, 
    updateItem, 
    deleteItem 
} from '../controllers/item.controller.js';
import { authenticateAPI } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/store/:routeKey', authenticateAPI, uploadImage.single('image'), createItem);

router.get('/get/all/:routeKey', getAllItems); //სრული წამოღება ლიმიტის გარეშე
router.get('/get/page/:routeKey', getItemsWithPagination); //წამოღება პაგინაციით (მაგ: ?limit=20&page=1)

router.put('/update/:id', authenticateAPI, uploadImage.single('image'), updateItem);
router.delete('/delete/:id', authenticateAPI, deleteItem);

export default router;