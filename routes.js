const express = require('express');
const {
    getAllClients,
    createClient,
    getClientById,
    updateClient,
    deleteClient,
    searchClients,
} = require('./controllers/clientController');
const {fetchClients} = require('./crawler');

const router = express.Router();

router.get('/fetch', fetchClients);
router.get('/clients', getAllClients);
router.post('/clients', createClient);
router.get('/clients/:id', getClientById);
router.post('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);
router.get('/clientsSearch', searchClients);

module.exports = router;
