# Product Overview

## Project Purpose
A full-stack restaurant food ordering web application that allows customers to browse a menu, add items to a cart, and place orders online. The platform provides a seamless food discovery and ordering experience with category-based filtering and cart management.

## Value Proposition
- Customers can browse 32 food items across 8 categories without needing to visit in person
- Real-time cart management with quantity controls
- Streamlined checkout and order placement flow
- User authentication (login/signup) via modal popup

## Key Features
- **Menu Browsing**: 32 food items organized into 8 categories (Salad, Rolls, Deserts, Sandwich, Cake, Pure Veg, Pasta, Noodles)
- **Category Filtering**: Interactive menu filter via ExploreMenu component
- **Cart Management**: Add/remove items, quantity tracking, subtotal calculation
- **User Authentication**: Login/signup popup with JWT-based auth (bcrypt password hashing)
- **Order Placement**: Dedicated checkout page (PlaceOrders) with Stripe payment integration
- **Food Image Upload**: Admin can add food items with image uploads stored server-side
- **Responsive UI**: React-based SPA with CSS styling

## Target Users
- **Customers**: Browse menu, filter by category, manage cart, place orders
- **Restaurant Admin**: Add new food items via POST /api/food/add endpoint with image upload

## Use Cases
1. Customer browses menu, filters by "Pasta", adds items to cart
2. Customer reviews cart, proceeds to checkout, completes payment via Stripe
3. Admin adds a new food item with name, description, price, category, and image
4. New user registers or existing user logs in via the login popup modal
