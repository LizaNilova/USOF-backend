import mongoose from "mongoose"

const likeSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    post_or_comment: {
        type: String,
        required: true
    },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        required: true
    }
},
    { timestamps: true })

export default mongoose.model('Like', likeSchema)
