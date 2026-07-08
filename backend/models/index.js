const { sequelize } = require('../config/database');
const path = require('node:path');
const fallbackStore = require('../config/fallbackStore');

const db = {};
db.sequelize = sequelize;

const ItemModel = require(path.join(__dirname, 'item.js'))(sequelize, require('sequelize').DataTypes);
const CustomerModel = require(path.join(__dirname, 'customer.js'))(sequelize, require('sequelize').DataTypes);
const UserModel = require(path.join(__dirname, 'user.js'))(sequelize, require('sequelize').DataTypes);
const OrderModel = require(path.join(__dirname, 'order.js'))(sequelize, require('sequelize').DataTypes);
const OrderItemModel = require(path.join(__dirname, 'orderItem.js'))(sequelize, require('sequelize').DataTypes);
const ReviewModel = require(path.join(__dirname, 'review.js'))(sequelize, require('sequelize').DataTypes);
const BoxSerialModel = require(path.join(__dirname, 'boxSerial.js'))(sequelize, require('sequelize').DataTypes);

if (OrderModel && OrderItemModel) {
  OrderModel.hasMany(OrderItemModel, { foreignKey: 'order_id', as: 'items' });
  OrderItemModel.belongsTo(OrderModel, { foreignKey: 'order_id', as: 'order' });
}

if (ItemModel && OrderItemModel) {
  OrderItemModel.belongsTo(ItemModel, { foreignKey: 'item_id', as: 'item' });
}

Object.defineProperty(db, 'Item', {
  get: () => global.dbConnected ? ItemModel : fallbackStore.Item
});
Object.defineProperty(db, 'Customer', {
  get: () => global.dbConnected ? CustomerModel : fallbackStore.Customer
});
Object.defineProperty(db, 'User', {
  get: () => global.dbConnected ? UserModel : fallbackStore.User
});
Object.defineProperty(db, 'Order', {
  get: () => global.dbConnected ? OrderModel : fallbackStore.Order
});
Object.defineProperty(db, 'OrderItem', {
  get: () => global.dbConnected ? OrderItemModel : fallbackStore.OrderItem
});
Object.defineProperty(db, 'Review', {
  get: () => global.dbConnected ? ReviewModel : fallbackStore.Review
});
Object.defineProperty(db, 'BoxSerial', {
  get: () => global.dbConnected ? BoxSerialModel : fallbackStore.BoxSerial
});

module.exports = db;
