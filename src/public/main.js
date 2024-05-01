const socket = io();
const {accomplishActivity} = require('../controllers/activityController');


socket.on('accomplishActivity', (data) => accomplishActivity());

