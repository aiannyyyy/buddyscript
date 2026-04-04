# BuddyScript 🚀

A full-stack social media web application built with React + Node.js.

## 🌐 Live Demo
- **Frontend:** https://buddyscript-puce.vercel.app
- **Backend API:** https://buddyscript-g3rz.onrender.com

> ⚠️ Note: Backend is hosted on Render free tier. First request may take 50 seconds to wake up.

## 🛠 Tech Stack

### Frontend
- React.js + Vite + TypeScript
- Bootstrap 5
- Zustand (state management)
- Axios (API calls)
- React Router v6
- React Toastify

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- JWT Authentication
- Cloudinary (image uploads)
- Multer

## ✅ Features
- Secure JWT authentication (register & login)
- Registration with first name, last name, email and password
- Protected feed route — accessible only to logged in users
- Create posts with text and image upload
- Public and private post visibility
- Posts displayed newest first
- Like / unlike posts with like count
- Comments and replies system
- Like / unlike comments and replies
- See who liked a post, comment or reply
- Search posts by content or author name
- Responsive design matching provided HTML/CSS design
- Dark mode support

## 🗃 Database Design
User
├── Post (one to many)
├── Comment (one to many)
├── Reply (one to many)
├── PostLike (one to many)
├── CommentLike (one to many)
└── ReplyLike (one to many)
Post
├── Comment (one to many)
└── PostLike (one to many)
Comment
├── Reply (one to many)
└── CommentLike (one to many)
Reply
└── ReplyLike (one to many)

## ⚙️ Architecture Decisions

### Why PostgreSQL + Prisma?
The task requires designing for millions of posts and reads. PostgreSQL handles this well with indexes on `userId`, `createdAt`, and `postId`. Prisma provides type-safe queries and easy migrations.

### Why JWT?
Stateless authentication that scales well. No server-side session storage needed.

### Why Cloudinary?
Images should never be stored in the database. Cloudinary handles compression, CDN delivery, and format optimization automatically.

### Performance Considerations
- Cursor-based pagination on feed (10 posts per page)
- Database indexes on frequently queried columns
- Cloudinary auto-compression and format optimization
- Supabase connection pooling for production

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase)
- Cloudinary account

### Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your .env values
npm install
npx dotenv -e .env -- prisma migrate dev
npm run dev
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
# Fill in your .env values
npm install
npm run dev
```

## 📁 Project Structure
buddyscript/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/              # Axios API calls
│   │   ├── components/       # Reusable components
│   │   │   ├── auth/         # Protected route
│   │   │   └── feed/         # Post card, create post
│   │   ├── pages/            # Login, Register, Feed
│   │   ├── store/            # Zustand auth store
│   │   └── types/            # TypeScript interfaces
│   └── public/assets/        # CSS and images
│
└── backend/                  # Node + Express + TypeScript
├── src/
│   ├── controllers/      # Auth, Post, Comment logic
│   ├── middleware/        # JWT auth guard
│   ├── routes/           # API routes
│   └── utils/            # Prisma, JWT, Cloudinary
└── prisma/               # Database schema

## 📝 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all posts (paginated) |
| POST | `/api/posts` | Create a post |
| DELETE | `/api/posts/:id` | Delete a post |
| POST | `/api/posts/:id/like` | Toggle like |
| GET | `/api/posts/:id/likes` | Get post likes |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/comments/post/:id` | Add comment |
| POST | `/api/comments/:commentId/like` | Toggle comment like |
| GET | `/api/comments/:commentId/likes` | Get comment likes |
| POST | `/api/comments/:commentId/reply` | Add reply |
| POST | `/api/comments/reply/:replyId/like` | Toggle reply like |
| GET | `/api/comments/reply/:replyId/likes` | Get reply likes |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload image to Cloudinary |