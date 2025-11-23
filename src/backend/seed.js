import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Review from './models/Review.js';
import Order from './models/Order.js';
import OrderHistory from './models/OrderHistory.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected for seeding');
    
    // 1. Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});
    await OrderHistory.deleteMany({});

    console.log('Old data cleared.');

    // Helper to hash password
    const hashPassword = async (password) => {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    };

    // 2. Prepare Encrypted Users
    const adminPassword = await hashPassword('Admin123!');
    const userPassword = await hashPassword('User123!');

    const usersData = [
        { 
            username: 'admin', 
            email: 'admin@electromart.com', 
            password: adminPassword, 
            role: 'admin' 
        },
        { 
            username: 'john_doe', 
            email: 'john@example.com', 
            password: userPassword, 
            role: 'user' 
        },
        { 
            username: 'jane_smith', 
            email: 'jane@example.com', 
            password: userPassword, 
            role: 'user' 
        },
        { 
            username: 'bob_wilson', 
            email: 'bob@example.com', 
            password: userPassword, 
            role: 'user' 
        }
    ];

    // 3. Insert Users using insertMany (Bypasses the double-encryption issue)
    const users = await User.insertMany(usersData);
    console.log('Users created with single encryption.');

    // 4. Create Categories
    const categories = await Category.insertMany([
      { name: 'Laptops', description: 'High-performance laptops for work and gaming' },
      { name: 'Graphics Cards', description: 'GPUs for gaming and professional work' },
      { name: 'Processors', description: 'CPUs and processors' },
      { name: 'Memory', description: 'RAM and storage solutions' }
    ]);

    // 5. Create Products
    const products = await Product.insertMany([
      { name: 'MacBook Pro 16"', description: 'Powerful laptop for professionals', brand: 'Apple', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300', price: 2499, stock: 15, category: categories[0]._id },
      { name: 'Dell XPS 13', description: 'Ultra-portable and powerful', brand: 'Dell', image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300', price: 1299, stock: 20, category: categories[0]._id },
      { name: 'NVIDIA RTX 4090', description: 'Top-tier graphics card', brand: 'NVIDIA', image: 'https://images.unsplash.com/photo-1631211588214-c1e3c3f4b5db?w=300', price: 1599, stock: 8, category: categories[1]._id },
      { name: 'Intel Core i9-13900K', description: 'Latest flagship processor', brand: 'Intel', image: 'https://images.unsplash.com/photo-1555618224-cff0c1edbf5f?w=300', price: 689, stock: 12, category: categories[2]._id },
      { name: 'Kingston Fury RGB 32GB', description: '32GB DDR5 RAM', brand: 'Kingston', image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300', price: 149, stock: 50, category: categories[3]._id },
      { name: 'Samsung 970 EVO Plus', description: '1TB NVMe SSD', brand: 'Samsung', image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300', price: 129, stock: 45, category: categories[3]._id },
      { name: 'ASUS ROG Zephyrus G14', description: 'Gaming laptop with RTX 4060', brand: 'ASUS', image: 'https://images.unsplash.com/photo-1588874657197-cfe66ee9c379?w=300', price: 1599, stock: 10, category: categories[0]._id },
      { name: 'AMD Ryzen 9 7950X3D', description: 'High-performance CPU', brand: 'AMD', image: 'https://images.unsplash.com/photo-1555618224-cff0c1edbf5f?w=300', price: 699, stock: 14, category: categories[2]._id },
      { name: 'NVIDIA RTX 4080', description: 'High-end graphics card', brand: 'NVIDIA', image: 'https://images.unsplash.com/photo-1631211588214-c1e3c3f4b5db?w=300', price: 1199, stock: 16, category: categories[1]._id },
      { name: 'Corsair MP600 Core XT', description: '2TB SSD with high speed', brand: 'Corsair', image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300', price: 199, stock: 35, category: categories[3]._id }
    ]);

    // 6. Create Reviews
    const reviews = await Review.insertMany([
      { user: users[1]._id, product: products[0]._id, rating: 5, comment: 'Excellent laptop, very fast and reliable!' },
      { user: users[2]._id, product: products[0]._id, rating: 4, comment: 'Great performance but pricey' },
      { user: users[3]._id, product: products[2]._id, rating: 5, comment: 'Best GPU I\'ve ever owned!' },
      { user: users[1]._id, product: products[4]._id, rating: 4, comment: 'Good RAM, no issues' },
      { user: users[2]._id, product: products[1]._id, rating: 5, comment: 'Perfect for work and travel' }
    ]);

    // Update Product Ratings
    await Product.findByIdAndUpdate(products[0]._id, { ratingAverage: 4.5, ratingCount: 2 });
    await Product.findByIdAndUpdate(products[2]._id, { ratingAverage: 5, ratingCount: 1 });
    await Product.findByIdAndUpdate(products[4]._id, { ratingAverage: 4, ratingCount: 1 });
    await Product.findByIdAndUpdate(products[1]._id, { ratingAverage: 5, ratingCount: 1 });

    // 7. Create Orders
    const order = await Order.create({
      user: users[1]._id,
      items: [
        { productId: products[0]._id, qty: 1, price: products[0].price },
        { productId: products[4]._id, qty: 2, price: products[4].price }
      ],
      total: 2797,
      status: 'Paid'
    });

    await OrderHistory.create({
      order: order._id,
      status: 'Paid',
      changedBy: users[0]._id // Admin ID
    });

    console.log('Seeding completed successfully!');
    mongoose.connection.close();
  })
  .catch(err => {
    console.log('Seeding error:', err);
    mongoose.connection.close();
  });