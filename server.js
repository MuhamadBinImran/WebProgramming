const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route to send reset code to the entered email
app.post('/send_reset_code', (req, res) => {
    const email = req.body.email;

    // Generate a random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000);

    // Configure nodemailer to send emails
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '****************',
            pass: '**********'
        }
    });

    // Email options
    const mailOptions = {
        from: '***************',
        to: email,
        subject: 'Password Reset Code',
        text: `Your password reset code is: ${resetCode}`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Failed to send reset code');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Reset code sent successfully');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
