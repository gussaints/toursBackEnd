import { Schema as _Schema, model } from 'mongoose';

const newSeatsSchema = new _Schema({
    num: { type: Number, required: [true, 'The number of seat is required! ✏️']},
    nameUser: { type: String, default: null },
    status: { type: String, default: 'available' },
    soldAt: { type: Date, default: null },
    buyer: { type: _Schema.Types.ObjectId, ref: 'user', default: null },
    tour: { type: _Schema.Types.ObjectId, ref: 'tour'}
});

const mySchema = model('seats', newSeatsSchema);
export default mySchema;