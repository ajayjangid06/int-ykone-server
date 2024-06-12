const { validateFields } = require("../crawler")

const validate = async (req, res, next) => {
    const {email, cin, pin} = req.body;
    if(validateFields(cin, pin, email)){
        next();
    } else {
        res.status(500).json({ error: 'Data not valid' });
    }
}

module.exports = {validate}