import { Router } from 'express';
import path from 'path';
import { HTML_FILES_PATH } from '../config';
import { getVisibleRooms } from '../helpers/roomsHelpers';
import { MAXIMUM_USERS_FOR_ONE_ROOM } from '../socket/config';

const router = Router();

router.get('/', (req, res) => {
	const page = path.join(HTML_FILES_PATH, 'game.html');
	res.sendFile(page);
});

router.get('/rooms', (req, res, next) => {
	const rooms = getVisibleRooms(MAXIMUM_USERS_FOR_ONE_ROOM);
	const data = {
		rooms,
		maxUsers: MAXIMUM_USERS_FOR_ONE_ROOM
	}
	res.json(data)
})

export default router;
