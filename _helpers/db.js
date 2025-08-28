// Use environment variables for production, fallback to config.json for development
const JWT_CONFIG = require('../jwt-config');
const config = {
    database: {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "1234",
        database: process.env.DB_NAME || "amp"
    },
    secret: JWT_CONFIG.SECRET,
    emailFrom: process.env.EMAIL_FROM || "info@node-mysql-signup-verification-api.com",
    smtpOptions: {
        host: process.env.SMTP_HOST || "smtp.ethereal.email",
        port: process.env.SMTP_PORT || 587,
        auth: {
            user: process.env.SMTP_USER || "annie.parker0@ethereal.email",
            pass: process.env.SMTP_PASS || "fnyCSJGPbHW1hHaPGQ"
        }
    }
};

const mysql = require('mysql2/promise');
const { Sequelize, DataTypes } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // Use environment variables for production, fallback to config.json for development
    const dbConfig = {
        host: process.env.DB_HOST || config.database.host,
        port: process.env.DB_PORT || config.database.port,
        user: process.env.DB_USER || config.database.user,
        password: process.env.DB_PASSWORD || config.database.password,
        database: process.env.DB_NAME || config.database.database
    };

    // For Render deployment with your MySQL database
    if (process.env.NODE_ENV === 'production') {
        dbConfig.host = process.env.DB_HOST || '153.92.15.31';
        dbConfig.user = process.env.DB_USER || 'u875409848_vilar';
        dbConfig.password = process.env.DB_PASSWORD || '6xw;kmmXC$';
        dbConfig.database = process.env.DB_NAME || 'u875409848_vilar';
        dbConfig.port = process.env.DB_PORT || 3306;
    }

    console.log('Database configuration:', {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database
    });

    // create db if it doesn't already exist
    const connection = await mysql.createConnection({ 
        host: dbConfig.host, 
        port: dbConfig.port, 
        user: dbConfig.user, 
        password: dbConfig.password 
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);

    // connect to db
    const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, { 
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: 'mysql',
        logging: false, // Turn off Sequelize logging
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            // Add SSL configuration for production MySQL
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    });

    // Test database connection
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        console.error('Database config:', {
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            database: dbConfig.database
        });
        
        // In production, retry connection after delay
        if (process.env.NODE_ENV === 'production') {
            console.log('🔄 Retrying database connection in 5 seconds...');
            setTimeout(() => {
                console.log('Retrying connection...');
                initialize();
            }, 5000);
            return;
        }
        
        throw error;
    }

    // 🎓✨
    console.log('\n🎓✨ Together we\'ll graduate as a team. Lets do this! ✨🎓\n');

    // init models and add them to the exported db object
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
    db.Employee = require('../employees/employee.model')(sequelize, DataTypes);
    db.Department = require('../departments/department.model')(sequelize, DataTypes);
    db.Workflow = require('../workflows/workflow.model')(sequelize, DataTypes);
    db.Request = require('../requests/request.model')(sequelize, DataTypes);

    // New Models
    db.Brand = require('../brand/brand.model')(sequelize, DataTypes);
    db.Category = require('../category/category.model')(sequelize, DataTypes);
    db.Item = require('../items/item.model')(sequelize, DataTypes);
    db.Stock = require('../stock/stock.model')(sequelize, DataTypes);
    db.StorageLocation = require('../storage-location/storage-location.model')(sequelize, DataTypes);
    db.RoomLocation = require('../pc/room-location.model')(sequelize, DataTypes);
    db.PC = require('../pc/pc.model')(sequelize, DataTypes);
    db.PCComponent = require('../pc/pc-component.model')(sequelize, DataTypes);
    db.SpecificationField = require('../specifications/specification.model')(sequelize, DataTypes);
    db.Dispose = require('../dispose/dispose.model')(sequelize, DataTypes);
    db.ActivityLog = require('../activity-log/activity-log.model')(sequelize, DataTypes);

    // ---------------- RELATIONSHIPS ----------------
    // Storage Location -> Stock
    db.StorageLocation.hasMany(db.Stock, { foreignKey: 'locationId', as: 'stocks' });
    db.Stock.belongsTo(db.StorageLocation, { foreignKey: 'locationId', as: 'location' });




    // Brand -> Item
    db.Brand.hasMany(db.Item, { foreignKey: 'brandId', as: 'items' });
    db.Item.belongsTo(db.Brand, { foreignKey: 'brandId', as: 'brand' });

    // Category -> Item
    db.Category.hasMany(db.Item, { foreignKey: 'categoryId', as: 'items' });
    db.Item.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });

    // Item -> Stock
    db.Item.hasMany(db.Stock, { foreignKey: 'itemId', as: 'stocks' });
    db.Stock.belongsTo(db.Item, { foreignKey: 'itemId', as: 'item' });

    // Account -> Stock
    db.Account.hasMany(db.Stock, { foreignKey: 'createdBy', as: 'userStocks' });
    db.Stock.belongsTo(db.Account, { foreignKey: 'createdBy', as: 'user' });

    // Room Location Relationships
    db.Account.hasMany(db.RoomLocation, { foreignKey: 'createdBy', as: 'userRoomLocations' });
    db.RoomLocation.belongsTo(db.Account, { foreignKey: 'createdBy', as: 'user' });

    // PC Relationships
    db.RoomLocation.hasMany(db.PC, { foreignKey: 'roomLocationId', as: 'pcs' });
    db.PC.belongsTo(db.RoomLocation, { foreignKey: 'roomLocationId', as: 'roomLocation' });

    db.Account.hasMany(db.PC, { foreignKey: 'createdBy', as: 'userPCs' });
    db.PC.belongsTo(db.Account, { foreignKey: 'createdBy', as: 'user' });

    // PC Component Relationships
    db.PC.hasMany(db.PCComponent, { foreignKey: 'pcId', as: 'components' });
    db.PCComponent.belongsTo(db.PC, { foreignKey: 'pcId', as: 'pc' });

    db.Item.hasMany(db.PCComponent, { foreignKey: 'itemId', as: 'pcComponents' });
    db.PCComponent.belongsTo(db.Item, { foreignKey: 'itemId', as: 'item' });

    db.Stock.hasMany(db.PCComponent, { foreignKey: 'stockId', as: 'pcComponents' });
    db.PCComponent.belongsTo(db.Stock, { foreignKey: 'stockId', as: 'stock' });

    db.Account.hasMany(db.PCComponent, { foreignKey: 'createdBy', as: 'userPCComponents' });
    db.PCComponent.belongsTo(db.Account, { foreignKey: 'createdBy', as: 'user' });

    // Specification Field Relationships
    db.Category.hasMany(db.SpecificationField, { foreignKey: 'categoryId', as: 'specificationFields' });
    db.SpecificationField.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });

    // Dispose Relationships (Added)
    db.Item.hasMany(db.Dispose, { foreignKey: 'itemId', as: 'disposals' });
    db.Dispose.belongsTo(db.Item, { foreignKey: 'itemId', as: 'item' });
    
    db.StorageLocation.hasMany(db.Dispose, { foreignKey: 'locationId', as: 'disposals' });
    db.Dispose.belongsTo(db.StorageLocation, { foreignKey: 'locationId', as: 'location' });
    
    db.Account.hasMany(db.Dispose, { foreignKey: 'createdBy', as: 'userDisposals' });
    db.Dispose.belongsTo(db.Account, { foreignKey: 'createdBy', as: 'user' });

    // Stock-Dispose Direct Relationship (without foreign key constraints to avoid circular dependency)
    db.Dispose.hasOne(db.Stock, { foreignKey: 'disposeId', as: 'stockEntry', constraints: false });
    db.Stock.belongsTo(db.Dispose, { foreignKey: 'disposeId', as: 'disposal', constraints: false });

    // Dispose Return Stock Relationship (commented out until returnStockId is needed)
    // db.Stock.hasMany(db.Dispose, { foreignKey: 'returnStockId', as: 'returnDisposals' });
    // db.Dispose.belongsTo(db.Stock, { foreignKey: 'returnStockId', as: 'returnStock' });

    // ---------------- Other Existing Relationships ----------------
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    db.Account.hasOne(db.Employee, { foreignKey: 'accountId', as: 'employee' });
    db.Employee.belongsTo(db.Account, { foreignKey: 'accountId' });

    db.Department.hasMany(db.Employee, { foreignKey: 'departmentId', as: 'employees' });
    db.Employee.belongsTo(db.Department, { foreignKey: 'departmentId' });

    db.Employee.hasMany(db.Workflow, { foreignKey: 'employeeId' });
    db.Workflow.belongsTo(db.Employee, { foreignKey: 'employeeId' });

    db.Employee.hasMany(db.Request, { foreignKey: 'employeeId' });
    db.Request.belongsTo(db.Employee, { foreignKey: 'employeeId' });

    // Activity Log Relationships
    db.Account.hasMany(db.ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });
    db.ActivityLog.belongsTo(db.Account, { foreignKey: 'userId', as: 'user' });

    // sync all models with database - force: true will drop and recreate all tables
    // Use { force: true } to drop and recreate all tables (WARNING: This will delete all data!)
    // Use { alter: true } to alter existing tables (safer, preserves data)
    // Use {} for no changes (just sync structure)
    
    console.log('Syncing database models...');
    try {
        // Try to sync with alter first
        await sequelize.sync({ force: false, alter: true });
        console.log('Database models synced successfully!');
    } catch (error) {
        if (error.code === 'ER_TOO_MANY_KEYS') {
            console.log('⚠️  Too many keys error detected. Trying to create missing tables only...');
            try {
                // Try to create missing tables without altering existing ones
                await sequelize.sync({ force: false, alter: false });
                console.log('✅ Missing tables created successfully!');
            } catch (syncError) {
                console.log('⚠️  Could not create missing tables:', syncError.message);
                console.log('Database models sync skipped due to key limit.');
            }
        } else {
            console.log('⚠️  Sync error detected. Trying to create missing tables only...');
            try {
                // Try to create missing tables without altering existing ones
                await sequelize.sync({ force: false, alter: false });
                console.log('✅ Missing tables created successfully!');
            } catch (syncError) {
                console.log('⚠️  Could not create missing tables:', syncError.message);
                console.log('Database models sync skipped.');
            }
        }
    }

    // Add some initial data if tables are empty
    await addInitialData();

    // expose sequelize instance
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
}

