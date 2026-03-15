const express = require('express');
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');
const app = express();
const basicAuth = require('express-basic-auth')

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
const path = require('path');
app.set('views', path.join(__dirname, '..', 'fronted', 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '..', 'fronted')));

const db = mysql.createConnection({
    host: 'db',
    user: 'root',
    password: '',
    database: 'my_shop'
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'fronted', 'project1.html'));
});

app.get('/cart', (req, res) => {
    let cart = req.cookies.cart;

    if (!cart || cart.trim() === "") {
        return res.render('cart', {products: [], orders: [], feedback: [], total: 0});
    }
    const allIds = cart.split(',').filter(id => id).map(id => parseInt(id));
    const counts = {};
    allIds.forEach(id => {counts[id] = (counts[id] || 0) + 1;});
    const uniqueIds = Object.keys(counts);

    const ids = cart.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    db.query('SELECT * FROM products WHERE id IN (?)', [ids], (err, result) => {
        if(err) {
            console.error(err);
            return res.status(500).send("Ошибка БД");
        }
        let total = 0;
        const productsWithQty = result.map(item => {
            const quantity = counts[item.id];
            const itemTotal = item.price * quantity;
            total += itemTotal;
            return {...item, quantity: quantity};
        });
        res.render('cart', {
            products: productsWithQty,
            total: total,
            orders: [],
            feedback: []
        });
    });
});

app.listen(3000, () => console.log('Сервер запущен: http://localhost:3000'))

db.query(`
    CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY,
        name VARCHAR(255),
        price INT
    )
`, (err) => {
    if (err) throw err;
    console.log("Таблица проверена/создана");
    
    //Добавление товаров
    db.query("INSERT IGNORE INTO products (id, name, price) VALUES (101, 'Порошковый OP-4', 999), (102, 'Углекислотный ОУ-2', 1299), (103, 'Воздушный ОВП-8', 899), (201, 'Стандарт-100', 5999), (202, 'Классик ГР-65П', 1999), (203, 'Премиум 1.6МПа', 2999), (301, 'Магнитный ИП-212',799), (302, 'Точечный IPD-3.1', 2799), (303, 'Линейный 6500R', 3999)");
});
    //Отправление данных из корзины, таблица orders]
db.query(`
    CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(50),
    cart_content TEXT,
    total_price INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if(err) throw err;
    console.log('Таблица заказов создана');
});

app.post('/checkout', (req, res) => {
    const phone = req.body.phone;
    const cart = req.cookies.cart;

    if(!cart||!phone) {
        return res.send("Ошибка: коризна пуста или телефон не указан");
    }
    const allIds = cart.split(',').filter(id => id).map(id => parseInt(id));

    db.query('SELECT price FROM products WHERE id IN(?)', [allIds], (err, result) => {
        if (err) return res.status(500).send("Ошибка БД");
        const total = result.reduce((sum, item) => sum+item.price,0);

        const sql = "INSERT INTO orders (phone, cart_content, total_price) VALUES (?, ?, ?)";
        db.query(sql, [phone, cart, total], (err) => {
            if (err) {
                console.error(err)
                return res.status(500).send("Ошибка при сохранении заказа")
            }

            res.clearCookie('cart')
            res.send("success");
        });
    });
});

//Login in admin
app.get('/admin', basicAuth ({
    users: {'admin': 'admin'},
    challenge: true
}), (err,req,res,next) => {
    res.status(401).send('Доступ запрещен!');
}, (req,res) => {
    db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, ordersResult) => {
        if(err) return res.status(500).send("Ошибка");
        db.query('SELECT * FROM feedback ORDER BY created_at DESC', (err, feedbackResult) => {
            if (err) return res.status(500).send("Ошибка при получении фидбека");
            res.render('admin', {
                products: [],
                orders: ordersResult,
                feedback: feedbackResult,
                total: 0
            });
        });
    });
});

//Вопросы
db.query(`
    CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(250),
    organization VARCHAR(250),
    phone VARCHAR(50),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) throw err;
    console.log('Таблица вопросов проверена/создана')
})

app.post('/send-feedback', (req, res) => {
    const {email, organization, phone, comment} = req.body;
    const sql = "INSERT INTO feedback (email, organization, phone, comment) VALUES (?, ?, ?, ?)";
    db.query(sql, [email,organization,phone,comment], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("error");
        }
        res.send("success")
    });
});