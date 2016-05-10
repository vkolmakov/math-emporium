import express from 'express';

const app = express();
const port = 8000;

app.get('*', (req, res) => res.status(400).json('Hello world!'));

app.listen(port, () => console.log(`Running on port ${port}`));