// Function to add initial data if tables are empty
async function addInitialData() {
    try {
        console.log('Checking for initial data...');
        
        // Check if we have any categories
        const categoryCount = await db.Category.count();
        if (categoryCount === 0) {
            console.log('Adding initial categories...');
            await db.Category.bulkCreate([
                { name: 'Central Processing Unit (CPU)' },
                { name: 'Graphics Processing Unit (GPU)' },
                { name: 'Random Access Memory (RAM)' },
                { name: 'Storage Device' },
                { name: 'Motherboard' },
                { name: 'Power Supply Unit (PSU)' },
                { name: 'Computer Case' },
                { name: 'Monitor' },
                { name: 'Keyboard' },
                { name: 'Mouse' },
                { name: 'Network Card' },
                { name: 'Sound Card' },
                { name: 'Cooling System' },
                { name: 'Other' }
            ]);
        }

        // Check if we have any brands
        const brandCount = await db.Brand.count();
        if (brandCount === 0) {
            console.log('Adding initial brands...');
            await db.Brand.bulkCreate([
                { name: 'Intel' },
                { name: 'AMD' },
                { name: 'NVIDIA' },
                { name: 'Samsung' },
                { name: 'Western Digital' },
                { name: 'Seagate' },
                { name: 'ASUS' },
                { name: 'MSI' },
                { name: 'Gigabyte' },
                { name: 'Corsair' },
                { name: 'Kingston' },
                { name: 'Crucial' },
                { name: 'Logitech' },
                { name: 'Razer' },
                { name: 'Other' }
            ]);
        }

        // Check if we have any storage locations
        const locationCount = await db.StorageLocation.count();
        if (locationCount === 0) {
            console.log('Adding initial storage locations...');
            await db.StorageLocation.bulkCreate([
                { name: 'storage room 1', description: 'Main storage room' },
                { name: 'storage room 2', description: 'Secondary storage room' },
                { name: 'warehouse', description: 'Main warehouse' },
                { name: 'office storage', description: 'Office storage area' }
            ]);
        }

        console.log('✅ Initial data check completed!');
    } catch (error) {
        console.error('❌ Error adding initial data:', error);
        // Don't throw error, just log it
    }
}
