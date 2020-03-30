const express = require("express");
const app = express();
const db = require("./db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");
const conf = require("./config");
const moment = require("moment");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(express.json());

app.use(express.static("public"));

app.get("/images", (req, res) => {
    db.getImages()
        .then(result => {
            res.json(result.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/images/:id", (req, res) => {
    console.log("Lowest ID: ", req.params.id);
    db.getMoreImages(req.params.id)
        .then(result => {
            console.log("More images from database: ", result.rows);
            res.json(result.rows);
        })
        .catch(err => {
            console.log("Error getting more images from database: ", err);
            res.sendStatus(500);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("file: ", req.file);
    console.log("body: ", req.body);
    // insert a row in the images table for the new image
    let imageUrl = conf.s3Url + req.file.filename;
    db.addImage(
        imageUrl,
        req.body.username,
        req.body.title,
        req.body.description
    )
        .then(image => {
            console.log("image after insert into db: ", image);
            res.json(image);
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
});

app.get("/image/:id", (req, res) => {
    console.log("id: ", req.params.id);
    db.getImageById(req.params.id)
        .then(result => {
            console.log("Image from db: ", result.rows);
            result.rows[0].created_at = moment(
                result.rows[0].created_at
            ).format("D/M/YYYY H:mm");
            res.json(result.rows);
        })
        .catch(err => {
            console.log("Error fetching image: ", err);
            res.sendStatus(500);
        });
});

app.post("/comment", (req, res) => {
    console.log("Post comment req.body: ", req.body);
    db.addComment(req.body.comment, req.body.username, req.body.imageId)
        .then(result => {
            console.log("Comment added to database: ", result);
            res.json(result.rows);
        })
        .catch(err => {
            console.log("Error adding comment to database: ", err);
            res.sendStatus(500);
        });
});

app.get("/comments/:imageId", (req, res) => {
    db.getCommentsByImageId(req.params.imageId)
        .then(result => {
            for (let i = 0; i < result.rows.length; i++) {
                result.rows[i].created_at = moment(
                    result.rows[i].created_at
                ).format("D/M/YYYY H:mm");
            }
            console.log("comments from db: ", result.rows);
            res.json(result.rows);
        })
        .catch(err => {
            console.log("Error fetching comments: ", err);
            res.sendStatus(500);
        });
});

app.listen(process.env.PORT || 8080, () =>
    console.log("IB server listening...")
);
