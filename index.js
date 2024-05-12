const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const exphbs = require("hbs"); // Require Handlebars
const nodemailer = require("nodemailer");
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mydb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error', () => console.log("Error in Connecting to Database"));
db.once('open', () => console.log("Connected to Database"))

// Function to generate a random reset code
function generateResetCode() {
    // Generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000);
}

// Set Handlebars as the view engine
app.set('view engine', 'html');

app.post("/sign_up", (req, res) => {
    var fullname = req.body.fullname;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;

    var data = {
        "fullname": fullname,
        "email" : email,
        "username": username,
        "password" : password
    }

    db.collection('users').insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record Inserted Successfully");
    });

    return res.redirect('signup_success.html')
});



app.post('/login', async (req, res) => {
    try {
        const user = await db.collection('users').findOne({ username: req.body.username });
        
        if (!user) {
            // User not found
            return res.status(401).send("User not found");
        }

        // Compare the provided password with the password from the database
        const passwordMatch = user.password === req.body.password;

        if (passwordMatch) {
            // Passwords match, redirect to home page or send success response
            return res.redirect('landingpage.html'); // Assuming landing page URL is "/landingpage"
        } else {
            // Passwords don't match
            return res.status(401).send("Incorrect password");
        }
    } catch (error) {
        // Handle any errors
        console.error("Error:", error);
        return res.status(500).send("Internal server error");
    }
});


// Endpoint for verifying reset code and updating password
app.post("/reset_password", async (req, res) => {
    try {
        const { username, code, new_password } = req.body;
        const user = await db.collection('users').findOne({ username });

        if (!user) {
            // User not found
            return res.status(401).send("User not found");
        }

        // Check if the reset code matches
        if (code !== user.resetCode) {
            // Incorrect reset code
            return res.status(401).send("Incorrect reset code");
        }

        // Update user's password in the database
        await db.collection('users').updateOne({ username }, { $set: { password: new_password } });

        return res.status(200).send("Password updated successfully");
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send("Internal server error");
    }
});

app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('landingpage.html');
});

app.listen(3000, () => {
    console.log('Listening on PORT 3000');
});
// Define a route handler to serve the reset_password.html file
app.get("/reset_password.html", (req, res) => {
    res.sendFile(__dirname + "/reset_password.html"); // Assuming reset_password.html is in the root directory
});

app.post("/send_reset_code", async (req, res) => {
    try {
        const { username } = req.body;
        const user = await db.collection('users').findOne({ username });

        if (!user) {
            // User not found
            return res.status(401).send("User not found");
        }

        // Generate a new reset code for the user
        const resetCode = generateResetCode();

        // Update user's reset code in the database
        await db.collection('users').updateOne({ username }, { $set: { resetCode } });

        // Send the reset code to the user's email
        // Set up Nodemailer transporter
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'muhammadbinimran1000@gmail.com',
                pass: 'kpcm ivmp mluh xazd'
            }
        });

        // Define email options
        let mailOptions = {
            from: 'muhammadbinimran1000@gmail.com',
            to: user.email,
            subject: 'Password Reset Code',
            text: `Your password reset code is: ${resetCode}`
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error:", error);
                return res.status(500).send("Failed to send reset code");
            }
            console.log('Reset code sent:', info.response);
            return res.redirect('reset_password.html');
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send("Internal server error");
    }
});
