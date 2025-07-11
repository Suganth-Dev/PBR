# PBR Battery Monitoring System

A full-stack MERN application for real-time monitoring and control of PBR (Performance-Based Repair) battery shipments with automatic threshold enforcement and email notifications.

## 🚀 Features

### Frontend (React + TypeScript)
- **Real-time Dashboard** - Live monitoring of contracts and shipments
- **Threshold Visualization** - Dynamic progress bars with warning indicators
- **Role-based Access Control** - Admin vs User permissions
- **WebSocket Integration** - Real-time updates without page refresh
- **Responsive Design** - Mobile-friendly interface
- **Interactive Components** - Contract lock/unlock, shipment creation

### Backend (Node.js + Express + MongoDB)
- **Atomic Shipment Validation** - Race condition prevention using MongoDB transactions
- **Automated Email Alerts** - Stakeholder notifications for threshold warnings
- **JWT Authentication** - Secure API access with role-based permissions
- **Real-time Updates** - Socket.IO for live data synchronization
- **RESTful API** - Clean, documented endpoints
- **Data Validation** - Input sanitization and error handling

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- Socket.IO client for real-time updates
- Axios for API calls
- React Router for navigation
- Lucide React for icons

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- Socket.IO for real-time communication
- JWT for authentication
- Nodemailer for email notifications
- bcryptjs for password hashing
- Express Rate Limiting & Helmet for security

## 📁 Project Structure

```
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── store/          # Redux store and slices
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript type definitions
│   └── package.json
│
├── backend/                 # Node.js backend application
│   ├── models/             # MongoDB schemas
│   ├── routes/             # Express route handlers
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic services
│   ├── scripts/            # Database seeding scripts
│   └── package.json
│
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pbr-battery-monitoring
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Environment Setup**
```bash
cd ../backend
cp .env.example .env
# Edit .env with your configuration
```

5. **Seed the Database**
```bash
npm run seed
```

6. **Start the Applications**

Backend (Terminal 1):
```bash
cd backend
npm run dev
```

Frontend (Terminal 2):
```bash
cd frontend
npm run dev
```

## 🔐 Demo Accounts

- **Admin:** admin@pbrmonitoring.com / admin123
- **User:** user@pbrmonitoring.com / user123

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Contracts
- `GET /api/contracts` - Get all contracts
- `POST /api/contracts` - Create contract (Admin only)
- `PATCH /api/contracts/:id/toggle-lock` - Toggle contract lock (Admin only)

### Shipments
- `GET /api/shipments` - Get all shipments
- `POST /api/shipments` - Create shipment with atomic validation
- `GET /api/shipments/contract/:contractId` - Get shipments by contract

## 🔄 Real-time Features

The application uses Socket.IO for real-time updates:
- Contract status changes
- New shipment notifications
- Threshold warnings
- Lock/unlock events

## 📧 Email Notifications

Automated email alerts are sent for:
- **80% Threshold Warning** - When shipments reach 80% of contract limit
- **Contract Blocked** - When shipments exceed the threshold
- **Manual Lock/Unlock** - Admin actions on contracts

## 🛡️ Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting on API endpoints
- Input validation and sanitization
- Password hashing with bcrypt
- CORS protection
- Helmet security headers

## 🧪 Business Logic

### Atomic Shipment Validation
```javascript
// MongoDB transaction ensures data consistency
await session.withTransaction(async () => {
  const contract = await Contract.findOne({ contractId }).session(session);
  const newTotal = contract.batteriesShipped + batteriesShipped;
  
  if (newTotal > contract.threshold) {
    // Block shipment and lock contract
    shipment.status = 'BLOCKED';
    contract.isLocked = true;
    // Send notification
  } else {
    // Approve shipment
    shipment.status = 'APPROVED';
    contract.batteriesShipped = newTotal;
  }
});
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/pbr-battery-monitoring
JWT_SECRET=your-super-secret-jwt-key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📈 Performance Features

- MongoDB indexing for efficient queries
- Redis-ready for session management
- Connection pooling
- Optimized React rendering
- Lazy loading components
- API response caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.#   P B R  
 