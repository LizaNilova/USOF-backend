import Post from '../models/Post.js'
import User from '../models/User.js'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import Like from '../models/Like.js'
import Comment from '../models/Comment.js'
import Category from '../models/Category.js'
import jwt from 'jsonwebtoken'


export class PostController {
    // Create post
    async createPost(req, res) {
        try {
            const { title, content, categories } = req.body
            const user = await User.findById(req.userId)

            if (req.files) {
                let fileName = Date.now().toString() + req.files.image.name
                const __dirname = dirname(fileURLToPath(import.meta.url))
                req.files.image.mv(path.join(__dirname, '..', 'uploads', fileName))

                const newPostWithImage = new Post({
                    authors_name: user.login,
                    title,
                    content,
                    categories: categories,
                    imagesUrl: fileName,
                    author: req.userId,

                })

                await newPostWithImage.save()
                return res.json(newPostWithImage)
            }

            const newPostWithoutImage = new Post({
                authors_name: user.login,
                title,
                content,
                categories: categories,
                author: req.userId
            })
            await newPostWithoutImage.save()
            res.json(newPostWithoutImage)
        } catch (error) {
            res.json({
                message: "Something went wrong."
            })
        }
    }

    // Get All posts
    async getAllPosts(req, res) {
        try {
            const posts = await Post.find().sort('-createdAt')
            if (!posts) {
                return res.json({
                    message: "No posts."
                })
            }
            // const countPages = posts.length / 15
            // const postsByPages = []
            // for (let i = 0; i < countPages; i++) {
            //     postsByPages[i] = []
            //     for (let j = 0; j < 15; j++) {
            //         postsByPages[i][j] = posts[j + i * 15]
            //     }
            // }
            res.json({ posts })
        } catch (error) {
            res.json({
                message: "Something went wrong."
            })
        }
    }

    //Get post by ID
    async getPostById(req, res) {
        try {
            const temp = await Post.findById(req.params.id)

            const token = req.headers.authorization.split(' ')[1];

            if (token !== 'null') {

                const decode = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decode.id
                if (temp.author.toString() === userId.toString()) {
                    return res.json(temp)
                } else {
                    const post = await Post.findOneAndUpdate({ _id: req.params.id }, {
                        $inc: { views: 1 },
                    })
                    return res.json(post)
                }
            } else {
                const post = await Post.findOneAndUpdate({ _id: req.params.id }, {
                    $inc: { views: 1 },
                })
                return res.json(post)
            }

        } catch (error) {
            res.json({
                message: "Something went wrong."
            })
        }
    }

    // Get only current user`s posts
    async getMyPosts(req, res) {
        try {
            const posts = await Post.find({ author: req.userId })
            res.json({ posts })
        } catch (error) {
            res.json({
                message: "Something went wrong."
            })
        }
    }

    async getPostsByUserId(req, res) {
        try {
            const posts = await Post.find({ author: req.params.id_user })
            res.json({ posts })
        } catch (error) {
            res.json({
                message: "Something went wrong."
            })
        }
    }

    // Delete a post
    async deletePost(req, res) {
        try {
            const post = await Post.findByIdAndDelete(req.params.post_id)
            if (!post) {
                return res.json({
                    message: "Post is not exist."
                })
            }
            await Like.deleteMany({
                post_or_comment: 'post',
                parent_id: req.params.post_id
            })
            await Comment.deleteMany({
                _id: post.comments
            })
            await Like.deleteMany({
                post_or_comment: 'comment',
                parent_id: post.comments
            })
            res.json({
                message: "Post was deleted."
            })
        } catch (error) {
            res.json({
                message: "Something went wrong."
            })
        }
    }

    //Get likes under post
    async getLikesUnderPost(req, res) {
        try {
            const likes = await Like.find({
                parent_id: req.params.post_id,
                post_or_comment: 'post'
            })
            res.json(likes)
        } catch (error) {
            return res.json("Something went wrong.")
        }
    }

    async getOnlyLikes(req, res) {
        try {
            const likes = await Like.find({
                parent_id: req.params.post_id,
                post_or_comment: 'post',
                type: 'like'
            })
            res.json(likes)
        } catch (error) {
            return res.json({
                message: "Something went wrong. "
            })
        }
    }

    async getOnlyDislikes(req, res) {
        try {
            const dislikes = await Like.find({
                parent_id: req.params.post_id,
                post_or_comment: 'post',
                type: 'dislike'
            })
            res.json(dislikes)
        } catch (error) {
            return res.json({
                message: "Something went wrong. "
            })
        }
    }

