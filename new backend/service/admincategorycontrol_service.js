const categoryRepository = require("../repository/admincategorycontrol_repo");

const createCategory = async (data) => {
    return await categoryRepository.createCategory(data);
};

const getCategories = async () => {
    return await categoryRepository.getCategories();
};

const updateCategory = async (categoryId, data) => {
    return await categoryRepository.updateCategory(
        categoryId,
        data
    );
};

const deleteCategory = async (categoryId) => {
    return await categoryRepository.deleteCategory(
        categoryId
    );
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};