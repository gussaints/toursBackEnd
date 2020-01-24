import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env'});
// import ToursDB from '../models/tours.info.model';
// import UsersDB from '../models/users.info.model';
// import ReviewsDB from '../models/reviews.info.model';
import LocationsDB from '../models/locations.info.model';

import { DB_REMOTE, DB_PASSWORD } from '../global/environment';

const DB = DB_REMOTE.replace(
    '<PASSWORD>',
    DB_PASSWORD
);
console.log( DB );

mongoose
.connect( DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then( ( con: any ) => {
    console.log(`Connected to the database successfully`);
});

// tours file to DB
// const tours = JSON.parse(fs.readFileSync(path.join(`${__dirname}`,`../data/tours.json`), 'utf-8'));
// const users = JSON.parse(fs.readFileSync(path.join(`${__dirname}`,`../data/users.json`), 'utf-8'));
// const reviews = JSON.parse(fs.readFileSync(path.join(`${__dirname}`,`../data/reviews.json`), 'utf-8'));
const locations = JSON.parse(fs.readFileSync(path.join(`${__dirname}`,`../data/locations.json`), 'utf-8'));

// import data to DB
const importData = async () => {
    try {
        // await ToursDB.create(tours);
        // await UsersDB.create(users, { validateBeforeSave: false });
        // await ReviewsDB.create(reviews);
        await LocationsDB.create(locations);
        console.log( 'succesfully created 🛩' );
    } catch (err0) {
        console.log( 'error', err0 );
    }
    process.exit(0);
}

const deleteData = async () => {
    try {
        // await ToursDB.deleteMany({});
        // await ReviewsDB.deleteMany({});
        // await UsersDB.deleteMany({});
        await LocationsDB.deleteMany({});
        console.log( 'succesfully erased 🛩' );
    } catch (err0) {
        console.log( 'error', err0 );
    }
    process.exit(0);
}

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete'){
    deleteData();
}