    // Create like under post
    async createLikeUnderPost(req, res) {
        try {
            const { type, postId } = req.body
            const exsistedLike = await Like.findOne({
                author: req.userId,
                post_or_comment: 'post',
                parent_id: postId
            })

            if (exsistedLike) {
                if (exsistedLike.type === type) {
                    await Like.deleteOne(exsistedLike)

                    const post = await Post.findById(postId)
                    if (type === 'like') {
                        const user = await User.findByIdAndUpdate(post.author, {
                            $inc: { rating: -1 },
                        })
                    } else {
                        const user = await User.findByIdAndUpdate(post.author, {
                            $inc: { rating: 1 },
                        })
                    }

                    return res.json({
                        message: `${type} exists. `
                    })
                } else {
                    const post = await Post.findById(postId)
                    if (type === 'like') {
                        const user = await User.findByIdAndUpdate(post.author, {
                            $inc: { rating: 1 },
                        })
                    } else {
                        const user = await User.findByIdAndUpdate(post.author, {
                            $inc: { rating: -1 },
                        })
                    }
                    await Like.deleteOne(exsistedLike)
                }
            }
            const newLike = new Like({
                author: req.userId,
                post_or_comment: 'post',
                parent_id: postId,
                type
            })
            const post = await Post.findById(postId)
            if (type === 'like') {
                const user = await User.findByIdAndUpdate(post.author, {
                    $inc: { rating: 1 },
                })
            } else {
                const user = await User.findByIdAndUpdate(post.author, {
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

    async getLike(req, res) {
        try {
            const { postID } = req.body
            const { data } = await Like.findOne({ parent_id: postID, author: req.userId })
            return data
        } catch (error) {
            return res.json({
                message: "Something went wrong. "
            })
        }
    }

    // Delete like under post
    async deleteLikeUnderPost(req, res) {
        try {
            const { type } = req.body
            await Like.deleteOne({
                author: req.userId,
                parent_id: req.params.post_id,
                post_or_comment: 'post',
                type
            })
            res.json({
                message: "Like deleted."
            })
        } catch (error) {
            return res.json({
                message: "Something went wrong."
            })
        }
    }

    // Create new comment
    async createNewComment(req, res) {
        try {
            const { postId, comment } = req.body
            if (!comment) {
                return res.json({
                    message: "Comment can`t be empty."
                })
            }

            const user = await User.findById(req.userId)

            const newComment = new Comment({
                author: req.userId,
                author_name: user.login,
                content: comment
            })
            await newComment.save()
            try {
                await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } })
            } catch (error) {
                console.log(error)
            }

            res.json(newComment)
        } catch (error) {
            return res.json({
                message: "Something went wrong."
            })
        }
    }

    // Update post data
    async updatePost(req, res) {
        try {
            const { title, content, categories, id, status } = req.body
            const post = await Post.findById(id)

            if (req.userId != post.author) {
                res.json({
                    message: "You are not an author of this post."
                })
            } else {
                if (req.files) {
                    let fileName = Date.now().toString() + req.files.image.name
                    const __dirname = dirname(fileURLToPath(import.meta.url))
                    req.files.image.mv(path.join(__dirname, '..', 'uploads', fileName))
                    post.imagesUrl = fileName || ''
                }
                post.title = title
                post.content = content
                post.categories = categories
                post.modified_date = Date.now()
                post.status = status

                await post.save()

                res.json(post)
            }

        } catch (error) {
            return res.json({
                message: "Something went wrong."
            })
        }
    }

    // Get all comments under post
    async getAllComments(req, res) {
        try {
            const post = await Post.findById(req.params.post_id)
            const temp = post.comments
            const comments = await Comment.find({ _id: temp })
            res.json(comments)
        } catch (error) {
            return res.json({
                message: "Something went wrong."
            })
        }
    }

    // Get all categories of post
    async getAllCategoriesOfPost(req, res) {
        try {
            const post = await Post.findById(req.params.post_id)
            const categories = await Category.find({ _id: post.categories })
            res.json({
                categories: categories
            })
        } catch (error) {
            return res.json({
                message: "Something went wrong."
            })
        }
    }

    async getPostsByFilters(req, res){
        try {
            const categories = req.params.filters.split('+')

            console.log(categories)
            const posts = await Post.find( { categories: { $nin: categories }}).sort('-createdAt')
            return res.json({posts})
        } catch (error) {
            return res.json({
                message: error
            })
        }
    }
}
