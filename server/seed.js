import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Inventory from './models/Inventory.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';

dotenv.config();

const products = [
    { name: 'Wireless Keyboard', sku: 'ELEC-001', quantity: 45, price: 49.99, minThreshold: 10, category: null },
    { name: 'USB-C Hub 7-Port', sku: 'ELEC-002', quantity: 30, price: 34.99, minThreshold: 8 },
    { name: 'Mechanical Keyboard', sku: 'ELEC-003', quantity: 18, price: 89.99, minThreshold: 5 },
    { name: 'Wireless Mouse', sku: 'ELEC-004', quantity: 60, price: 29.99, minThreshold: 15 },
    { name: '27" Monitor 4K', sku: 'ELEC-005', quantity: 12, price: 399.99, minThreshold: 3 },
    { name: 'Laptop Stand Aluminium', sku: 'ELEC-006', quantity: 35, price: 44.99, minThreshold: 8 },
    { name: 'Webcam 1080p', sku: 'ELEC-007', quantity: 22, price: 79.99, minThreshold: 5 },
    { name: 'USB Microphone', sku: 'ELEC-008', quantity: 15, price: 59.99, minThreshold: 5 },
    { name: 'HDMI Cable 2m', sku: 'ELEC-009', quantity: 80, price: 12.99, minThreshold: 20 },
    { name: 'Thunderbolt Dock', sku: 'ELEC-010', quantity: 8, price: 189.99, minThreshold: 3 },

    { name: 'Office Chair Ergonomic', sku: 'FURN-001', quantity: 10, price: 299.99, minThreshold: 3 },
    { name: 'Standing Desk 140cm', sku: 'FURN-002', quantity: 6, price: 499.99, minThreshold: 2 },
    { name: 'Monitor Arm Dual', sku: 'FURN-003', quantity: 20, price: 79.99, minThreshold: 5 },
    { name: 'Cable Management Tray', sku: 'FURN-004', quantity: 40, price: 24.99, minThreshold: 10 },
    { name: 'Desk Lamp LED', sku: 'FURN-005', quantity: 25, price: 39.99, minThreshold: 8 },
    { name: 'Whiteboard 120x90cm', sku: 'FURN-006', quantity: 7, price: 89.99, minThreshold: 2 },
    { name: 'Filing Cabinet 3-Drawer', sku: 'FURN-007', quantity: 5, price: 149.99, minThreshold: 2 },
    { name: 'Bookshelf 5-Tier', sku: 'FURN-008', quantity: 9, price: 119.99, minThreshold: 2 },

    { name: 'A4 Paper Ream 500 sheets', sku: 'STAT-001', quantity: 200, price: 7.99, minThreshold: 50 },
    { name: 'Ballpoint Pens Box 50', sku: 'STAT-002', quantity: 80, price: 9.99, minThreshold: 20 },
    { name: 'Sticky Notes Pack', sku: 'STAT-003', quantity: 120, price: 4.99, minThreshold: 30 },
    { name: 'Stapler Heavy Duty', sku: 'STAT-004', quantity: 30, price: 14.99, minThreshold: 8 },
    { name: 'Staples Box 5000', sku: 'STAT-005', quantity: 60, price: 3.99, minThreshold: 15 },
    { name: 'Scissors Pack of 6', sku: 'STAT-006', quantity: 25, price: 11.99, minThreshold: 6 },
    { name: 'Highlighters 10 Colour', sku: 'STAT-007', quantity: 55, price: 6.99, minThreshold: 15 },
    { name: 'Binder A4 4-Ring', sku: 'STAT-008', quantity: 70, price: 5.49, minThreshold: 20 },
    { name: 'Printer Ink Black', sku: 'STAT-009', quantity: 4, price: 24.99, minThreshold: 5 }, // low stock
    { name: 'Printer Ink Colour Set', sku: 'STAT-010', quantity: 3, price: 34.99, minThreshold: 5 }, // low stock

    { name: 'Hand Sanitiser 500ml', sku: 'SFTY-001', quantity: 90, price: 5.99, minThreshold: 20 },
    { name: 'Disposable Gloves L 100', sku: 'SFTY-002', quantity: 15, price: 12.99, minThreshold: 20 }, // low stock
    { name: 'Safety Goggles', sku: 'SFTY-003', quantity: 40, price: 8.99, minThreshold: 10 },
    { name: 'First Aid Kit Standard', sku: 'SFTY-004', quantity: 8, price: 29.99, minThreshold: 3 },
    { name: 'Fire Extinguisher 2kg', sku: 'SFTY-005', quantity: 6, price: 49.99, minThreshold: 2 },
    { name: 'Hard Hat White', sku: 'SFTY-006', quantity: 20, price: 16.99, minThreshold: 5 },
    { name: 'Hi-Vis Vest Medium', sku: 'SFTY-007', quantity: 35, price: 9.99, minThreshold: 10 },

    { name: 'Network Switch 8-Port', sku: 'NET-001', quantity: 12, price: 69.99, minThreshold: 3 },
    { name: 'Cat6 Ethernet Cable 5m', sku: 'NET-002', quantity: 50, price: 8.99, minThreshold: 15 },
    { name: 'Patch Panel 24-Port', sku: 'NET-003', quantity: 5, price: 59.99, minThreshold: 2 },
    { name: 'Wireless Access Point', sku: 'NET-004', quantity: 7, price: 119.99, minThreshold: 2 },
    { name: 'Rack Mount 12U', sku: 'NET-005', quantity: 3, price: 199.99, minThreshold: 1 },

    { name: 'Coffee Beans 1kg', sku: 'KITCH-001', quantity: 10, price: 19.99, minThreshold: 3 },
    { name: 'Paper Cups 100pk', sku: 'KITCH-002', quantity: 20, price: 8.99, minThreshold: 5 },
    { name: 'Dish Soap 1L', sku: 'KITCH-003', quantity: 12, price: 4.49, minThreshold: 4 },
    { name: 'Kitchen Roll 6-Pack', sku: 'KITCH-004', quantity: 18, price: 7.99, minThreshold: 5 },
    { name: 'Instant Coffee 200g', sku: 'KITCH-005', quantity: 0, price: 6.99, minThreshold: 3 }, // out of stock

    { name: 'Laptop Dell Latitude', sku: 'COMP-001', quantity: 5, price: 1099.99, minThreshold: 2 },
    { name: 'iPad 10th Gen', sku: 'COMP-002', quantity: 4, price: 499.99, minThreshold: 2 },
    { name: 'External SSD 1TB', sku: 'COMP-003', quantity: 14, price: 89.99, minThreshold: 4 },
    { name: 'RAM DDR5 16GB', sku: 'COMP-004', quantity: 20, price: 64.99, minThreshold: 5 },
    { name: 'Surge Protector 6-Way', sku: 'COMP-005', quantity: 28, price: 29.99, minThreshold: 8 },
];

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing inventory
    await Inventory.deleteMany({});
    console.log('Cleared existing inventory');

    // Find or create a seed admin user
    let admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
        const hash = await bcrypt.hash('admin123', 12);
        admin = await User.create({
            name: 'Admin', email: 'admin@company.com',
            passwordHash: hash, role: 'Admin',
        });
        console.log('Created admin user: admin@company.com / admin123');
    }

    // Insert products
    const items = products.map(p => ({ ...p, createdBy: admin._id, lastUpdatedBy: admin._id }));
    await Inventory.insertMany(items);
    console.log(`✅ Seeded ${items.length} products`);

    // Summary
    const outOfStock = items.filter(i => i.quantity === 0).length;
    const lowStock = items.filter(i => i.quantity > 0 && i.quantity <= i.minThreshold).length;
    console.log(`   ${outOfStock} out of stock, ${lowStock} low stock — good for demo!`);

    mongoose.disconnect();
};

seed().catch((e) => { console.error(e); process.exit(1); });