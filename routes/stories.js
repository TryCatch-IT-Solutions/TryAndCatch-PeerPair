const express = require("express");
const { Mongoose } = require("mongoose");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");

const Story = require("../models/Story");

// @desc        Show add page
// @route       GET /
router.get('/add', ensureAuth, (req, res) => {
    res.render("stories/add");
});

// @desc        Show all stories
// @route       GET /
router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean();
        
        res.render('stories/index', {
            stories
        });

    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
})

// @desc        Show specific story
// @route       GET /:story-id
router.get('/:storyId', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findById({ _id: req.params.storyId})
            .populate('user')
            .lean();

        if (!story) {
            return res.render("error/404");
        }
        
        res.render("stories/show", {
            story
        })
    } catch (err) {
        console.error(err);
        res.render("error/404");
    }
})

// @desc        Process add form
// @route       POST /
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id;
        await Story.create(req.body);

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

// @desc        Show edit page
// @route       GET /stories/add
router.get("/edit/:id", ensureAuth, async (req, res) => {
    const story = await Story.findOne({
        _id: req.params.id
    }).lean();

    if (!story) {
        return res.render("error/404");
    }

    if (story.user != req.user.id) {
        res.redirect("/stories");
    } else {
        res.render("stories/edit", {
            story
        });
    }
});

// @desc    Update Story
// @route   PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean();

        if (!story) {
            return res.render("error/404");
        }

        if (story.user != req.user.id) {
            res.redirect("/stories");
        } else {
            story = await Story.findOneAndUpdate(
                {
                    _id: req.params.id
                },
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

            res.redirect("/dashboard");

        }
    } catch (err) {
        console.error(err);
        return res.render("error/500");
    }
})

// @desc        DELETE Story
// @route       DELETE /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Story.remove({
            _id: req.params.id
        });

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        return res.render("error/500");
    }
});

// @desc    Show user stories
// @route   GET /user/:id
router.get("/user/:id", async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.params.id,
            status: 'public'
        })
        .populate('user')
        .lean();

        res.render("stories/index", {
            stories
        });
    } catch (err) {
        console.error(err);
        res.render("error/500");
    }
});


module.exports = router;