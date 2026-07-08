module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define('Item', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rarity: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'common'
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Mystery Pop'
    },
    theme: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'General'
    },
    character_percentages: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('character_percentages');
        if (!raw) return {};
        try {
          return JSON.parse(raw);
        } catch (e) {
          return {};
        }
      },
      set(value) {
        this.setDataValue('character_percentages', JSON.stringify(value || {}));
      }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('images');
        if (!raw) return [];
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          if (typeof raw === 'string' && raw.trim() !== '') {
            return [raw.trim()];
          }
          return [];
        }
      },
      set(value) {
        this.setDataValue('images', JSON.stringify(value || []));
      }
    }
  }, {
    tableName: 'items',
    timestamps: true,
    paranoid: true,
    underscored: true
  });

  return Item;
};
