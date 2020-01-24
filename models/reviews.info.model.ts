import { Schema as _Schema, model } from 'mongoose';
import ToursDB from './tours.info.model';
// Parent reference
let newReview = new _Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!']
    },
    ratting: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: _Schema.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour!']
    },
    user: {
        type: _Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user!']
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

newReview.index({ tour: 1, user: 1 }, { unique: true });

newReview.post( 'save', async function( doc, next ) {
    await doc.populate({
        path: 'user',
        select: 'name photo'
    }).populate({
        path: 'tour',
        select: 'name'
    }).execPopulate();
    next();
});

newReview.pre(/^find/, function( this: any, next: any) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

newReview.statics.calcAverageRatings = async function(this: any,Tour: any){
    const stats = await this.aggregate([
        {
            $match: { tour: Tour._id }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$ratting' }
            }
        }
    ]);
    if ( stats.length > 0 ) {
        console.log( '🎠 datos de stats 🎠', stats );
        
        await ToursDB.findByIdAndUpdate(stats[0]._id, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        console.log( '🚁 ya no tiene reviews este tour 🚁' );
        
        await ToursDB.findByIdAndUpdate(Tour._id, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }

    
};

newReview.post('save', function (this: any){
    this.constructor.calcAverageRatings(this.tour);
});

newReview.pre(/^findOneAnd/, async function (this: any, next: any){
    this.r = await this.findOne();
    this.preconst = this.constructor;
    // console.log( 'this.r', this );
    next();
});

newReview.post(/^findOneAnd/, async function (this: any){
    // console.log( this );
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

let mySchema = model('Review', newReview);
export default mySchema;