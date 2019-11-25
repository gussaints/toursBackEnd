const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let autobusSchema = new Schema({
    nombre: { type: String },
    numero: { type: Number },
    capacidadAsientos: { type: Number }
});

let myschema = mongoose.model('autobusinfo', autobusSchema);
module.exports = myschema;