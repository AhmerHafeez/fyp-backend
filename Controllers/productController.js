import Product from "../Models/productModal.js";
import User from "../Models/userModel.js";

export const getProductsController = async (req, res) => {
    try {
        // Show all products created by admin (users with role 'admin')
        const products = await Product.find().populate({
            path: 'userId',
            match: { role: 'admin' },
            select: 'email'
        }).then(products => products.filter(p => p.userId !== null)); // Filter out products where userId doesn't match
        
        return res.status(200).json({ status: true, data: products });
    } catch (error) {
        return res.status(500).json({ status: false, message: "failed to fetch products!", error });
    }
};

export const insertProductController = async (req, res) => {
    
    if (!req.isAdmin) return res.status(403).json({ message: "Admin only" });

    try {
        const productData = { ...req.body, userId: req.user.userId };
        const product = await Product.create(productData);
        
        // Add product to user's products array
        await User.findByIdAndUpdate(req.user.userId, { $push: { products: product._id } });
        
        return res.status(200).json({ status:true, message: "product inserted" });
    } catch (error) {
        return res.status(500).json({ status:false, message: "failed to insert product!", error });
    }
};

export const updateProductController = async(req, res) => {
    if (!req.isAdmin) return res.status(403).json({ message: "Admin only" });

    const { productId, newdata } = req.body;

    try {
        await Product.findOneAndUpdate({ _id: productId }, newdata);
        return res.status(200).json({ status:true, message: "product updated" });
    } catch (error) {
        return res.status(404).json({ status:false, message: "failed to update product!", error });
    }
};

export const deleteProductController = async(req, res) => {
    if (!req.isAdmin) return res.status(403).json({ message: "Admin only" });

    const { productId } = req.body;

    try {
        await Product.deleteOne({ _id: productId });
        return res.status(200).json({ status:true, message: "product deleted" });
    } catch (error) {
        return res.status(404).json({ status:false, message: "failed to delete product!", error });
    }
};
