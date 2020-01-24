import { Schema as _Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new _Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: [true, 'This email is already in use'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: [ 'client', 'guide', 'lead-guide', 'admin', 'developer' ],
        default: 'client'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm a password'],
        validate: {
            // this just works on SAVE or CREATE !
            validator: function (this: any, el: any){
                return el === this.password;
            },
            message: 'Passwords are not the same'
        }
    },
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetTokenExpiry: { type: Date },
    active: { type: Boolean, default: true, select: false }
});

userSchema.pre('save', async function(this: any, next) {
    // just run if password was modified
    if ( !this.isModified('password') ) return next();
    // hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    // delete password confirm
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function(this: any, next){
    // just run if password was modified
    if ( !this.isModified('password') || this.isNew ) return next();
    this.passwordChangedAt = Date.now() - 3000;
    console.log( 'this.passwordChangedAt', this.passwordChangedAt );
    
    next();
});
// SE MANEJA DESDE POSTMAN
// userSchema.pre( /^find/, function( this: any, next ){
//     this.find({ active: { $ne: false } });
//     next();
// });

userSchema.post('save', function( doc: any, next ) {
    doc.password = '🏎';
    next();
});

userSchema.methods.correctPassword = async function(
    candidatePass: string,
    userPass: string
) {
    return await bcrypt.compare(candidatePass, userPass);
}

userSchema.methods.changedPasswordAfter = async function(_JWTTimestamp: any){
    if (this.passwordChangedAt) {
        const changesTimestamp = Number(this.passwordChangedAt.getTime() / 1000);
        const answer = _JWTTimestamp < changesTimestamp;
        console.log( _JWTTimestamp, ' < ', changesTimestamp, 'checking', answer );
        return answer;
    }
    // false means NOT CHANGES
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
     const resetToken = crypto.randomBytes(32).toString('hex');

     this.passwordResetToken = crypto
     .createHash('sha256')
     .update(resetToken)
     .digest('hex');
     
     this.passwordResetTokenExpiry = Date.now() + ( 1000 * 60 * 10 );
     
     return resetToken;
     //  console.log( { resetToken }, this.passwordResetToken );
}

let mySchema = model('User', userSchema);
export default mySchema;