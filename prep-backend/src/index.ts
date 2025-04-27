import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('PrepPulse Backend is running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
