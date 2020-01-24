import { Schema as _Schema, model} from 'mongoose';

const newBookSchema = new _Schema({
    tour: {
        type: _Schema.Types.ObjectId,
        ref: 'Tour',
        require: [true, 'Booking must belong to a tour 🍁']
    },
    user: {
        type: _Schema.Types.ObjectId,
        ref: 'User',
        require: [true, 'Booking must belong to a user 🍂']
    },
    price: {
        type: Number,
        require: [true, 'Booking must have a price 🍅']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

newBookSchema.pre(/^find/, function (this: any, next: any) {

    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });

    next();
});

const myModel = model( 'booking', newBookSchema );
export default myModel;
