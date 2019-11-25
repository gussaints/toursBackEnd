const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const port = parseInt(process.argv[2] || 4321);

app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});