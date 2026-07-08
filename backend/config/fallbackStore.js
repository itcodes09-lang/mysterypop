const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');

const dbFilePath = path.resolve(__dirname, 'database.json');

const defaultUsers = [
  {
    id: 1,
    name: 'Admin',
    username: 'admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    is_active: true
  },
  {
    id: 2,
    name: 'John Doe',
    username: 'johndoe',
    email: 'user@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'user',
    is_active: true
  }
];

const defaultItems = [
  {
    id: 1,
    name: 'Ultimate Anime Mystery Box',
    description: 'A curated selection of premium anime figures, keychains, and apparel from hot series like Naruto, Demon Slayer, and Jujutsu Kaisen. Guaranteed 1 authentic scale figure!',
    price: 49.99,
    stock: 25,
    rarity: 'rare',
    brand: 'Mystery Pop',
    theme: 'Anime',
    image: null,
    images: []
  },
  {
    id: 2,
    name: 'Classic Retro Gaming Pop',
    description: 'Step back in time with vintage gaming collectibles, custom stickers, retro accessories, and classic cartridge goodies. Perfect for 80s and 90s console fans!',
    price: 39.99,
    stock: 15,
    rarity: 'common',
    brand: 'Mystery Pop',
    theme: 'Gaming',
    image: null,
    images: []
  },
  {
    id: 3,
    name: 'Cosmic Sci-Fi Collector Box',
    description: 'Unbox cosmic wonders from outer space, featuring alien collectibles, starship models, LED trinkets, and exclusive sci-fi comic editions.',
    price: 59.99,
    stock: 10,
    rarity: 'legendary',
    brand: 'Mystery Pop',
    theme: 'Sci-Fi',
    image: null,
    images: []
  },
  {
    id: 4,
    name: 'Kawaii Pastels Sweet Box',
    description: 'Super cute stationery, plushies, keychains, and pastel sweet treats from Tokyo. Guaranteed to make your desk 100% more adorable.',
    price: 29.99,
    stock: 30,
    rarity: 'common',
    brand: 'Mystery Pop',
    theme: 'Kawaii',
    image: null,
    images: []
  }
];

const defaultCustomers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'user@example.com',
    phone: '123-456-7890',
    address: '123 Main St, Springfield'
  }
];

class MockModel {
  constructor(entityName, defaultData = []) {
    this.entityName = entityName;
    this.defaultData = defaultData;
  }

  getData() {
    if (!fs.existsSync(dbFilePath)) {
      this.saveAll({});
    }
    try {
      const content = fs.readFileSync(dbFilePath, 'utf8');
      const allData = JSON.parse(content || '{}');
      if (!allData[this.entityName]) {
        allData[this.entityName] = this.defaultData;
        this.saveAll(allData);
      }
      return allData[this.entityName];
    } catch (e) {
      console.error('Error reading fallback store:', e);
      return this.defaultData;
    }
  }

  saveData(dataList) {
    let allData = {};
    if (fs.existsSync(dbFilePath)) {
      try {
        allData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8') || '{}');
      } catch (e) {
        allData = {};
      }
    }
    allData[this.entityName] = dataList;
    this.saveAll(allData);
  }

  saveAll(allData) {
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(allData, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing fallback store:', e);
    }
  }

  async count() {
    return this.getData().length;
  }

