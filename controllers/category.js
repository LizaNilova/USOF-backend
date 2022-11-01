import Post from '../models/Post.js'
import Category from '../models/Category.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export class CategoryController {
    // Create category
    async createCategory(req, res) {
        try {
            const { title, description } = req.body
            const existedCategory = await Category.findOne({ title: title })
            if (!existedCategory) {
                const newCategory = new Category({
                    title,
                    description,
                })
                await newCategory.save()
                return res.json({
                    category: newCategory,
                    message: null
                })
            } else {
                return res.json({
                    category: null,
                    message: 'The same category exists.'
                })
            }
        } catch (error) {
            return res.json({
                message: "Something went wrong."
            })
        }
    }

    // Get all categories
    async getAllCategories(req, res) {
        try {
            const allCategories = await Category.find()
            res.json({
                categories: allCategories
            })
        } catch (error) {
            return res.json({
                message: "Something went wrong."
            })
        }
    }

    // Get category by id
    async getCategoryById(req, res) {
        try {
            const category = await Category.findById(req.params.category_id)
            res.json({ category: category })
        } catch (error) {
            return res.json({
                message: "Something went wrong."
            })
        }
    }

    // Get all posts with one category
    async getPostWithCategory(req, res) {
        try {
            const category = await Category.findById(req.params.category_id)
            const categoryId = category.id

            const posts = await Post.find({ categories: { _id: categoryId } })
            res.json(posts)
        } catch (error) {
            return res.json({
                message: "Something went wrong."
            })
        }
    }

    // Update specified data of category
    async updateCategoryData(req, res) {
        try {
            const { title, description } = req.body
            await Category.findByIdAndUpdate(req.params.category_id, {
                title: title,
                description: description,
            })
            res.json({
                message: "Category was successfully updated."
            })
        } catch (error) {
            return res.json({
                message: "Something went wrong."
            })
        }
    }

    // Delete category
    async deleteCategory(req, res) {
        try {
            await Category.findByIdAndDelete(req.params.category_id)
            res.json({
                message: "Category was successfully deleted."
            })
        } catch (error) {
            res.json({
                message: "Something went wrong."
            })
        }
    }
}

