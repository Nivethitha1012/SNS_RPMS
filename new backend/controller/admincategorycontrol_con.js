const categoryService = require("../service/admincategorycontrol_service");

const createCategory = async (req, res) => {
    try {
        const result = await categoryService.createCategory(req.body);

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getCategories = async (req, res) => {
    try {
        const result = await categoryService.getCategories();

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const result = await categoryService.updateCategory(
            categoryId,
            req.body
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        await categoryService.deleteCategory(categoryId);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};