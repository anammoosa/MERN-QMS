const express = require('express');
require('dotenv').config();
const app = express();

app.get('/', (req, res) => res.send('Test Server'));

const port = 8001;
app.listen(port, () => {
    console.log(`Test app listening on port ${port}`);
});

setInterval(() => {
    console.log('Heartbeat');
}, 1000);
