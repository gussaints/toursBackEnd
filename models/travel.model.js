import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;
import autoPop from 'mongoose-autopopulate';


let newTravelSchema = new Schema({
    dataBus: { type: _Schema.Types.ObjectId, ref: 'autobusinfo', autopopulate: true },
    dataDestino: { type: _Schema.Types.ObjectId, ref: 'destinoinfo', autopopulate: true },
    fechaViaje: { type: Date, required: true },
    horaSalida: { type: Date, required: true },
    usuarioAppCreador: { type: _Schema.Types.ObjectId, ref: 'usuarioapp', autopopulate: true },
    creacionFecha: { type: Date, required: true },
    closed: { type: Boolean },
    seats: [
        { type: _Schema.Types.ObjectId, ref: 'seatinfo', autopopulate: true }
    ]
});

newTravelSchema.plugin(autoPop);
let myschema = model('travel', newTravelSchema);
export default myschema;