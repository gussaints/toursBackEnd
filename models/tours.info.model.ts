import { Schema as _Schema, model } from 'mongoose';
import slugify from 'slugify';
import SeatsDB from './seats.model';
// import validator from 'validator';
const enumDifficulty = ['easy', 'medium', 'difficult'];

let newToursSchema = new _Schema({
    name:    {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        // validate: [validator.isAlpha, 'Tour name must just contains characters a-z'],
        minlength: [10, 'The tour name must have more or equal than 10 characters'],
        maxlength: [40, 'The tour name must have less or equal than 40 characters']
    },
    slug:    {
        type: String
    },
    duration:    {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize:    {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty:    {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: enumDifficulty,
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage:    {
        type: Number,
        default: 4.5,
        min: [1, 'Ratings must be at least 1.0'],
        max: [5, 'Ratings must be below 5.0'],
        set: (val: number) => Math.round(val * 10) / 10
    },
    ratingsQuantity:    {
        type: Number,
        default: 0
    },
    price:    {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount:    {
        type: Number,
        validate: {
            validator: function ( this: any, val: number) :any {
                //  `this` only points to current doc on 'NEW Document Creation'
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) must be below than regular price'
        }
    },
    summary: {
        type: String,
        trim: true
    },
    description:    {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    imageCover:    {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images:    [String],
    createdAt:    {
        type: Date,
        default: Date.now(),
        select: false
    },
    // day of the travel
    startDates:    [Date],
    secretTour:    {
        type: Boolean,
        default: false
    },
    busModel: { type:_Schema.Types.ObjectId, ref: 'bus'},
    // qtyRows: { type: Number, required: [true, 'Quantity of rows are required! 🔖']},
    // origin
    startLocations: { type: _Schema.Types.ObjectId, ref: 'Location' },
    // destiny
    locations: [
        { type: _Schema.Types.ObjectId, ref: 'Location' }
    ],
    guides: [
        { type: _Schema.Types.ObjectId, ref: 'User' }
    ],
    // hour of the travel
    startHour: {
        type: Date
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Estas 2 propiedades seran index
// para acelerar las busquedas mediante las mismas
newToursSchema.index({ price: 1, ratingsAverage: -1 });
newToursSchema.index({ slug: 1 });

newToursSchema.virtual( 'durationWeeks' ).get( function( this: any ) {
    return this.duration / 7;
});

newToursSchema.virtual( 'availableSeats' ).get( async function( this: any ) {
    const allseats = await SeatsDB.find({_idTour: this._id});
    let totalAvailable = 0;
    await allseats.map( (seat: any) => seat.status == 'available' ? totalAvailable =+ 1 : totalAvailable =+ 0);
    return totalAvailable;
});

newToursSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

newToursSchema.virtual('seats', {
    ref: 'seats',
    foreignField: 'tour',
    localField: '_id'
});

// newToursSchema.virtual('rows').get( async function( this: any ) {
//     const { qtyRows, totalSeats, way2form } = this.busModel;
//     let myRows: any[] = [];
//     let onerow: any = {};
//     // let mySeats = [];
//     let summary = 0;
//     way2form.map( ( row: any ) => {
//         // totalSeats = 57
//         // qtyRows = 16
//         // row = {numAsientos por num fila}
//         summary = 0;
//         this.seats.map( (seat: any) => {
//             // 57 seats
//             summary += 1;
//             onerow = {};
//             onerow.qtySeats = row.totalSeats;
//             onerow.num = row.numRow;
//             onerow.seats = [];
//             const lastNumSeat = row.totalSeats * row.numRow;
//             const firstNumSeat = 1 + (lastNumSeat - row.totalSeats);
//             const errMulti = `${seat.num} no esta entre ${firstNumSeat} y ${lastNumSeat}`;
//             seat.num <= lastNumSeat && seat.num >= firstNumSeat ? onerow.seats.push(seat): console.log(errMulti);
//             summary === totalSeats ? myRows.push( onerow ): console.log(`aun no alcanza ${summary} a ${totalSeats}`);
//         });
//     });

//     return myRows;
//     // rows: [{
//     //     num: { type: Number },
//     //     qtySeats: { type: Number },
//     //     seats: [{
//     //         type: _Schema.Types.ObjectId, ref: 'seats'
//     //     }]
//     // }],
// });
// DOCUMENT MIDDLEWARE: runs before .save() and before .create()
newToursSchema.pre( 'save', function( this: any, next ) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

newToursSchema.post( 'save', async function( doc, next ) {
    await doc.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    }).populate({
        path: 'startLocations',
        select: '-__v'
    }).populate({
        path: 'locations',
        select: '-__v'
    }).execPopulate();
    next();
});
// QUERY MIDDLEWARE
// newToursSchema.pre( 'find', function( this, next ) {
newToursSchema.pre( /^find/, function( this: any, next ) {
    // evita que se muestre los secretTours
    // this.find( { secretTour: { $ne: true } } );
    this.start = Date.now();
    // this.populate({
    //     path: 'guides',
    //     select: '-__v -passwordChangedAt'
    // });
    next();
});

newToursSchema.pre( /^find/, function( this: any, next ) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
});


newToursSchema.post( /^find/, function( this: any, docs, next ) {
    console.log(`Query took ${ Date.now() - this.start } milliseconds`);
    next();
});

// AGGREGATION MIDDLEWARE
// en este middleware no agrego `this` en la `function`
// debido a que `this` inyectado es el Documento de Mongoose
// y en este caso, `this` es la respuesta de `aggregate`
newToursSchema.pre( 'aggregate', function( next ) {
    // 
    // console.log( this );
    // console.log( this.pipeline() );
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

let mySchema = model('Tour', newToursSchema);
export default mySchema;
