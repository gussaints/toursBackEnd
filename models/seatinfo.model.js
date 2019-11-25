const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoPop = require('mongoose-autopopulate');

let seatinfoSchema = new Schema({
    numeroAsiento: { type: Number },
    nombreOcupante: { type: String },
    apellidoOcupante: { type: String },
    vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarioapp', autopopulate: true },
    vendido: { type: Boolean },
    destino: { type: String },
    fechaViaje: { type: Date },
    numBus: { type: String },
    horaSalida: { type: Date },
    emailComprador: { type: String },
    telefonoComprador: { type: String },
    nombreComprador: { type: String },
    apellidoComprador: { type: String },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarioapp', autopopulate: true },
    fechaCompra: { type: Date }
});

seatinfoSchema.plugin(autoPop);
let myschema = mongoose.model('seatinfo', seatinfoSchema);
module.exports = myschema;