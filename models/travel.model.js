const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoPop = require('mongoose-autopopulate');

let newTravelSchema = new Schema({
    dataBus: { type: mongoose.Schema.Types.ObjectId, ref: 'autobusinfo', autopopulate: true },
    dataDestino: { type: mongoose.Schema.Types.ObjectId, ref: 'destinoinfo', autopopulate: true },
    fechaViaje: { type: Date, required: true },
    horaSalida: { type: Date, required: true },
    usuarioAppCreador: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarioapp', autopopulate: true },
    creacionFecha: { type: Date, required: true },
    closed: { type: Boolean },
    seats: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'seatinfo', autopopulate: true }
    ]
});

newTravelSchema.plugin(autoPop);
let myschema = mongoose.model('travel', newTravelSchema);
module.exports = myschema;