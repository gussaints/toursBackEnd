import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;
import autoPop from 'mongoose-autopopulate';


let seatinfoSchema = new Schema({
    numeroAsiento: { type: Number },
    nombreOcupante: { type: String },
    apellidoOcupante: { type: String },
    vendedor: { type: _Schema.Types.ObjectId, ref: 'usuarioapp', autopopulate: true },
    vendido: { type: Boolean },
    destino: { type: String },
    fechaViaje: { type: Date },
    numBus: { type: String },
    horaSalida: { type: Date },
    emailComprador: { type: String },
    telefonoComprador: { type: String },
    nombreComprador: { type: String },
    apellidoComprador: { type: String },
    usuario: { type: _Schema.Types.ObjectId, ref: 'usuarioapp', autopopulate: true },
    fechaCompra: { type: Date }
});

seatinfoSchema.plugin(autoPop);
let myschema = model('seatinfo', seatinfoSchema);
export default myschema;