import mongoose from 'mongoose'

const PostSchema = new mongoose.Schema({
    authors_name:{
        type: String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'active'
    },
    content: {
        type: String,
        required: true,
    },
    imagesUrl: {
        type: String,
        default: '',
    },
    views: {
        type: Number,
        default: 0,
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    modified_date: {
        type: Number,
    }
},
    { timestamps: true },
)
export default mongoose.model('Post', PostSchema)
