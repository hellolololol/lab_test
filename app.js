const express = require('express');
const bodyParser = require('body-parser');
const xss = require('xss');
const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Function to validate and sanitize inputs
const validateInput = (input) => {
    const xssPattern = /<script.*?>.*?<\/script.*?>/i;
    const sqlPattern = /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b)/i;

    const sanitizedInput = xss(input);

    if (xssPattern.test(input)) {
        return { status: 'XSS', sanitizedInput: '' };
    }
    if (sqlPattern.test(input)) {
        return { status: 'SQL', sanitizedInput: '' };
    }
    return { status: 'Valid', sanitizedInput };
};

// Routes
app.get('/', (req, res) => {
    res.send(`
        <h1>Home Page</h1>
        <form action="/search" method="post">
            <input type="text" name="searchTerm" required>
            <button type="submit">Submit</button>
        </form>
    `);
});

app.post('/search', (req, res) => {
    const searchTerm = req.body.searchTerm;
    const { status, sanitizedInput } = validateInput(searchTerm);

    if (status === 'XSS' || status === 'SQL') {
        res.send(`
            <p>Input is validated to be ${status} attack. Please enter a valid input.</p>
            <a href="/">Return to Home</a>
            <script>
                setTimeout(() => {
                    window.location.href = "/";
                }, 3000);
            </script>
        `);
    } else {
        res.send(`
            <h1>Search Results</h1>
            <p>You searched for: ${sanitizedInput}</p>
            <a href="/">Return to Home</a>
        `);
    }
});

app.listen(port, () => {
    console.log(`Web app running at http://localhost:${port}`);
});
