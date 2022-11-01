import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
    {
        login: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        full_name: {
            type: String,
        },
        email: {
            type: String,
        },
        profile_picture: {
            type: String,
        },
        rating: {
            type: Number,
            default: 0
        },
        role: {
            type: String,
            required: true,
        },
        verified: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
)

export default mongoose.model('User', UserSchema)
