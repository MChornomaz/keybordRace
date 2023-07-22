import { Router } from 'express';
import path from 'path';
import { HTML_FILES_PATH } from '../config';
import { getActiveRooms } from '../helpers/roomsHelpers';

const router = Router();

router.get('/', (req, res) => {
	const page = path.join(HTML_FILES_PATH, 'game.html');
	res.sendFile(page);
});

router.get('/rooms', (req, res, next) => {
	const rooms = getActiveRooms();
	res.json(rooms)
})

export default router;
