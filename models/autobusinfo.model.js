import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;


let autobusSchema = new Schema({
    nombre: { type: String },
    numero: { type: Number },
    capacidadAsientos: { type: Number }
});

let myschema = model('autobusinfo', autobusSchema);
export default myschema;