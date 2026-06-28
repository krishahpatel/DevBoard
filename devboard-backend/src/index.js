const express = require('express');
const cors = require('cors');
require('dotenv').config();

const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');       

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/api/auth', authRouter);                

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});