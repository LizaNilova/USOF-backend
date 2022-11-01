import { Router } from "express"
import { CategoryController } from '../controllers/category.js'
import { checkAuth } from "../utils/checkAuth.js"
const categoryController = new CategoryController()
const router = new Router()

// Get all categories
router.get('/', categoryController.getAllCategories)

// Get specified category data
router.get('/:category_id', categoryController.getCategoryById)

// Get all posts associated with the specified category
router.get('/:category_id/posts', categoryController.getPostWithCategory)

// Create a new category, required parametr is [title]
router.post('/', checkAuth, categoryController.createCategory)

// Update specified category data
router.patch('/:category_id', checkAuth, categoryController.updateCategoryData)

// Delete a category
router.delete('/:category_id', checkAuth, categoryController.deleteCategory)

export default router
