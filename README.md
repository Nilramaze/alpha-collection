# Alpha Collection – B2B Wholesale Portal

Vollständiges B2B E-Commerce-System mit Laravel-Backend, React-Frontend und Filament-Admin-Panel.

## Architektur

```
alpha-collection/
├── backend/                    # Laravel 11 API + Filament Admin
│   ├── app/
│   │   ├── Enums/              # OrderStatus, MessageStatus
│   │   ├── Filament/Resources/ # Admin CRUD
│   │   ├── Http/
│   │   │   ├── Controllers/Api/  # Auth, Product, Cart, Order, Message
│   │   │   └── Resources/        # API JSON Resources
│   │   ├── Models/             # Alle Eloquent Models
│   │   └── Services/           # CartService, OrderService, ProductService
│   ├── database/
│   │   ├── migrations/         # 8 Migrationsdateien
│   │   └── seeders/            # Demo-Daten
│   └── routes/api.php          # REST API Routes
│
└── frontend/                   # React 18 + Vite + TypeScript
    └── src/
        ├── components/         # Layout, ProductCard, ProductModal
        ├── pages/              # Login, Home, Products, Cart, Orders, Contact
        ├── services/api.ts     # Axios + API Endpoints
        ├── stores/             # Zustand: authStore, cartStore
        └── types/              # TypeScript Definitionen
```

## Setup

### Voraussetzungen
PHP 8.2+, Composer, Node 18+, MySQL 8

### Backend
```bash
cd backend
composer install
cp .env.example .env && php artisan key:generate
# DB konfigurieren in .env
php artisan migrate && php artisan db:seed
php artisan serve
```

### Frontend
```bash
cd frontend
npm install && npm run dev
```

### URLs
- Frontend: http://localhost:5173
- API: http://localhost:8000/api
- Admin: http://localhost:8000/admin

### Test-Logins
- Admin: admin@alpha-collection.de / password
- Händler: einkauf@luxe-retail.de / password

## API Endpoints

### Auth
- POST /api/login, POST /api/register, POST /api/logout, GET /api/me

### Produkte (öffentlich, Preise nur für Auth)
- GET /api/products, GET /api/products/{id}, GET /api/products/featured, GET /api/categories

### Warenkorb [Auth]
- GET /api/cart, POST /api/cart/add, POST /api/cart/update, POST /api/cart/remove

### Bestellungen [Auth]
- GET /api/orders, POST /api/orders, GET /api/orders/{id}

### Nachrichten [Auth]
- GET /api/messages, POST /api/messages

## Kernlogik

**Preise versteckt für Gäste:** ProductResource prüft auth → null für price/stock

**Skonto:** User → SkontoGroup → SkontoTiers (gestaffelt). Höchste Stufe wird automatisch angewendet.

**Bestand:** Nur bei Status "versendet" reduziert (in DB-Transaktion)

**Status-Flow:** eingegangen → bearbeitet → versendet (Bestand↓) → bezahlt
