# 🧯 Fire-Fighting Equipment Store

Проект полноценного интернет-магазина с контейнеризацией и базой данных.

### Стек технологий
* **Backend:** Node.js (Express.js)
* **Frontend:** HTML5, CSS3, JavaScript (EJS templates)
* **Database:** MySQL 8.0
* **Infrastructure:** Docker & Docker Compose

### Возможности проекта
* 🛒 **Корзина:** добавление товаров и управление заказами.
* 🔐 **Админ-панель:** управление ассортиментом через защищенный интерфейс.
* 🐳 **Оркестрация:** быстрый запуск всей среды одной командой.
* 📦 **Persistent Storage:** данные базы сохраняются даже после остановки контейнеров.

---

## Установка и запуск

### 1. Клонирование репозитория
Откройте терминал и выполните:
```bash
git clone [https://github.com/ettelent/fire-fighting-shop-docker.git](https://github.com/ettelent/fire-fighting-shop-docker.git)
```
```bash
cd fire-fighting-shop-docker
```
```bash
docker-compose up --build
```

## Для захода на сайт => http://localhost:3000
## Для входа в корзину(через строку) => http://localhost:3000/cart
## Для входа в админ-панель => http://localhost:3000/admin
