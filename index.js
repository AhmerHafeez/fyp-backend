// import express from 'express';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import 'dotenv/config';
// import connectDB from './Db/index.js';
// import { route } from './Routes/route.js';
// import User from './Models/userModel.js';
// import bcrypt from 'bcrypt';

// const seedAdmin = async () => {
//     try {
//         const adminEmail = 'ahmer123@gmail.com';
//         const adminPassword = 'Ahmer@123';

//         const existingAdmin = await User.findOne({ email: adminEmail });
//         if (!existingAdmin) {
//             const hashedPassword = await bcrypt.hash(adminPassword, 10);
//             const admin = new User({
//                 email: adminEmail,
//                 password: hashedPassword,
//                 role: 'admin'
//             });
//             await admin.save();
//             console.log('Predefined admin created');
//         } else {
//             console.log('Admin already exists');
//         }
//     } catch (error) {
//         console.error('Error seeding admin:', error);
//     }
// };

// const server = express();
// const PORT = process.env.PORT || 8000;

// // CORS configuration

// const allowedOrigins = [
//   'http://localhost:5173',              
//   'https://fyp-eta-steel.vercel.app'  
// ];

// // Handle preflight requests
// server.options('*', cors({
//   origin: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: false,
//   maxAge: 86400 // 24 hours
// }));

// // Enable CORS for all routes
// server.use(cors({
//   origin: function(origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
    
//     // Check if the origin is in the allowed list or matches a pattern
//     if (
//       allowedOrigins.includes(origin) || 
//       origin.includes('localhost:') || 
//       origin.includes('vercel.app')
//     ) {
//       return callback(null, true);
//     }
    
//     return callback(new Error('Not allowed by CORS'));
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   exposedHeaders: ['Content-Range', 'X-Content-Range'],
//   credentials: false,
//   maxAge: 86400 
// }));

// // Middleware
// // Parse cookies (if still needed for other features)
// server.use(cookieParser());

// // Handle preflight requests
// server.use((req, res, next) => {
//   // Set CORS headers
//   res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
//   // Handle preflight
//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }
  
//   next();
// });
// server.use(express.json({ limit: "16kb" }));
// server.use(express.urlencoded({ extended: true }));

// // Routes

// server.use("/", route);


// server.get("/", (req, res) => {
//   res.send("Hello to backend");
// });``

// server.get("*", (req, res) => {
//   res.status(404).send("404 NOT FOUND <a href='./'> Go To Home</a>");
// });

// connectDB()
//   .then(async () => {
//     await seedAdmin();
//     server.listen(PORT, () => {
//       console.log(`Server running at http://localhost:${PORT}`);
//       console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
//     });
//   })
//   .catch(error => console.error("DB connection error:", error));


import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import connectDB from "./Db/index.js";
import { route } from "./Routes/route.js";
import User from "./Models/userModel.js";
import bcrypt from "bcrypt";

const app = express();

/* =======================
   DATABASE + ADMIN SEED
======================= */
let isConnected = false;

const seedAdmin = async () => {
  const adminEmail = "ahmer123@gmail.com";
  const adminPassword = "Ahmer@123";

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await User.create({
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });
    console.log("✅ Admin created");
  }
};

const initDB = async () => {
  if (!isConnected) {
    await connectDB();
    await seedAdmin();
    isConnected = true;
  }
};

/* =======================
   MIDDLEWARE
======================= */
app.use(cors({
  origin: "*", // ✅ safest on Vercel
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =======================
   ROUTES
======================= */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/api", route);

/* =======================
   SERVERLESS HANDLER
======================= */
export default async function handler(req, res) {
  await initDB();
  return app(req, res);
}
