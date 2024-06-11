const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectDB } = require('./database');
const clientRoutes = require('./routes');

const app = express();
app.use(cors());

app.use(bodyParser.json());

app.get('/', async (req, res) => {
    res.send("Server is running")
});

app.use('/api', clientRoutes);

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();
