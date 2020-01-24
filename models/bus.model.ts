import { Schema as _Schema, model } from 'mongoose';

let newBusSchema = new _Schema({
    name: { type: String, required: [true, 'The name of the bus is required!👀'] },
    num: { type: Number,  required: [true, 'The number of the bus is required!👀'] },
    qtyRows: { type: Number, required: [true, 'The quantity of rows is required!👀'] },
    totalSeats: { type: Number, required: [true, 'The total of seats is required!👀'] },
    way2form: [
        {
            // asientos totales por fila
            totalSeats: { type: Number, default: 1 },
            // cuantas filas habra con la cantidad de asientos de arriba
            // totalRows:
            // { type: Number, default: 0 },
            // numero de fila
            numRow: { type: Number, default: 1 }
        }
    ]
});

const mySchema = model('bus', newBusSchema);
export default mySchema;

