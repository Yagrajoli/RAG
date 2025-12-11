import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import indexingDocumentRoutes from './routes/indexing.routes.js';
import chatRoutes from "./routes/chat.routes.js"

const app = express()
const port = process.env.PORT || 5000

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));


// cors configuration
app.use(cors({
  origin: process.env.FRONTEND_URL ,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use('/api/documents', indexingDocumentRoutes);
app.use('/api/chat', chatRoutes);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(` app is listening on port ${port}`)
})
