# 🎨 MAZE – AI Text to Image Generator

A production-ready full-stack MERN SaaS platform for generating stunning AI images from text prompts. Generate, edit, and download high-quality images powered by multiple AI models.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📸 Screenshots

### Application Preview 1
![Screenshot 1](./screenshots/Screenshot%202026-05-18%20032721.png)

### Application Preview 2
![Screenshot 2](./screenshots/Screenshot%202026-05-18%20032744.png)

---

## ✨ Features

- **AI Image Generation**: Generate images from text using multiple AI models
  - Pollinations AI
  - Hugging Face
  - FAL.ai integration
  
- **User Authentication**
  - Google OAuth
  - Email OTP login (Gmail)
  - JWT-based sessions
  
- **Credit System**
  - Free credits for new users (5 credits)
  - Pricing plans with Stripe integration
  - Credit-based image generation
  
- **Image Management**
  - Gallery view of generated images
  - Cloud storage with Cloudinary
  - Download and share functionality
  
- **Payment Integration**
  - Stripe checkout
  - Multiple credit packages
  - Subscription plans

---

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool (lightning fast)
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Hot Toast** - Notifications

### Backend
- **Node.js + Express** - Server runtime & framework
- **MongoDB + Mongoose** - Database & ODM
- **JWT** - Authentication
- **Nodemailer** - Email service (OTP)
- **Stripe** - Payment processing
- **Cloudinary** - Image storage

### AI/ML Services
- Pollinations AI
- Hugging Face
- FAL.ai
- Simple Image API

---

## 📁 Project Structure

```
maze/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # API client setup
│   │   ├── state/         # Auth context
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── services/      # External service integrations
│   │   ├── middleware/    # Express middleware
│   │   ├── config/        # Configuration files
│   │   ├── utils/         # Helper functions
│   │   ├── app.js
│   │   └── index.js
│   ├── .env
│   └── package.json
│
├── package.json           # Monorepo root
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- MongoDB Atlas account
- Google OAuth credentials
- Gmail account (for OTP)
- Cloudinary account
- Stripe account

### 1️⃣ Clone Repository

```bash
git clone https://github.com/sr2801x/maze.git
cd maze
```

### 2️⃣ Install Dependencies

```bash
npm run install:all
```

### 3️⃣ Setup Environment Variables

#### Server (`.env`)
```env
NODE_ENV=development
PORT=8080
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/maze
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback

# SMTP (OTP Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_no_spaces
MAIL_FROM="MAZE <your_email@gmail.com>"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Services
HF_API_TOKEN=your_huggingface_token
FAL_API_KEY=your_fal_api_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Client (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 4️⃣ Run Development Server

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080

---

## 📝 Available Scripts

### Root Commands
```bash
npm run install:all    # Install all dependencies
npm run dev            # Start both client & server
npm run build          # Build both client & server
npm run start          # Start production server
```

### Client-only
```bash
cd client
npm run dev            # Start Vite dev server
npm run build          # Build for production
npm run preview        # Preview production build
```

### Server-only
```bash
cd server
npm run dev            # Start with nodemon
npm run start          # Start production server
```

---

## 🔑 Key API Endpoints

### Auth
- `POST /api/auth/otp/request` - Request OTP via email
- `POST /api/auth/otp/verify` - Verify OTP and login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout

### Images
- `POST /api/images/generate` - Generate image
- `GET /api/images` - Get user's images
- `DELETE /api/images/:id` - Delete image

### Payments
- `POST /api/payments/create-session` - Create Stripe checkout
- `POST /api/payments/webhook/stripe` - Stripe webhook

### User
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update profile

---

## 🛠️ Debugging Tips

### OTP Not Sending
1. Verify `SMTP_PASS` has **no spaces** (Gmail shows spaces but code needs them removed)
2. Check Gmail security settings - use [App Passwords](https://myaccount.google.com/apppasswords)
3. Restart server after `.env` changes
4. Check server logs: `npm run dev --workspace server`

### Database Connection Issues
```bash
# Test MongoDB URI
mongosh "your_mongodb_uri"
```

### Stripe Issues
- Ensure webhook secret is correct
- Check Stripe Dashboard for event logs

---

## 📦 Deployment

### Deploy Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the dist/ folder to Vercel or Netlify
```

### Deploy Backend (Render/Railway/Heroku)
```bash
cd server
# Set all environment variables in hosting provider
# Deploy with Node.js 18+
```

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

## 💬 Support

Found an issue? Have a question?
- Open an [Issue](https://github.com/sr2801x/maze/issues)
- Check existing documentation

---

**Happy generating! 🎨✨**

