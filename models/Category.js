import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    }
})

export default mongoose.model('Category', categorySchema)
