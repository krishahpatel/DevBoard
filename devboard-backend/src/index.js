const express = require('express');
const cors = require('cors');
require('dotenv').config();

const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const projectsRouter = require('./routes/projects');
const membersRouter = require('./routes/members');    
const issuesRouter = require('./routes/issues');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'https://devboard-frontend-theta.vercel.app'],
}));
app.use(express.json());

app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/projects/:id/members', membersRouter);    
app.use('/api/projects/:id/issues',issuesRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});