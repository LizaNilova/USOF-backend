import User from '../models/User.js'
import Like from '../models/Like.js'
import Comment from '../models/Comment.js'

export class CommentsController {
    // Get comment by id
    async getCommentById(req, res) {
        try {
            const comment = await Comment.findById(req.params.comment_id)
            res.json(comment)
        } catch (error) {
            return res.json({
                message: "Something went wrong."
            })
        }
    }

    // Get all likes under the comment
    async getLikesUnderComment(req, res) {
        try {
            const likes = await Like.find({
                parent_id: req.params.id,
                post_or_comment: 'comment'
            })
            res.json(likes)
        } catch (error) {
            return res.json("Something went wrong.")
        }
    }

    // Create a new like under the comment
    async createLikeUnderComment(req, res) {
        try {
            const { type, commentId } = req.body
            const exsistedLike = await Like.findOne({
                author: req.userId,
                post_or_comment: 'comment',
                parent_id: commentId
            })

            if (exsistedLike) {
                if (exsistedLike.type === type) {
                    await Like.deleteOne(exsistedLike)

                    const comment = await Comment.findById(commentId)
                    if (type === 'like') {
                        const user = await User.findByIdAndUpdate(comment.author, {
                            $inc: { rating: -1 },
                        })
                    } else {
                        const user = await User.findByIdAndUpdate(comment.author, {
                            $inc: { rating: 1 },
                        })
                    }

                    return res.json({
                        message: `${type} exists. `
                    })
                } else {
                    const comment = await Comment.findById(commentId)
                    if (type === 'like') {
                        const user = await User.findByIdAndUpdate(comment.author, {
                            $inc: { rating: 1 },
                        })
                    } else {
                        const user = await User.findByIdAndUpdate(comment.author, {
                            $inc: { rating: -1 },
                        })
                    }
                    await Like.deleteOne(exsistedLike)
                }
            }
            const newLike = new Like({
                author: req.userId,
                post_or_comment: 'comment',
                parent_id: commentId,
                type
            })
            const comment = await Comment.findById(commentId)
            if (type === 'like') {
                const user = await User.findByIdAndUpdate(comment.author, {
                    $inc: { rating: 1 },
                })
            } else {
                const user = await User.findByIdAndUpdate(comment.author, {
                    $inc: { rating: -1 },
                })
            }

            await newLike.save()
            res.json(newLike)
        } catch (error) {
            return res.json({
                message: "Something went wrong.",
                error: error.toString()
            })
        }
    }

    // Update comment data
    async updateCommentData(req, res) {
        try {
            const { content } = req.body
            await Comment.findByIdAndUpdate(req.params.comment_id, { content })
            res.json({
                message: "Comment was updated."
            })
        } catch (error) {
            return res.json({
                message: "Something went wrong."
            })
        }
    }

    // Delete a comment
    async deleteComment(req, res) {
        try {
            const comment = await Comment.findByIdAndDelete(req.params.comment_id)
            if (!comment) {
                return res.json({
                    message: "Comment is not exist."
                })
            }
            await Like.deleteMany({
                post_or_comment: 'comment',
                parent_id: req.params.comment_id
            })
            res.json({
                message: "Comment was deleted."
            })
        } catch (error) {
            res.json({
                message: "Something went wrong."
            })
        }
    }

    //Delete like under a comment
    async deleteLikeUnderComment(req, res) {
        try {
            const { type } = req.body
            const like = await Like.findOneAndDelete({
                author: req.userId,
                parent_id: req.params.post_id,
                post_or_comment: 'comment',
                type
            })
            res.json({
                message: "Like deleted."
            })
        } catch (error) {
            return res.json({
                message: "Something went wrong"
            })
        }
    }

    async getLike(req, res) {
        try {
            const { commentID } = req.body
            const { data } = await Like.findOne({ parent_id: commentID, author: req.userId })
            return data
        } catch (error) {
            return res.json({
                message: "Something went wrong. "
            })
        }
    }
}
