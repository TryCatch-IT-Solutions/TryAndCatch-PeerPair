const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const methodOverride = require("method-override");
const exphbs = require("express-handlebars");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const connectDB = require("./config/db");

// Load config
dotenv.config({ path: './config/config.env' });

require("./config/passport")(passport);
connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method Override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}

const {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select
} = require("./helpers/hbs");

// Handlebars
app.engine(".hbs", exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        formatDate,
        stripTags,
        truncate,
        editIcon,
        select
    }
}));
app.set("view engine", ".hbs");

app.use(session({
    secret: "TYmrCMRTQ1",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global var 
app.use(function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));


const PORT = process.env.PORT || 5000;


app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);