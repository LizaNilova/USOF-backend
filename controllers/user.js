import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendEmail } from '../utils/sendMailer.js'

import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import Post from '../models/Post.js'

export class UserController {
    // Get all users
    async getAllUsers(req, res) {
        try {
            const users = await User.find().sort('-createdAt')
            res.json(users)
        } catch (error) {
            return res.json({
                message: "Something went wrong."
            })
        }
    }

    // Get user by ID
    async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.user_id)
            res.json(user)
        } catch (error) {
            return res.json({
                message: 'Something went wrong.'
            })
        }
    }

    // Create a new user (ONLY FOR ADMIN)
    async createNewUser(req, res) {
        try {
                const { login, password, passwordConfirmation, fullname, email, role } = req.body

                const loginCheck = await User.find({ login: login })
                if (!loginCheck) {
                    return res.json({
                        message: "This login is used. Try another one."
                    })
                }
                if (password !== passwordConfirmation) {
                    return res.json({
                        message: "Password confirmation was faild. Try again."
                    })
                } else {
                    // Шифруем пароль
                    const salt = bcrypt.genSaltSync(10)
                    const hash = bcrypt.hashSync(password, salt)

                    const newUser = new User({
                        login: login,
                        password: hash,
                        full_name: fullname,
                        email: email,
                        profile_picture: "userAvatar.png",
                        rating: 0,
                        role: role
                    })
                    await newUser.save()

                    // send verification to email after registration
                    const tokenForVerifyEmail = jwt.sign({
                        id: newUser._id,
                    },
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' },
                    )
                    const url = `${process.env.BASE_URL}users/${newUser._id}/verify/${tokenForVerifyEmail}`
                    await sendEmail(newUser.email, "Verify Email", `Добрий ранок, день чи вечір! \n\nДля підтвердження свого акаунту на форумі USOF, перейдіть, будь ласка, за посиланням \n\n\n${url}\n\n\n\n Ваш логін: ${login} \n Ваш пароль (змініть за нагоди): ${password}\n\n\nЗ повагою, адміністрація USOF-ynilova`)
                    console.log(32)
                    return res.json(newUser)
                }
        } catch (error) {
            return res.json({
                message: "Something went wrong in createNewUser."
            })
        }
    }

    // Email verify link sent by email
    async verifyLink(req, res) {
        try {
            let user = await User.findById(req.params.user_id)
            if (!user) {
                return res.json({
                    message: "Invalid link userId faild"
                })
            }
            const token = req.params.tokenVerifyEmail
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            user = await User.findById(decode.id)
            if (!user) {
                return res.json({
                    message: "Invalid link"
                })
            }
            await User.findByIdAndUpdate(req.params.user_id, { verified: true })

        } catch (error) {
            return res.json({
                message: "Something went wrong in verifyLink"
            })
        }
    }

    // Upload user avatar
    async setUserAvatar(req, res) {
        try {
            //Checking for admin role
            const curUser = await User.findById(req.userId)
            if (curUser.role === "admin" || req.params.user_id === req.userId) {
                const { picture } = req.body
                await User.findByIdAndUpdate(req.params.user_id, {
                    profile_picture: picture
                })
                res.json({
                    message: "Profile picture was updated."
                })
            } else {
                res.json({
                    message: "You have not access for this actions."
                })
            }
        } catch (error) {
            return res.json({
                message: "Something went wrong with uploading user avatar."
            })
        }
    }

    // Update user data
    async updateUserData(req, res) {
        try {
            //Checking for access or admin role
            const curUser = await User.findById(req.userId)
            const updatedUser = await User.findById(req.params.user_id)
            if (req.params.user_id === req.userId || curUser.role === "admin") {
                const { login, email, fullname, password, newPassword, confirmPassword, role } = req.body

                const loginCheck = await User.findOne({ login: login })
                if (!loginCheck) {
                    return res.json({
                        updatedUser: null,
                        message: "This login is used. Try another one."
                    })
                }

                let isPasswordCorrect
                if (curUser.role === 'admin' && curUser._id !== req.params.user_id) {
                    isPasswordCorrect = true
                } else {
                    isPasswordCorrect = await bcrypt.compare(password, updatedUser.password)
                }


                if (!isPasswordCorrect) {
                    return res.json({
                        message: 'Wrong password.'
                    })
                } else {

                    if (newPassword !== '') {
                        if (newPassword === confirmPassword) {
                            // Шифруем пароль
                            const salt = bcrypt.genSaltSync(10)
                            const hash = bcrypt.hashSync(newPassword, salt)

                            updatedUser.password = hash
                        } else {
                            return res.json({
                                message: "New password was not confirmed. Try again.",
                                updatedUser: null
                            })
                        }

                    }

                    if (req.files) {
                        let fileName = Date.now().toString() + req.files.image.name
                        const __dirname = dirname(fileURLToPath(import.meta.url))
                        req.files.image.mv(path.join(__dirname, '..', 'uploads', fileName))
                        updatedUser.profile_picture = fileName || ''
                    }

                    updatedUser.login = login
                    updatedUser.full_name = fullname
                    updatedUser.email = email
                    updatedUser.role = role

                    await updatedUser.save()
                }

                return res.json({
                    updatedUser: updatedUser,
                    message: null
                })
            } else {
                res.json({
                    message: "You have no access for this actions."
                })
            }
        } catch (error) {
            return res.json({
                message: error.message
                //"Something went wrong with updating user`s data"
            })
        }

    }

    // Delete user
    async deleteUser(req, res) {
        try {
            const curUser = await User.findById(req.userId)
            if (curUser.role === "admin" || curUser._id === req.params.user_id) {
                const user = await User.findByIdAndDelete(req.params.user_id)
                res.json({
                    user,
                    message: "User was successfully deleted."
                })
            } else {
                res.json({
                    message: "You have not access for this actions."
                })
            }
        } catch (error) {
            return res.json({
                message: "Something went wrong with deleting user"
            })
        }
    }
}