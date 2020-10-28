import express from 'express';
import { type } from 'os';

const app = express();
const port = process.env.PORT || 3000;

app.use('/', (req, res) => {
	res.send('Hello World');
});

app.listen(process.env.PORT || 3000, () => console.log(`listening on PORT ${port}`));
