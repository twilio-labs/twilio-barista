const router = require('express').Router();
const bodyParser = require('body-parser');

const { gateForAdmin } = require('../../utils/auth');
const numbers = require('./numbers');
const events = require('./events');
const metrics = require('./metrics');

const parseJsonBody = bodyParser.json();

router.get('/numbers', numbers.get);
router.get('/events', events.get);
router.get('/metrics/:eventId', metrics.get);
router.post(
  '/notification',
  gateForAdmin,
  parseJsonBody,
  require('./notification').handler
);

// router.post('/numbers', gateForAdmin, parseJsonBody, numbers.post);
router.post('/events', gateForAdmin, parseJsonBody, events.create);
router.post('/reset', gateForAdmin, require('./reset').handler);
router.post('/setup', gateForAdmin, require('./setup').handler);

router.delete('/events/:eventId', gateForAdmin, events.delete);

module.exports = router;
