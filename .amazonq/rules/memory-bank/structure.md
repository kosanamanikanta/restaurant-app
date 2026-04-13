# Project Structure

## Directory Layout

```
RESTAURANT/
├── backend/                    # Express.js REST API server
│   ├── config/
│   │   └── db.js               # MongoDB connection via Mongoose
│   ├── controller/
│   │   └── foodController.js   # Business logic for food endpoints
│   ├── middleware/             # (reserved for auth middleware)
│   ├── models/
│   │   └── foodModel.js        # Mongoose schema for food items
│   ├── routes/
│   │   └── foodRoutes.js       # Express router + Multer file upload config
│   ├── uploads/                # Uploaded food images stored here
│   ├── .env                    # MONGODB_URI and other secrets
│   ├── package.json
│   └── server.js               # App entry point, middleware setup, route mounting
│
└── frontend/                   # React SPA (Vite)
    ├── public/                 # Static assets (favicon, header/navbar images)
    ├── src/
    │   ├── assets/
    │   │   ├── assets.js       # Central export: assets object, menu_list, food_list
    │   │   └── *.png           # All image files
    │   ├── Components/
    │   │   ├── AppDownload/    # App store download banner
    │   │   ├── context/
    │   │   │   └── StoreContext.jsx  # Global state: cart, food data, auth token
    │   │   ├── ExploreMenu/    # Category filter UI
    │   │   ├── FoodDisplay/    # Filtered food grid
    │   │   ├── FoodItems/      # Individual food card with add/remove controls
    │   │   ├── Footer/         # Site footer with social links
    │   │   ├── Header/         # Hero banner section
    │   │   ├── LoginPopup/     # Auth modal (login/signup)
    │   │   └── Navbar/         # Top navigation with cart icon
    │   ├── Pages/
    │   │   ├── Cart/           # Cart page with item list and totals
    │   │   ├── Home/           # Landing page composing Header + ExploreMenu + FoodDisplay
    │   │   └── PlaceOrders/    # Checkout/order form page
    │   ├── App.jsx             # Root component: routing + LoginPopup state
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx            # React DOM entry, wraps app in StoreContextProvider + BrowserRouter
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Core Components and Relationships

- **App.jsx** manages `showLogin` state and renders `<LoginPopup>` conditionally; mounts `<Navbar>`, `<Routes>`, and `<Footer>`
- **main.jsx** wraps the entire app in `<StoreContextProvider>` and `<BrowserRouter>`
- **StoreContext.jsx** is the single global store — provides cart state, food list, and auth token to all components via React Context
- **assets.js** is the single source of truth for static data: all image imports, `assets` object, `menu_list` array, and `food_list` array (32 items)
- **FoodDisplay** consumes `category` prop from Home and filters `food_list` from context
- **FoodItems** reads cart quantities from context and calls `addToCart`/`removeFromCart`
- **Cart** reads `cartItems` and `food_list` from context to render line items and totals

## Architectural Patterns

- **Monorepo with two independent packages**: `backend/` and `frontend/` each have their own `package.json`
- **React Context for global state**: No Redux; StoreContext provides cart, food data, and auth across the component tree
- **MVC on backend**: routes → controller → model separation
- **Static data in frontend**: `food_list` in `assets.js` serves as mock/seed data; backend stores real data in MongoDB
- **File upload pattern**: Multer middleware in route file handles `multipart/form-data`; images saved to `uploads/` directory
- **ES Modules throughout**: Both frontend (`type: "module"`) and backend (`type: "module"`) use ESM `import/export`
