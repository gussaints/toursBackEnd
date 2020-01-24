import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;
import autoPop from 'mongoose-autopopulate';


let usuarioAppSchema = new Schema({
    name: { type: String },
    lastname: { type: String },
    email: { type: String, unique: true },
    role: { type: _Schema.Types.ObjectId, ref: 'roles', autopopulate: true },
    fechaAlta: { type: Date },
    telefono: { type: String },
    sexo: { type: String },
    namecity: { type: String },
    namestate: { type: String },
    namecountry: { type: String }
});

usuarioAppSchema.plugin(autoPop);
let myschema = model('usuarioapp', usuarioAppSchema);
export default myschema;