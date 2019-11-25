const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoPop = require('mongoose-autopopulate');

let usuarioAppSchema = new Schema({
    name: { type: String },
    lastname: { type: String },
    email: { type: String, unique: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'roles', autopopulate: true },
    fechaAlta: { type: Date },
    telefono: { type: String },
    sexo: { type: String },
    namecity: { type: String },
    namestate: { type: String },
    namecountry: { type: String }
});

usuarioAppSchema.plugin(autoPop);
let myschema = mongoose.model('usuarioapp', usuarioAppSchema);
module.exports = myschema;