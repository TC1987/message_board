var express = require('express'),
    app = express(),
    body_parser = require('body-parser'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// ----- Mongoose -----
var PostSchema = new Schema({
    name: String,
    message: String,
    date: {type: Date, default: Date.now },
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
})

var Post = mongoose.model('Post', PostSchema);

var CommentSchema = new Schema({
    name: String,
    comment: String,
    date: {type: Date, default: Date.now },
    _post: {type: Schema.ObjectId, ref: 'Post'},
})

var Comment = mongoose.model('Comment', CommentSchema);

mongoose.connect('mongodb://localhost/facebook')
// ----- End Mongoose -----

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(body_parser.urlencoded({
    extended: true
}))

app.get('/', function(req, res) {
    Post.find({}).populate('comments').exec(function(err, posts) {
        res.render('index', {posts: posts});
    })
    // Post.find({}, function(err, posts) {
    //     if (err) {
    //         console.log('There was an error retrieving the posts from the DB.');
    //     } else {
    //         res.render('index', {posts: posts});
    //     }
    // })
})

app.post('/post', function(req, res) {
    var post = new Post({name: req.body.name, message: req.body.message})

    post.save(function(err) {
        if (err) {
            console.log("There was an error saving the post.");
        } else {
            console.log("Message has been successfully saved.");
            res.redirect('/');
        }
    })
})

// app.get('/post/:id', function(req, res) {
//     Post.findOne({_id: req.params.id}).populate('comments').exec(function(err, post) {
//         res.render('post', {post: post});
//     })
// })

app.post('/post/:id', function(req, res) {
    var comment = new Comment({name: req.body.name, comment: req.body.comment})

    Post.findOne({_id: req.params.id}, function(err, post) {
        comment._post = post._id;
        post.comments.push(comment);

        comment.save(function(err) {
            if (err) {
                console.log("There was an error saving the comment.");
            } else {
                post.save(function(err) {
                    if (err) {
                        console.log("There was an error updating the post.");
                    } else {
                        res.redirect('/');
                    }
                })
            }
        })

        console.log('WTF');
    })

})

app.listen(8000, function() {
    console.log('Listening on Port 8000');
})
