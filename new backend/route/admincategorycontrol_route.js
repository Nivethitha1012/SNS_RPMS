const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware.js");
const categoryController = require("../controller/admincategorycontrol_con");

router.post(
    "/category",
    authMiddleware,
    categoryController.createCategory
);

router.get(
    "/categories",
    authMiddleware,
    categoryController.getCategories
);

router.put(
    "/category/:categoryId",
    authMiddleware,
    categoryController.updateCategory
);

router.delete(
    "/category/:categoryId",
    authMiddleware,
    categoryController.deleteCategory
);

module.exports = router;