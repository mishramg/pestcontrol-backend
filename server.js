const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Assignment = require('./models/Assignment');

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION & SEEDING ---
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Check if an Admin exists
    const adminExists = await User.findOne({ role: 'ADMIN' });
    
    // If no Admin exists, create the default one automatically
    if (!adminExists) {
      const defaultAdmin = new User({
        name: 'Gaurav (Master)',
        username: 'admin',
        password: 'admin123',
        phone: '0000000000',
        role: 'ADMIN'
      });
      await defaultAdmin.save();
      console.log('👑 Default Admin created! Username: admin | Password: admin123');
    }
  })
  .catch((err) => console.error('❌ MongoDB Error:', err));

// LOGIN ROUTE
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error during login" });
  }
});

// STAFF/TECHNICIAN ROUTES
app.get('/api/technicians', async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['TECHNICIAN', 'SUB-ADMIN'] } });
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/technicians', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Username already exists" });
    res.status(500).json({ error: err.message });
  }
});

// ASSIGNMENT ROUTES
app.get('/api/assignments', async (req, res) => {
  const assignments = await Assignment.find().sort({ createdAt: -1 });
  res.json(assignments);
});

app.get('/api/assignments/tech/:techName', async (req, res) => {
  const jobs = await Assignment.find({ technicianName: req.params.techName });
  res.json(jobs);
});

app.post('/api/assignments', async (req, res) => {
  const newJob = new Assignment(req.body);
  await newJob.save();
  res.status(201).json(newJob);
});

app.put('/api/assignments/:id', async (req, res) => {
  const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/api/assignments/:id', async (req, res) => {
  await Assignment.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));

// DELETE a staff member
app.delete('/api/technicians/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// UPDATE a staff member
app.put('/api/technicians/:id', async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedUser);
});