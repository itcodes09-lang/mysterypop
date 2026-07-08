require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('../models');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  try {
    await db.sequelize.authenticate();
    const User = db.User;

    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const name = process.env.ADMIN_NAME || 'Admin';

    const hashed = await bcrypt.hash(password, 10);

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: { name, email, password: hashed, role: 'admin', is_active: true }
    });

    if (!created) {
      // ensure admin properties are set
      user.name = name;
      user.password = hashed;
      user.role = 'admin';
      user.is_active = true;
      await user.save();
    }

    console.log(`Admin user ${email} ready (created=${created})`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin:', err);
    process.exit(1);
  }
}

seedAdmin();
