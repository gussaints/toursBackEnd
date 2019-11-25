const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let destinoSchema = new Schema({
    namecity: { type: String, unique: true },
    namestate: { type: String },
    namecountry: { type: String }
});

let myschema = mongoose.model('destinoinfo', destinoSchema);
module.exports = myschema;