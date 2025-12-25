import User from '../Models/userModel.js';
import Sale from '../Models/salesModal.js';
import Product from '../Models/productModal.js';

// 🔵 GET SALES
// User → apni sales
// Admin → sab users ki sales
export const getSalesController = async (req, res) => {
    try {
        if (req.isAdmin) {
            // 🔴 Admin → sab sales
            const sales = await Sale.find().populate("userId", "email");
            return res.status(200).json({ status:true, data: sales });
        }

        // 🔵 User → apni sales
        const user = await User.findOne({ _id:req.user.userId }).populate("sales");
        if (!user){ 
            return res.status(404).json({ status:false, message: "unauthorized user" });
        }

        return res.status(200).json({ status:true, data: user.sales });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status:false,message: 'Failed getting sales data' });
    }
};

// 🔵 CREATE NEW SALE
export const createNewSaleController = async (req, res) => {
    try {
        const { cust_name, cust_email, cust_contact, cartItems } = req.body;

        const user = await User.findOne({ _id:req.user.userId });
        if (!user){ 
            return res.status(404).json({ status:false, message: "unauthorized user" });
        }

        const sale = await Sale.create({
            cust_name, 
            cust_email, 
            cust_contact, 
            cartItems,
            userId:req.user.userId
        });

        user.sales.push(sale._id);
        await user.save();

        // update product stock
        for (let i = 0; i < cartItems.length; i++) {
            const product = await Product.findOne({ _id:cartItems[i].c_id });
            if (product) {
                product.p_stock -= cartItems[i].c_quantity;
                await product.save();
            }
        }

        return res.status(200).json({ status:true, message: "sale created" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status:false,message: 'Failed to create sale' });
    }
};

// 🔵 DELETE SALE
export const deleteSaleController = async (req, res) => {
    try {
        const { salesId } = req.body;

        // 🔴 Admin → delete any sale
        if (req.isAdmin) {
            await Sale.deleteOne({ "_id": salesId });
            return res.status(200).json({ status:true, message: "sale deleted by admin" });
        }

        // 🔵 User → delete only own sale
        const user = await User.findOne({ _id:req.user.userId });
        if (!user){ 
            return res.status(404).json({ status:false, message: "unauthorized user" });
        }

        await Sale.deleteOne({ "_id": salesId });
        const index = user.sales.indexOf(salesId);
        if (index > -1) user.sales.splice(index,1);
        await user.save();

        return res.status(200).json({ status:true, message: "sale deleted" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status:false,message: 'Failed to delete sale' });
    }
};
