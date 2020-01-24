import { Schema as _Schema, model } from 'mongoose';

let newLocations = new _Schema({
    // GeoJSON
    type: {
        type: String,
        default: 'Point',
        enum: {
            values: ['Point']
        }
    },
    coordinates: [Number],
    address: String,
    description: String,
    day: Number
});

newLocations.index({coordinates: '2dsphere'});

let mySchema = model( 'Location', newLocations );
export default mySchema;