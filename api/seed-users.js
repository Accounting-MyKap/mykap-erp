// Script para crear dos usuarios de prueba en la base de datos
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mykap-erp';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'Processor' }
});
const User = mongoose.model('User', userSchema);

async function createUsers() {
  await mongoose.connect(MONGO_URI);
  const users = [
    {
      firstName: 'Sebastian',
      lastName: 'Gomez',
      email: 'sebastian@mykap.com',
      password: await bcrypt.hash('test1234', 12),
      role: 'Processor'
    },
    {
      firstName: 'Gabriela',
      lastName: 'Lopez',
      email: 'gabriela@mykap.com',
      password: await bcrypt.hash('test1234', 12),
      role: 'Processor'
    }
  ];
  for (const user of users) {
    await User.updateOne({ email: user.email }, user, { upsert: true });
  }
  console.log('Test users created/updated');
  await mongoose.disconnect();
}

createUsers();
