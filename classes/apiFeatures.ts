export default class APIFeatures {
    query: any;
    queryString: any;

    constructor( query: any, queryString: any ) {
        // ToursDB.find()
        this.query = query;
        // req.query
        this.queryString = queryString;
    }

    public filter = () => {
        // BUILD QUERY
        // 1a) Filtering
            // destructuring
        let queryObj = { ...this.queryString };
        const excludeFields = [ 'page', 'sort', 'limit', 'fields' ];
        excludeFields.forEach(ele => delete queryObj[ele]);
        console.log( 'respuesta ⚽️', queryObj, this.queryString );
        // 1b) Advanced filtering => adding $ sign
        let queryStr = JSON.stringify( queryObj );
        queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, match => `$${match}`);
        queryObj = JSON.parse( queryStr );
        this.query = this.query.find(queryObj);
        return this;
    }

    public sort = () => {
        // 2) Sort
        if ( this.queryString.sort ) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort( sortBy );
        } else {
            this.query = this.query.sort( '-createdAt' );
        }
        return this;
    }

    public limitFields = () => {
        // 3) Fields
        if ( this.queryString.fields ) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select( fields );
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }
    
    public paginate = () => {
        // 4) Pagination => page & limit
        // page=2&limit=10 => page1 1-10, page2 11-20, page3 21-30
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}