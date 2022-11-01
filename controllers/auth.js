import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendEmail } from '../utils/sendMailer.js'

export class LoginController {
    // Register user
    async register(req, res) {
        try {
            const { login, password, passwordConfirmation, email } = req.body

            const isUsed = await User.findOne({ login })

            if (isUsed) {
                return res.json({
                    message: 'This login is used.'
                })
            }
            if (password !== passwordConfirmation) {
                return res.json({
                    message: "Password confirmation was faild. Try again."
                })
            }
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(password, salt)

            const newUser = new User({
                login,
                password: hash,
                email: email,
                role: "user",
                profile_picture: 'userAvatar.png'
            })

            await newUser.save()

            // send verification to email
            const tokenForVerifyEmail = jwt.sign({
                id: newUser._id,
            },
                process.env.JWT_SECRET,
                { expiresIn: '1h' },
            )
            const url = `${process.env.BASE_URL}users/${newUser._id}/verify/${tokenForVerifyEmail}`
            await sendEmail(newUser.email, "Verify Email", `Добрий ранок, день чи вечір! \nДля підтвердження свого акаунту на форумі USOF, перейдіть, будь ласка, за посиланням ${url}`)

            res.json({
                newUser,
                message: 'Successfully registrated.',
            })
        } catch (error) {
            res.json({ message: 'Error registration' })
        }
    }

    // Log in user
    async login(req, res) {
        try {
            const { email, login, password } = req.body
            let user
            if (!email) {
                user = await User.findOne({ login })
                if (!user) {
                    return res.json({
                        message: "User does not exist."
                    })
                }
                if (!user.verified) {
                    // send verification to email
                    const tokenForVerifyEmail = jwt.sign({
                        id: user._id,
                    },
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' },
                    )
                    const url = `${process.env.BASE_URL}users/${user._id}/verify/${tokenForVerifyEmail}`
                    await sendEmail(user.email, "Verify Email", `Добрий ранок, день чи вечір! \nДля підтвердження свого акаунту на форумі USOF, перейдіть, будь ласка, за посиланням ${url}`)
                }
            } else {
                user = await User.findOne({ email })
                if (!user) {
                    return res.json({
                        message: "User does not exist."
                    })
                }
                if (!user.verified) {
                    // send verification to email
                    const tokenForVerifyEmail = jwt.sign({
                        id: user._id,
                    },
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' },
                    )
                    const url = `${process.env.BASE_URL}users/${user._id}/verify/${tokenForVerifyEmail}`
                    await sendEmail(user.email, "Verify Email", `Добрий ранок, день чи вечір! \nДля підтвердження свого акаунту на форумі USOF, перейдіть, будь ласка, за посиланням ${url}`)
                }
            }
            if (user.verified) {
                const isPasswordCorrect = await bcrypt.compare(password, user.password)

                if (!isPasswordCorrect) {
                    return res.json({
                        message: 'Wrong password.'
                    })
                }

                const token = jwt.sign({
                    id: user._id,
                },
                    process.env.JWT_SECRET,
                    { expiresIn: '1d' },
                )

                res.json({
                    token,
                    user,
                    message: 'You was successfully authorized.',
                })
            } else {
                res.json({
                    message: 'Please, verify your email before signing in.',
                })
            }
        } catch (error) {
            res.json({ message: 'Error authorization' })
        }
    }

    // Log out user
    //works :)
    async logout(req, res) {
        try {
            res.json({
                messege: "Successfully loged out."
            })
        } catch (error) {
            return res.json({
                message: "Something went wrong."
            })
        }
    }

    // Reset password
    async resetPassword(req, res) {
        try {

        } catch (error) {

        }
    }

    // Confirm reseting password
    async confirmResetPassword(req, res) {
        try {

        } catch (error) {

        }
    }

    // Getting information about user by himself
    async getMe(req, res) {
        try {
            const user = await User.findById(req.userId)
            if (!user) {
                return res.json({
                    message: "User does not exist."
                })
            }

            const token = jwt.sign({
                id: user._id,
            },
                process.env.JWT_SECRET,
                { expiresIn: '7d' },
            )

            res.json({
                user,
                token,
            })

        } catch (error) {
            res.json({ message: 'No access.' })
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });


            if (!user)
                return res.json({ message: "This email is not registered in our system" });

            const v_token = jwt.sign(
                {
                    id: user._id,
                },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );



            // здесь ссылка на страницу с полями, в по нажатию на эту кнопку уже вот эта ссылка
            const url = `http://localhost:3000/recover/${v_token}`;

            await sendEmail(user.email, 
                "Reset password", 
                `Добрий ранок, день чи вечір! \nДля скидання паролю від свого аккаунту на форумі USOF, перейдіть, будь ласка, за посиланням ${url}`
                )
            return res.json({ message: "Re-send the password, please check your email" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async reset(req, res) {
        const { new_password, confirm_password } = req.body;

        if (!new_password || !confirm_password)
            return res
                .status(StatusCodes.NO_CONTENT)
                .json({ message: "Content can not be empty" });

        const token = req.params.token;
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decode.id);
        if (!user)
            return res.json({ success: false, message: "Sorry, user not found!" });

        if (new_password != confirm_password)
            return res.json({ message: "Passwords are different" });

        const isPasswordCorrect = await bcrypt.compare(new_password, user.password);
        if (isPasswordCorrect)
            return res.json({
                message: "Your new password has to be different from your old",
            });

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(new_password, salt);

        user.password = hash;
        await user.save();
        res.json({ success: true, message: "Your password was changed" });
    }
}
