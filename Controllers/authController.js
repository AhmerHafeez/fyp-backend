import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';
import bcrypt from "bcrypt";

// 🔹 FIXED ADMIN CREDENTIALS
const ADMIN_EMAIL = "ranaahmer4956@gmail.com";
const ADMIN_PASSWORD = "Ahmer@123";

export const registerController = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(404).json({ status:false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ 
            email, 
            password: hashedPassword,
            role: "user"
        });

        await newUser.save();

        res.status(200).json({ status:true, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status:false, message: 'Server error' });
    }
};

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status:false, message: 'Invalid email or password' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(404).json({ status:false, message: 'Invalid email or password' });
        }

        // 🔹 Set role: admin check
        let role = user.role;

        // Admin fixed credentials (bcrypt compare)
        const isAdminLogin = email === ADMIN_EMAIL && await bcrypt.compare(ADMIN_PASSWORD, user.password);
        if (isAdminLogin) {
            role = "admin";
        }

        // 🔹 JWT TOKEN ME role + email
        const token = jwt.sign(
            { userId: user._id, role, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            status: true, 
            message: 'Login successful',
            token: token,
            user: {
                id: user._id,
                email: user.email,
                role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status:false, message: 'Server error' });
    }
};

export const logoutController = (req, res) => {
    res.status(200).json({ 
        status: true,
        message: 'Logged out successfully' 
    });
};

export const getUserController = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.userId });
        if (!user) {
            return res.status(404).json({ status:false, message: "unauthorized user" });
        }

        const { email, products, sales, role } = user;

        return res.status(200).json({ 
            status:true, 
            data: { email, products, sales, role } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status:false, message: 'Server error' });
    }
};

export const adminSignupController = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({ status:false, message: 'Admin already exists. Only one admin allowed.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(404).json({ status:false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new User({ 
            email, 
            password: hashedPassword,
            role: "admin"
        });

        await newAdmin.save();

        res.status(200).json({ status:true, message: 'Admin registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status:false, message: 'Server error' });
    }
};

export const adminSigninController = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || user.role !== 'admin') {
            return res.status(404).json({ status:false, message: 'Invalid admin credentials' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(404).json({ status:false, message: 'Invalid admin credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            status: true, 
            message: 'Admin login successful',
            token: token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status:false, message: 'Server error' });
    }
};

export const getAllUsersController = async (req, res) => {
    if (!req.isAdmin) return res.status(403).json({ message: "Admin only" });

    try {
        const users = await User.find({}, 'email role createdAt');
        return res.status(200).json({ status: true, data: users });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Failed to fetch users', error });
    }
};
