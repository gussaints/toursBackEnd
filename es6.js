import express from "express";
const app = express();
const port = parseInt(process.argv[2] || 4321);

app.listen(port, () => {
    console.log(`server running at port ${port}`);
});