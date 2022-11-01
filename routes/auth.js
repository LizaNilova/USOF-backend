import { Router } from "express"
import { checkAuth } from "../utils/checkAuth.js"
import { LoginController } from "../controllers/auth.js"
const loginController = new LoginController()

const router = new Router()

// Registration of a new user, required parameters are [login, password, password confirmation, email]
router.post('/register', loginController.register)

// Log in user, required parameters are [login, email,password]. Only users with a confirmed email can sign in
router.post('/login', loginController.login)

// Log out authorized user
router.post('/logout', checkAuth, loginController.logout)

// Send a reset link to user email, requiredparameter is [email]
router.post('/password-reset', loginController.resetPassword)

//Getting information about user by himself
router.get('/me', checkAuth, loginController.getMe)

// Recover password 
router.post('/recover', loginController.forgotPassword)

// Recover password 
router.post('/recover/:token', loginController.reset)


export default router