  async findAll(options = {}) {
    let list = this.getData();

    const paranoid = options.paranoid !== false;
    if (paranoid) {
      list = list.filter(item => !item.deleted_at && !item.deletedAt);
    }

    if (options.where) {
      list = list.filter(item => {
        const keys = Reflect.ownKeys(options.where);
        for (const key of keys) {
          const val = options.where[key];
          
          if (typeof key === 'symbol' && (key.toString().includes('or') || key.description === 'or')) {
            if (Array.isArray(val)) {
              const matchedAny = val.some(cond => {
                return Object.keys(cond).every(condKey => {
                  return String(item[condKey] || '').toLowerCase() === String(cond[condKey] || '').toLowerCase();
                });
              });
              if (!matchedAny) return false;
            }
          } else {
            if (val !== undefined && val !== null) {
              if (String(item[key] || '').toLowerCase() !== String(val || '').toLowerCase()) {
                return false;
              }
            }
          }
        }
        return true;
      });
    }

    if (options.order) {
      try {
        const orderField = options.order[0][0];
        const orderDir = options.order[0][1] || 'ASC';
        list.sort((a, b) => {
          const valA = a[orderField] || '';
          const valB = b[orderField] || '';
          if (orderDir.toUpperCase() === 'DESC') {
            return valA < valB ? 1 : valA > valB ? -1 : 0;
          } else {
            return valA > valB ? 1 : valA < valB ? -1 : 0;
          }
        });
      } catch (err) {
        // Safe fallback if order sorting fails
      }
    }

    return list.map(item => this.wrapInstance(item));
  }

  async findAndCountAll(options = {}) {
    const list = await this.findAll(options);
    const limit = options.limit || list.length;
    const offset = options.offset || 0;
    const paginated = list.slice(offset, offset + limit);
    return {
      rows: paginated,
      count: list.length
    };
  }

  async findByPk(id) {
    const list = this.getData();
    const found = list.find(item => String(item.id) === String(id));
    return found ? this.wrapInstance(found) : null;
  }

  async findOne(options = {}) {
    const list = await this.findAll(options);
    return list.length > 0 ? list[0] : null;
  }

  async create(data) {
    const list = this.getData();
    const newId = list.reduce((max, item) => Math.max(max, Number(item.id || 0)), 0) + 1;
    const record = {
      id: newId,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(record);
    this.saveData(list);
    return this.wrapInstance(record);
  }

  async bulkCreate(records) {
    const list = this.getData();
    let currentId = list.reduce((max, item) => Math.max(max, Number(item.id || 0)), 0);
    const created = [];
    for (const record of records) {
      currentId++;
      const item = {
        id: currentId,
        ...record,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.push(item);
      created.push(item);
    }
    this.saveData(list);
    return created.map(item => this.wrapInstance(item));
  }

  wrapInstance(record) {
    if (!record) return null;
    const self = this;
    return {
      ...record,
      async save() {
        const list = self.getData();
        const index = list.findIndex(item => String(item.id) === String(record.id));
        if (index !== -1) {
          list[index] = { ...list[index], ...this, updated_at: new Date().toISOString(), updatedAt: new Date().toISOString() };
          self.saveData(list);
        }
        return this;
      },
      async update(data) {
        const list = self.getData();
        const index = list.findIndex(item => String(item.id) === String(record.id));
        if (index !== -1) {
          const updated = { ...list[index], ...data, updated_at: new Date().toISOString(), updatedAt: new Date().toISOString() };
          list[index] = updated;
          self.saveData(list);
          Object.assign(this, updated);
        }
        return this;
      },
      async destroy(options = {}) {
        const list = self.getData();
        const index = list.findIndex(item => String(item.id) === String(record.id));
        if (index !== -1) {
          if (options.force === true) {
            list.splice(index, 1);
          } else {
            list[index].deleted_at = new Date().toISOString();
            list[index].deletedAt = new Date().toISOString();
          }
          self.saveData(list);
        }
        return true;
      },
      async restore() {
        const list = self.getData();
        const index = list.findIndex(item => String(item.id) === String(record.id));
        if (index !== -1) {
          delete list[index].deleted_at;
          delete list[index].deletedAt;
          self.saveData(list);
        }
        return true;
      },
      toJSON() {
        const copy = { ...this };
        delete copy.save;
        delete copy.update;
        delete copy.destroy;
        delete copy.toJSON;
        return copy;
      }
    };
  }
}

module.exports = {
  Item: new MockModel('Item', defaultItems),
  User: new MockModel('User', defaultUsers),
  Customer: new MockModel('Customer', defaultCustomers),
  Review: new MockModel('Review', []),
  Order: new MockModel('Order', []),
  OrderItem: new MockModel('OrderItem', []),
  BoxSerial: new MockModel('BoxSerial', [])
};
