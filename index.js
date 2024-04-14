const express = require('express');
const bodyParser = require('body-parser');

const app = express(); // Create an instance of Express

const port = 3000;

// Middleware to parse JSON and URL-encoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle POST requests to /signup endpoint
app.post('/signup', (req, res) => {
    // Extract form data from the request body
    const { fullname, email, username, password } = req.body;

    // Your sign-up logic here
    if (!fullname || !email || !username || !password) {
        // If any required field is missing, send a 400 Bad Request response
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Construct the URL of the email verification page
    const verificationPageURL = 'emailverification.html'; // Change this to the actual URL of your email verification page

    // Send the URL of the email verification page in the response
    res.status(200).json({ verificationPageURL });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
