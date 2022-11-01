import { Router } from "express"
import { PostController } from "../controllers/post.js"
import { checkAuth } from "../utils/checkAuth.js"
const postController = new PostController()
const router = new Router()

// Get all posts.This endpoint doesn't require any role, it ispublic. If there are too many posts, 
//      you must implement pagination. Page size is up to you
// works, need to add a pagination
router.get('/', postController.getAllPosts)

// Get specified post data. Endpoint is public
// works
router.get('/:id', postController.getPostById)

// Get all comments for the specified post. Endpoint is public
// works
router.get('/:post_id/comment', postController.getAllComments)

// Create a new comment, required parameteris [content]
// works
router.post('/:post_id/comment', checkAuth, postController.createNewComment)

// Get all categories associated with thespecified post
// works
router.get('/:post_id/categories', postController.getAllCategoriesOfPost)

// Get all likes under the specified post
// works
router.get('/:post_id/like', postController.getLikesUnderPost)

// Get only likes under the specified post
// works
router.get('/:post_id/likes', postController.getOnlyLikes)

// Get only dislikes under the specified post
// works
router.get('/:post_id/dislikes', postController.getOnlyDislikes)

// Create a new post, required parameters are [title, content,categories]
// works
router.post('/', checkAuth, postController.createPost)

// Create a new like under a post
// works
router.post('/:post_id/like', checkAuth, postController.createLikeUnderPost)


router.get('/:post_id/like', checkAuth, postController.getLike)

// Update the specified post (its title, body orcategory). It's accessible only for the creator of the post
// works, test with a user, who is not a creator of post
router.patch('/:post_id', checkAuth, postController.updatePost)

// Delete a post
// works, but need to delete all likes and comments under deleted post
router.delete('/:post_id', checkAuth, postController.deletePost)

// Delete a like under a post
// works, but need to test it again when fixed deleting the post
router.delete('/:post_id/like', checkAuth, postController.deleteLikeUnderPost)

//Get only current user`s posts
// works
router.get('/:user/my_posts', checkAuth, postController.getMyPosts)

router.get('/users/:id_user', postController.getPostsByUserId)

router.get('/filters/:filters', postController.getPostsByFilters)

export default router