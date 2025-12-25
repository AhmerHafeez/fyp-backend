import { Router } from "express";
import { getUserController, loginController, logoutController, registerController, adminSignupController, adminSigninController, getAllUsersController } from "../Controllers/authController.js";
import { deleteProductController, getProductsController, insertProductController, updateProductController } from "../Controllers/productController.js";
import authMiddleware, { isAdmin } from "../Middleware/authMiddleware.js";
import { createNewSaleController, deleteSaleController, getSalesController } from "../Controllers/salesController.js";

export const route = Router();

// auth
route.post("/login", loginController);
route.post("/register", registerController);
route.get("/logout", logoutController);
route.get("/getUser", authMiddleware, getUserController);

// admin auth
route.post("/admin/signup", adminSignupController);
route.post("/admin/signin", adminSigninController);
route.get("/admin/users", authMiddleware, isAdmin, getAllUsersController);

// products
route.get("/products", authMiddleware, getProductsController); 
route.post("/insert", authMiddleware, isAdmin, insertProductController); 
route.post("/update", authMiddleware, isAdmin, updateProductController); 
route.post("/delete", authMiddleware, isAdmin, deleteProductController); 

// sales
route.get("/getsales", authMiddleware, getSalesController); 
route.post("/createsales", authMiddleware, createNewSaleController); 
route.post("/deletesales", authMiddleware, deleteSaleController); 
