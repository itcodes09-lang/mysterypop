const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });
global.dbConnected = false;

const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');
const db = require('./models');

const PORT = process.env.PORT || 3000;

async function ensureColumnsExist() {
  const queryInterface = sequelize.getQueryInterface();
  const models = sequelize.models;

  for (const modelName of Object.keys(models)) {
    const model = models[modelName];
    const tableName = model.tableName || model.getTableName();
    
    try {
      const columns = await queryInterface.describeTable(tableName);
      const attributes = model.rawAttributes || model.getAttributes();
      
      for (const [colName, colDef] of Object.entries(attributes)) {
        const fieldName = colDef.field || colName;
        if (!columns[fieldName] && !columns[fieldName.toLowerCase()]) {
          console.log(`Column "${fieldName}" is missing in table "${tableName}". Adding it...`);
          try {
            await queryInterface.addColumn(tableName, fieldName, colDef);
            console.log(`Column "${fieldName}" successfully added to table "${tableName}".`);
          } catch (colErr) {
            console.warn(`Could not add column "${fieldName}" to table "${tableName}":`, colErr.message);
          }
        }
      }
    } catch (err) {
      // Table might not exist yet, which is fine to skip
    }
  }
}

async function start() {
  try {
    await sequelize.authenticate();
    global.dbConnected = true;
    if (process.env.SKIP_DB_SYNC === 'true') {
      console.log('Database connected. Skipping sequelize.sync because SKIP_DB_SYNC=true');
      await ensureColumnsExist();
    } else {
      await sequelize.sync({ alter: true });
      console.log('Database connected and tables synced.');
    }
  } catch (error) {
    global.dbConnected = false;
    console.warn('Database connection failed. Starting server without DB sync:', error.message);
  }

  // Load the app after global.dbConnected has been set
  const app = require('./app');

  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const existingAdmin = await db.User.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await db.User.create({ name: 'Admin', email: adminEmail, password: hashedPassword, role: 'admin', is_active: true });
      console.log(`Created default admin user: ${adminEmail}`);
    }

    // Seed default sample items if none exist
    const existingItemsCount = await db.Item.count();
    if (existingItemsCount === 0) {
      const sampleItems = [
        {
          name: 'Ultimate Anime Mystery Box',
          description: 'A curated selection of premium anime figures, keychains, and apparel from hot series like Naruto, Demon Slayer, and Jujutsu Kaisen. Guaranteed 1 authentic scale figure!',
          price: 49.99,
          stock: 25,
          image: null,
          images: []
        },
        {
          name: 'Classic Retro Gaming Pop',
          description: 'Step back in time with vintage gaming collectibles, custom stickers, retro accessories, and classic cartridge goodies. Perfect for 80s and 90s console fans!',
          price: 39.99,
          stock: 15,
          image: null,
          images: []
        },
        {
          name: 'Cosmic Sci-Fi Collector Box',
          description: 'Unbox cosmic wonders from outer space, featuring alien collectibles, starship models, LED trinkets, and exclusive sci-fi comic editions.',
          price: 59.99,
          stock: 10,
          image: null,
          images: []
        },
        {
          name: 'Kawaii Pastels Sweet Box',
          description: 'Super cute stationery, plushies, keychains, and pastel sweet treats from Tokyo. Guaranteed to make your desk 100% more adorable.',
          price: 29.99,
          stock: 30,
          image: null,
          images: []
        }
      ];
      await db.Item.bulkCreate(sampleItems);
      console.log('Seeded default sample mystery boxes.');
    }

    // Seed default sample customers if none exist
    const existingCustomersCount = await db.Customer.count();
    if (existingCustomersCount === 0) {
      await db.Customer.create({
        fname: 'John',
        lname: 'Doe',
        address: '123 Vault Street, Metropolis',
        zipcode: '00000',
        phone: '(555) 123-4567'
      });
      console.log('Seeded default sample customer.');
    }

    // Seed default sample orders if none exist
    const existingOrdersCount = await db.Order.count();
    if (existingOrdersCount === 0) {
      const items = await db.Item.findAll();
      if (items && items.length > 0) {
        const order = await db.Order.create({
          user_id: 1, // Default Admin user
          customer_name: 'John Doe',
          email: 'user@example.com',
          total_amount: Number(items[0].price) * 2,
          status: 'pending',
          payment_status: 'pending',
          shipping_address: '123 Vault Street, Metropolis, 00000, Country',
          notes: 'Contact: (555) 123-4567 | Payment: Credit Card | Note: Handle with care.'
        });

        await db.OrderItem.create({
          order_id: order.id,
          item_id: items[0].id,
          item_name: items[0].name,
          quantity: 2,
          price: items[0].price
        });
        console.log('Seeded default sample order.');
      }
    }
  } catch (seedError) {
    console.warn('Seeding failed:', seedError.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
