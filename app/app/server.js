
const express = require("express");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// MongoDB configuration
 //const mongoUrlLocal = "mongodb://admin:password@localhost:27017";

// If Node is running inside Docker, use this instead:
const mongoUrlLocal = "mongodb://admin:password@mongodb";

const databaseName = "user-accounts";


// Serve frontend
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});


// Serve profile picture
app.get("/profile-picture", function (req, res) {
    const imagePath = path.join(
        __dirname,
        "images",
        "profile-1.jpg"
    );

    if (!fs.existsSync(imagePath)) {
        return res.status(404).send("Profile picture not found");
    }

    res.sendFile(imagePath);
});


// GET PROFILE
app.get("/get-profile", async function (req, res) {
    let client;

    try {

        client = new MongoClient(mongoUrlLocal);

        await client.connect();



        const db = client.db(databaseName);

        const user = await db
            .collection("users")
            .findOne({ userid: 1 });

        console.log("User found:", user);

        if (!user) {
            return res.json({
                userid: 1,
                name: "Anna Smith",
                email: "anna.smith@example.com",
                interests: "coding"
            });
        }

        res.json(user);

    } catch (error) {

        console.error("GET /get-profile error:");
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch profile",
            message: error.message
        });

    } finally {

        if (client) {
            await client.close();
        }
    }
});


// UPDATE PROFILE
app.post("/update-profile", async function (req, res) {
    let client;

    try {


        const {
            name,
            email,
            interests
        } = req.body;


        // Basic validation
        if (!name || !email || !interests) {
            return res.status(400).json({
                error: "Name, email and interests are required"
            });
        }


        const userObj = {
            userid: 1,
            name: name,
            email: email,
            interests: interests
        };


        client = new MongoClient(mongoUrlLocal);

        await client.connect();

   


        const db = client.db(databaseName);

        await db.collection("users").updateOne(
            { userid: 1 },
            {
                $set: {
                    name: name,
                    email: email,
                    interests: interests
                }
            },
            {
                upsert: true
            }
        );


        console.log("Profile updated successfully");


        res.json(userObj);

    } catch (error) {

        console.error("POST /update-profile error:");
        console.error(error);

        res.status(500).json({
            error: "Failed to update profile",
            message: error.message
        });

    } finally {

        if (client) {
            await client.close();
        }
    }
});


// Start server
app.listen(PORT, function () {
    console.log(`Server running at http://localhost:${PORT}`);
});

