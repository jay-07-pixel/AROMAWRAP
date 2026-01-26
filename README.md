# AromaWrap - Natural Fragrances E-commerce Platform

A modern, full-featured e-commerce website for natural fragrances, agarbatti, dhoop, and puja essentials. Built with React, TypeScript, Vite, and Firebase for a complete shopping experience with real-time updates.

## 🌟 Features

### Customer Features
- **User Authentication**: Secure sign-up and login with Firebase Authentication
- **Product Catalog**: Browse through various categories of natural fragrances
- **Shopping Cart**: Add to cart functionality with persistent cart drawer
- **Wishlist**: Save favorite products for later
- **Order Management**: View order history with real-time status updates
- **Product Search**: Advanced search functionality with trending suggestions
- **Category Navigation**: Easy browsing by product categories
- **Product Details**: Detailed product pages with multiple images, specifications, and reviews
- **Quick View**: Modal preview of products without leaving the page
- **Recently Viewed**: Track and display recently viewed products
- **Responsive Design**: Optimized for all device sizes (mobile, tablet, desktop)

### Admin Features
- **Admin Dashboard**: Complete admin panel for managing orders and products
- **Order Management**: View all orders, update order status, and view detailed order information
- **Product Management**: Add, edit, and manage products with image uploads
- **Real-time Updates**: Order status changes reflect immediately for users
- **Analytics**: View order statistics and product performance

### Technical Features
- **Real-time Synchronization**: Firestore `onSnapshot` listeners for instant updates
- **Image Optimization**: Lazy loading, eager loading, and error handling for optimal performance
- **Firebase Storage**: Secure cloud storage for product images
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Smooth Animations**: Framer Motion for enhanced user experience

## 🛍️ Product Categories

- **Best Sellers**: Featured popular products (Lavender, Mogra, Mahadev Dhoop, Tornado Dhoop)
- **Agarbatti**: Traditional incense sticks (Lavender, Mogra, Sandalwood, etc.)
- **Dhoop**: Premium dhoop sticks (Mahadev Dhoop, Sai Baba Dhoop, Tornado Dhoop, Mannat Dhoop, Devi Dhoop)
- **Puja Essentials**: Complete puja kits and accessories
- **Bambooless Incense**: Eco-friendly dhoop sticks
- **Incense Cones**: Aromatic cone collections
- **Karpure**: Natural camphor products
- **Eco-Friendly Havan Cups**: Sustainable havan materials
- **Puja Accessories**: Traditional puja items

## 🚀 Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Full type safety
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components (Radix UI primitives)
- **Framer Motion**: Animation library
- **React Router DOM**: Client-side routing
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

### Backend & Services
- **Firebase Authentication**: User authentication and authorization
- **Firebase Firestore**: NoSQL database for products, orders, cart, wishlist
- **Firebase Storage**: Cloud storage for product images
- **Firestore Security Rules**: Secure data access control

### State Management
- **React Context API**: Global state management (Auth, Cart, Wishlist, Recently Viewed)
- **TanStack Query**: Server state management and caching

### UI/UX
- **Lucide React**: Icon library
- **Sonner**: Toast notifications
- **Embla Carousel**: Product showcase carousel
- **Date-fns**: Date formatting utilities

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, or bun
- Firebase project with Authentication, Firestore, and Storage enabled

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SS-PUSH-JAY-FOUND-WEB
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
bun install
```

### 3. Firebase Configuration

Create a `.env` file in the root directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase Setup

#### Enable Firebase Services
1. **Authentication**: Enable Email/Password authentication in Firebase Console
2. **Firestore Database**: Create a Firestore database in production mode
3. **Storage**: Enable Firebase Storage

#### Configure Firestore Security Rules
See `FIRESTORE_SECURITY_RULES.md` for detailed security rules configuration.

#### Configure Storage Security Rules
Ensure Storage rules allow read access for product images:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

### 6. Open in Browser
Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components (Button, Card, Dialog, etc.)
│   ├── Header.tsx      # Navigation header with search and cart
│   ├── Footer.tsx      # Site footer
│   ├── CartDrawer.tsx  # Shopping cart drawer
│   ├── WishlistDrawer.tsx # Wishlist drawer
│   ├── ProductCard.tsx # Product display card
│   ├── QuickViewModal.tsx # Quick product preview modal
│   ├── ProductShowcaseBox.tsx # Featured product showcase
│   ├── CategoryCard.tsx # Category display cards
│   ├── BackToTop.tsx   # Scroll to top button
│   └── ...
├── context/            # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   ├── CartContext.tsx # Shopping cart state
│   ├── WishlistContext.tsx # Wishlist state
│   └── RecentlyViewedContext.tsx # Recently viewed products
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx  # Mobile detection hook
│   └── use-toast.ts    # Toast notification hook
├── lib/                # Utility functions
│   ├── firebase.ts     # Firebase configuration and initialization
│   └── utils.ts        # General utility functions
├── pages/              # Page components
│   ├── Index.tsx       # Home page
│   ├── ProductPage.tsx # Product detail page
│   ├── CategoryPage.tsx # Category listing page
│   ├── SearchPage.tsx  # Search results page
│   ├── AccountPage.tsx # User account page (orders, wishlist, profile)
│   ├── AdminDashboard.tsx # Admin panel
│   ├── AddProductPage.tsx # Add/edit products (admin)
│   ├── CartPage.tsx    # Cart page
│   └── NotFound.tsx    # 404 page
├── services/           # Service layer for API calls
│   ├── orderService.ts # Order management functions
│   ├── productService.ts # Product management functions
│   ├── authService.ts  # Authentication functions
│   └── ...
├── utils/              # Utility functions
│   └── uploadImages.ts # Image upload utilities
├── assets/             # Images and static assets
├── App.tsx             # Main app component with routing
└── main.tsx            # Application entry point
```

