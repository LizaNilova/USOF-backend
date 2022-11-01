import { Router } from "express"
import { UserController } from "../controllers/user.js"
import { checkAuth } from "../utils/checkAuth.js"
const userController = new UserController()
const router = new Router()

// Get all users
router.get('/', userController.getAllUsers)

// Get specified user data
router.get('/:user_id', userController.getUserById)

// create a new user
// 
router.post('/', checkAuth, userController.createNewUser)
router.get('/:user_id/verify/:tokenVerifyEmail', userController.verifyLink)

// Upload user avatar
router.patch('/users/avatar', checkAuth, userController.setUserAvatar)

// Update user data
router.patch('/:user_id', checkAuth, userController.updateUserData)

// Delete user
router.delete('/:user_id', checkAuth, userController.deleteUser)


export default router
