const express = require('express');

const path = require('path');
const cookieParser = require("cookie-parser");
const { connectToMongoDB } = require("./connect");

const {restrictToLoggedInUserOnly, checkAuth} = require('./middlewares/auth');
const URL = require("./models/url");

const staticRoutes = require('./routes/staticRouter');
const urlRoute = require("./routes/url");
const userRoutes = require("./routes/user");

const app = express();
const PORT = 8001;

connectToMongoDB('mongodb://localhost:27017/short-url')
    .then(() => console.log('mongodb connected'));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use("/url", restrictToLoggedInUserOnly, urlRoute);
app.use("/user", userRoutes);
app.use("/", checkAuth, staticRoutes);


app.get("/url/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId,
    },
        {
            $push: {
                visitHistory: {
                    timestamp: Date.now(),
                },
            },
        }
    );

    if (!entry) {
        return res.status(404).send("Short URL not found");
    }

    res.redirect(entry.redirectURL);
});

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`))