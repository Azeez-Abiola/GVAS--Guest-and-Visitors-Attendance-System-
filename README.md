# Guest & Visitor Experience Management System

A modern, secure, and animated guest management system for high-rise facilities.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Windows PowerShell (or any terminal)
- Modern web browser (Chrome/Edge recommended for camera access)

### Installation & Setup

```powershell
# Clone or navigate to the project directory
cd C:\Users\User\Gvas

# Install all dependencies
npm install
cd backend
npm install
cd ../frontend  
npm install
cd ..

# Start both backend and frontend in development mode
npm run dev
```

### Access Points
- **Kiosk Interface**: http://localhost:5174
- **Admin Dashboard**: http://localhost:5174/admin
- **Backend API**: http://localhost:3001

## 🎯 Demo Flow

### 1. Pre-Registration (Admin)
1. Go to Admin Dashboard (`http://localhost:5174/admin`)
2. Click "Pre-Register Guest" 
3. Fill in guest details:
   - Name: John Doe
   - Email: john@example.com
   - Host: Select from dropdown (John Smith, Sarah Johnson, etc.)
   - Purpose: Business Meeting
4. Click "Register" to get QR code and guest code (e.g., ABCD1234)
5. Note the 8-character guest code for kiosk entry

### 2. Guest Check-In (Kiosk)
**Option A - Walk-In Guest:**
1. Go to Kiosk (`http://localhost:5174`)
2. Click "Walk-In Guest"
3. Fill personal info (Name, Email, Phone, Company)
4. Select host and purpose
5. Take photo (allow camera access)
6. Sign on digital signature pad
7. Accept privacy policy
8. Complete check-in

**Option B - Pre-Registered Guest:**
1. Go to Kiosk (`http://localhost:5174`)
2. Click "Pre-Registered"
3. Enter the guest code from step 1 (e.g., ABCD1234)
4. Confirm details
5. Take photo and sign
6. Accept consent and complete check-in

### 3. Monitor (Admin Dashboard)
- View all visitors in real-time at `http://localhost:5174/admin`
- Filter by status (All, Checked In, Pre-Registered, Checked Out)
- Search by name, host, or company
- Click eye icon to view visitor details
- Click check-out icon to check out visitors
- Auto-refresh every 30 seconds

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + SQLite
- **UI/UX**: Modern animations, responsive design, camera integration
- **Database**: SQLite with sample hosts pre-loaded

## 📁 Project Structure

```
guest-experience-system/
├── backend/           # Express API server
│   ├── server.js      # Main server file
│   ├── package.json   # Backend dependencies
│   └── guests.db      # SQLite database (auto-created)
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── pages/     # Main application pages
│   │   ├── services/  # API service layer
│   │   └── App.jsx    # Main app component
│   ├── package.json   # Frontend dependencies
│   └── vite.config.js # Vite configuration
├── package.json       # Root package & scripts
└── README.md         # This file
```

## 🔧 Development

```powershell
# Backend only (API server on port 3001)
cd backend
npm run dev

# Frontend only (React app on port 5174) 
cd frontend
npm run dev

# Production build
npm run build

# Check API health
curl http://localhost:3001/api/health
```

## 📱 Features Implemented

✅ Modern animated UI with Tailwind & Framer Motion  
✅ Camera capture for guest photos  
✅ Digital signature pad with touch/mouse support  
✅ QR code generation for pre-registered guests  
✅ Real-time visitor dashboard with auto-refresh  
✅ Privacy policy consent with GDPR compliance  
✅ Host notifications (in-app demo mode)  
✅ SQLite database with persistent storage  
✅ Responsive design for tablets and kiosks  
✅ Multi-step forms with progress indicators  
✅ Photo retake and signature clearing  
✅ Visitor search and filtering  
✅ Check-in/check-out status management  

## 🎨 UI Highlights

- **Smooth Animations**: Page transitions, micro-interactions, loading states
- **Glassmorphism Effects**: Modern frosted glass aesthetic with backdrop blur
- **Responsive Design**: Optimized for tablets, kiosks, and desktop
- **Real-time Updates**: Live visitor count and status changes
- **Professional Gradients**: Blue-purple theme with animated backgrounds
- **Interactive Elements**: Hover effects, button animations, signature canvas
- **Modern Typography**: Inter font with proper hierarchy
- **Accessibility**: Keyboard navigation and screen reader support

## 🔒 Security & Compliance

- **Data Privacy**: Inline consent collection with policy display
- **Photo Capture**: Secure browser-based camera access
- **Data Storage**: Local SQLite with structured visitor records
- **Access Control**: Basic admin vs kiosk interface separation
- **Audit Trail**: Timestamp tracking for all visitor actions

## 🚨 Demo Notes

- **Production Considerations**: This is a demo/PoC version
- **Security**: Add authentication, encryption, and access controls for production
- **Integrations**: Connect to email/SMS services, access control systems
- **Scalability**: Consider cloud database and CDN for multi-building deployment
- **Browser Compatibility**: Tested on Chrome/Edge; camera requires HTTPS in production

## 🐛 Troubleshooting

**Camera not working?**
- Ensure you're using Chrome or Edge
- Allow camera permissions when prompted
- Check if camera is being used by another application

**Ports already in use?**
- Backend: Change port in `backend/server.js` (default: 3001)
- Frontend: Change port in `frontend/vite.config.js` (default: 5174)

**Database issues?**
- Delete `backend/guests.db` to reset database
- Sample hosts will be recreated on server restart

---

Built for demo purposes - requires additional security hardening for live deployment.