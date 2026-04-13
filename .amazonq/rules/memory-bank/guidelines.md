# Development Guidelines

## Code Quality Standards

### Component Structure
- Every component is a named arrow function assigned to a `const`, then `export default` at the bottom
- One component per file; file name matches component name exactly
- Each component file imports its own co-located CSS: `import './ComponentName.css'`

```jsx
// Pattern used in every component
const MyComponent = ({ prop1, prop2 }) => {
  // hooks first
  // helper functions
  // return JSX
}
export default MyComponent
```

### Import Order Convention
Observed consistently across all components:
1. React and hooks (`import React, { useState, useContext } from 'react'`)
2. Local CSS (`import './Component.css'`)
3. Internal assets (`import { assets } from '../../assets/assets'`)
4. Context (`import { StoreContent } from '../context/StoreContext'`)
5. Router utilities (`import { Link, useNavigate } from 'react-router-dom'`)

### Naming Conventions
- Components: PascalCase (`FoodItems`, `LoginPopup`, `PlaceOrders`)
- Files/folders: PascalCase for components (`FoodItems/FoodItems.jsx`)
- Context export name: `StoreContent` (note: intentional name, not `StoreContext`)
- CSS class names: kebab-case (`food-item`, `cart-items-title`, `login-popup-container`)
- State variables: camelCase (`cartItems`, `currState`, `showLogin`)
- Props: camelCase, descriptive (`setShowLogin`, `getTotalCartAmount`)

### Spacing and Formatting
- 2-space indentation in JSX files
- No semicolons in some files; inconsistent — do not enforce either way
- Single quotes for strings in frontend JS/JSX
- Double quotes for strings in backend JS

---

## React Patterns

### Global State via Context
All shared state lives in `StoreContextProvider`. Components consume it with `useContext(StoreContent)`:

```jsx
// Providing context (StoreContext.jsx)
const contextValue = { food_list, cartItems, setCartItems, addToCart, removeFromCart, getTotalCartAmount }
return <StoreContent.Provider value={contextValue}>{props.children}</StoreContent.Provider>

// Consuming context
const { cartItems, food_list, removeFromCart } = useContext(StoreContent)
```

### Immutable State Updates
Cart state always uses functional updater with spread to avoid mutation:

```jsx
setCartItems(prev => ({ ...prev, [itemId]: prev[itemId] + 1 }))
setCartItems(prev => ({ ...prev, [itemId]: prev[itemId] > 1 ? prev[itemId] - 1 : 0 }))
```

### Conditional Rendering
Ternary expressions preferred over `&&` for toggling UI blocks:

```jsx
// Login/Signup toggle
{currState === "Login"
  ? <p>Create an account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
  : <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
}

// Cart add/remove counter toggle
{!cartItems[id] || cartItems[id] === 0
  ? <img onClick={() => addToCart(id)} src={assets.add_icon_white} alt='' />
  : <div className='food-item-counter'>...</div>
}
```

### List Rendering
Always use `item._id` as the `key` prop (never array index):

```jsx
{food_list.map((item, index) => {
  if (cartItems[item._id] > 0) {
    return <div key={item._id}>...</div>
  }
})}
```

### Modal/Popup Pattern
Parent holds boolean state; passes setter down as prop; child calls setter to close:

```jsx
// App.jsx
const [showLogin, setShowLogin] = useState(false)
{showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}

// LoginPopup.jsx
<img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt='' />
```

### Navigation Pattern
`useNavigate` for programmatic navigation; `<Link>` for declarative nav links:

```jsx
const navigate = useNavigate()
navigate('/order')                    // programmatic
<Link to='/cart'><img .../></Link>    // declarative
```

### Scroll-to-Section Pattern
Navigate to home first, then use `setTimeout` + `getElementById` + `scrollIntoView`:

```jsx
const handleScroll = (section) => {
  setMenu(section)
  navigate('/')
  setTimeout(() => {
    const el = document.getElementById(section)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}
```

---

## Backend Patterns

### Route → Controller → Model Separation
Routes only wire HTTP methods to controller functions; all logic is in controllers:

```js
// foodRoutes.js — only routing + middleware
foodRouter.post("/add", upload.single("image"), addFood)

// foodController.js — all business logic
const addFood = async (req, res) => {
  const food = new foodModel({ ...req.body, image: req.file.filename })
  try {
    await food.save()
    res.json({ success: true, message: "Food Added" })
  } catch (error) {
    res.json({ success: false, message: "Error" })
  }
}
```

### API Response Shape
All API responses use a consistent JSON shape:

```js
res.json({ success: true, message: "Food Added" })   // success
res.json({ success: false, message: "Error" })        // failure
```

### Multer File Upload Config
Storage engine defined inline in the route file; filename uses `Date.now()` prefix:

```js
const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})
const upload = multer({ storage })
```

### Mongoose Model Pattern
Guard against model recompilation with `mongoose.models.food || mongoose.model(...)`:

```js
const foodModel = mongoose.models.food || mongoose.model("food", foodSchema)
export default foodModel
```

### Schema Field Style
Inline object shorthand for simple fields, no extra whitespace:

```js
const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
})
```

### Environment and DB Connection
- `dotenv.config()` called at the top of both `server.js` and `db.js`
- DB connection is a standalone async function exported from `config/db.js` and called in `server.js`
- On connection failure: log error and `process.exit(1)`

---

## Static Data Management

All frontend static data (menu categories, food items, UI icons) is centralized in `assets/assets.js`:
- `assets` object — all icon/image references
- `menu_list` — array of `{ menu_name, menu_image }` for category filter
- `food_list` — array of 32 food items with `{ _id, name, image, price, description, category }`

Import only what you need:
```js
import { assets, food_list, menu_list } from '../../assets/assets'
```

---

## Currency Display
Indian Rupee symbol used inline in JSX (no utility function):
```jsx
<p>₹{item.price}</p>
<b>₹{getTotalCartAmount() + 38}</b>
```

Delivery fee is a hardcoded constant (₹38 in Cart, ₹2 in PlaceOrders — inconsistency to be resolved).

---

## What to Avoid
- Do not use Redux or any external state library — use React Context
- Do not use `index` as `key` in list renders — always use `item._id`
- Do not put business logic in route files — keep it in controllers
- Do not commit `.env` files — use environment variables for all secrets
- Do not use `console.log` in production code (currently present in `StoreContext.jsx` useEffect — remove before shipping)
