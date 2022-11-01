import { Router } from "express"
import { checkAuth } from "../utils/checkAuth.js"
import { CommentsController } from "../controllers/comments.js"
const commentsController = new CommentsController()

const router = new Router()

// Get comment by id
router.get('/:comment_id', commentsController.getCommentById)

// Get all likes under a comment
router.get('/:comment_id/likes', commentsController.getLikesUnderComment)

// Create a new like under comment
router.post('/:comment_id/like', checkAuth, commentsController.createLikeUnderComment)

// Update comment data
router.patch('/:comment_id', checkAuth, commentsController.updateCommentData)

// Delete a comment
router.delete('/:comment_id', checkAuth, commentsController.deleteComment)

//Delete like under a comment
router.delete('/:comment_id/like', checkAuth, commentsController.deleteLikeUnderComment)

export default router
