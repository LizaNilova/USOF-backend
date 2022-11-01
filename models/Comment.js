import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    author_name: {
        type: String
    },
    content: {
        type: String,
        required: true,
    }
},
    { timestamps: true })

export default mongoose.model('Comment', CommentSchema)
