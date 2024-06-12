const { validateFields } = require('../crawler');
const { Client } = require('../models/client');
const { Client: esClientt } = require("@elastic/elasticsearch");  
const esClient = new esClientt({
  node: "http://localhost:9200",
  auth: {
    username: "elastic",
    password: "Ajay@123",
  },
});


const getAllClients = async (req, res) => {
    try {
        const clients = await Client.findAll();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createClient = async (req, res) => {
    try {
        const {name, email, cin, pin} = req.body;
        const client = await Client.create(req.body);
        await esClient.index({
            index: 'clients',
            id: cin.toString(),
            body: {
                name,
                cin,
                email
            }
        });
        res.status(201).json(client);
        // if(validateFields(cin, pin, email)){
        // } else {
        //     res.status(500).json({ error: 'Data not valid' });
        // }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getClientById = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (client) {
            res.json(client);
        } else {
            res.status(404).json({ error: 'Client not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateClient = async (req, res) => {
    try {
        const {name, email, cin, pin} = req.body;
        if(validateFields(cin, pin, email)) {
            const [updated] = await Client.update(req.body, {
                where: { cin: req.params.id },
            });
            // update elastic search index also
            await esClient.index({
                index: 'clients',
                id: cin.toString(),
                body: {
                    name,
                    cin,
                    email
                }
            });
            if (updated) {
                const updatedClient = await Client.findByPk(req.params.id);
                res.status(200).json(updatedClient);
            } else {
                res.status(404).json({ error: 'Client not found' });
            }
        } else {
            res.status(500).json({ error: 'Data not valid' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteClient = async (req, res) => {
    try {
        const deleted = await Client.destroy({
            where: { cin: req.params.id },
        });
        if (deleted) {
            res.status(204).json();
        } else {
            res.status(404).json({ error: 'Client not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const searchClients = async (req, res) => {
    try {
        const term = req.query.q.toLowerCase();
        // const clients = await Client.findAll({
        //     where: {
        //         [Sequelize.Op.or]: [
        //             { name: { [Sequelize.Op.like]: `%${term}%` } },
        //             { email: { [Sequelize.Op.like]: `%${term}%` } },
        //             { cin: { [Sequelize.Op.like]: `%${term}%` } },
        //             { pin: { [Sequelize.Op.like]: `%${term}%` } },
        //         ],
        //     },
        // });
        // SELECT * FROM client WHERE name LIKE 'term%' OR email LIKE '%term%' OR cin LIKE '%term%';
                
        // ALTER
        // IF table EXISTS - don't create else create table


        // CREATE TABLE Client (
        //     cin varchar(21) UNIQUE NOT NULL,
        //     pin int() NOT NULL,
        //     name varchar(255) NOT NULL,
        //     email varchar(255) NOT NULL,
        //     primarykey as cin
        // )
        const {hits} = await esClient.search({
            index: 'clients',
            body: {
              query: {
                bool: {
                  should: [
                    { wildcard: { name: `*${term}*` } },
                    { wildcard: { email: `*${term}*` } },
                    { wildcard: { cin: `*${term}*` } }
                  ]
                }
              }
            },
            size: 1000
          });
        res.json({data: hits.hits});
    } catch (error) {
        res.status(500).json({ error: error.message, hyy:'adsdjhas' });
    }
};

module.exports = {
    getAllClients,
    createClient,
    getClientById,
    updateClient,
    deleteClient,
    searchClients,
};
