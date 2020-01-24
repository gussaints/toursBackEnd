import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;


let destinoSchema = new Schema({
    namecity: { type: String, unique: true },
    namestate: { type: String },
    namecountry: { type: String }
});

let myschema = model('destinoinfo', destinoSchema);
export default myschema;