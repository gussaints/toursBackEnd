export const SERVER_PORT: number = Number(process.env.PORT || 5000);
console.log(process.env.PORT, Number(process.env.PORT || 5000));

export const DB_USERNAME = 'beating';
export const DB_PASSWORD = 'OsOlodQ8FwGGcMQW';
export const DB_LOCAL = 'mongodb://localhost:27017/nflusatours';
export const DB_REMOTE = 'mongodb+srv://beating:<PASSWORD>@tours0-mgw91.mongodb.net/nflusatours?retryWrites=true&w=majority';
export const JWT_SECRET = '1&leluy@';
// # mongodb+srv://beating:OsOlodQ8FwGGcMQW@tours0-mgw91.mongodb.net/test
// # mongo "mongodb+srv://tours0-mgw91.mongodb.net/test"  --username beating