## 🎨 Design Features

- **Hero Section**: Eye-catching banner with featured products
- **Category Grid**: Circular category cards for visual appeal
- **Product Grid**: Responsive product showcase with uniform card sizes
- **Product Showcase**: Animated carousel for featured products
- **Smooth Animations**: Fade-in, slide-in, and hover effects
- **Loading States**: Skeleton loaders for better UX
- **Error Handling**: Graceful error messages and fallback images
- **Toast Notifications**: User-friendly feedback for actions

## 🛒 Shopping Features

- **Add to Cart**: One-click add to cart with quantity management
- **Cart Drawer**: Slide-out cart interface with item management
- **Wishlist**: Save products for later purchase
- **Order Tracking**: Real-time order status updates
- **Product Badges**: Bestseller, New, Limited edition labels
- **Price Display**: Original and discounted pricing
- **Multiple Images**: Product image galleries with thumbnails
- **Product Specifications**: Detailed product information
- **Search & Filter**: Advanced product search functionality

## 🔐 Authentication & Authorization

- **User Registration**: Email/password sign-up
- **User Login**: Secure authentication
- **Protected Routes**: Account and admin pages require authentication
- **Role-based Access**: Admin dashboard restricted to admin users
- **Session Management**: Persistent login state

## 📊 Admin Dashboard

- **Order Management**: View all orders with filtering and search
- **Order Status Updates**: Update order status (Pending, Processing, Shipped, Delivered, Cancelled)
- **Order Details**: View complete order information in modal
- **Product Management**: Add, edit, and manage products
- **Image Upload**: Upload product images to Firebase Storage
- **Real-time Sync**: Changes reflect immediately for users

## 🌱 Natural & Eco-Friendly Focus

This e-commerce platform specializes in:
- 100% natural ingredients
- Eco-friendly and biodegradable products
- Traditional wisdom with modern quality
- Sustainable packaging
- Cow dung and natural herb-based products
- FSSAI certified products

## 🚀 Performance Optimizations

- **Image Lazy Loading**: Images load as needed for faster initial page load
- **Eager Loading**: Critical images (hero, featured products) load immediately
- **Image Optimization**: Proper sizing and format optimization
- **Error Handling**: Fallback images for failed loads
- **Code Splitting**: Route-based code splitting for smaller bundles
- **Firestore Indexing**: Optimized queries with proper indexes

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Development Guidelines

### Code Style
- TypeScript for all components
- ESLint for code quality
- Consistent naming conventions
- Component-based architecture

### Firebase Best Practices
- Use Firestore security rules for data protection
- Implement proper error handling for Firebase operations
- Use `onSnapshot` for real-time updates where needed
- Optimize Firestore queries with proper indexes

### Image Management
- Upload images to Firebase Storage
- Use proper image URLs with tokens
- Implement lazy loading for performance
- Provide fallback images for errors

## 📚 Additional Documentation

- `FIREBASE_SETUP.md` - Complete Firebase setup guide
- `FIREBASE_AUTH_SETUP.md` - Authentication configuration
- `FIRESTORE_SECURITY_RULES.md` - Security rules documentation
- `CART_WISHLIST_FIREBASE_GUIDE.md` - Cart and wishlist implementation
- `DIRECT_UPLOAD_GUIDE.md` - Image upload guide
- `UPLOAD_IMAGES_GUIDE.md` - Product image management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Vite](https://vitejs.dev/)
- Backend by [Firebase](https://firebase.google.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

---

**Experience the divine power of nature's gift** 🌿✨

**AromaWrap** - Your trusted source for natural fragrances and puja essentials.
