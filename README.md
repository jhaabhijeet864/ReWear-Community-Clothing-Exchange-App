# ReWear Community Clothing Exchange

A simple, vanilla JavaScript application for community clothing exchange and swapping.

## 🚀 Features

- **User Authentication**: Login and registration system
- **Product Management**: Add, edit, and view clothing items
- **Category Browsing**: Browse items by category (Men, Women, Kids, Accessories)
- **User Dashboard**: Manage your listings and purchases
- **Admin Panel**: User management and system administration
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with modern design patterns
- **Icons**: Font Awesome
- **Development Server**: Live Server

## 📁 Project Structure

```
Proto/
├── index.html              # Main HTML file
├── package.json            # Project configuration
├── README.md              # Project documentation
├── styles/
│   └── main.css           # Main stylesheet
└── js/
    ├── app.js             # Main application logic
    ├── navigation.js      # Page routing and navigation
    ├── forms.js           # Form handling and validation
    └── data.js            # Data management and mock data
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd Proto
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Demo Accounts

**Admin User:**
- Username: `admin`
- Password: `password`

**Regular Users:**
- Username: `sarah_j` / Password: `password`
- Username: `mike_d` / Password: `password`

### Features Walkthrough

1. **Home Page**: Browse featured products and categories
2. **Login/Register**: Create an account or sign in
3. **Dashboard**: View your listings and manage your account
4. **Add Products**: Upload images and create new listings
5. **Admin Panel**: Manage users and system settings (admin only)

## 🎨 Design Features

- **Modern UI**: Clean, responsive design with smooth animations
- **Color Scheme**: Professional blue and gray palette
- **Typography**: Readable fonts with proper hierarchy
- **Interactive Elements**: Hover effects and smooth transitions
- **Mobile-First**: Responsive design that works on all devices

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: 1200px+ screens
- **Tablet**: 768px - 1199px screens
- **Mobile**: 320px - 767px screens

## 🔧 Development

### Available Scripts

- `npm start` - Start the development server
- `npm run dev` - Start the development server (alias)
- `npm run build` - Build the project (placeholder)

### File Structure

- **HTML**: Single-page application with multiple sections
- **CSS**: Modular styles with utility classes
- **JavaScript**: Object-oriented approach with ES6 classes

### Key JavaScript Classes

- `ReWearApp`: Main application controller
- `Navigation`: Page routing and navigation
- `FormHandler`: Form validation and handling
- `DataManager`: Data operations and mock data

## 🗄️ Data Structure

### Products
```javascript
{
  id: 1,
  name: "Product Name",
  description: "Product description",
  category: "Men/Women/Kids/Accessories",
  price: 25,
  owner: "username",
  images: ["image1.jpg"],
  status: "available",
  condition: "Good/Excellent",
  size: "M",
  tags: ["tag1", "tag2"]
}
```

### Users
```javascript
{
  id: 1,
  username: "username",
  name: "Full Name",
  email: "email@example.com",
  role: "user/admin",
  listings: [1, 2, 3],
  purchases: [4, 5],
  rating: 4.8,
  totalSwaps: 12
}
```

## 🚀 Deployment

### Simple Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to any static hosting service:**
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3

### Production Considerations

- Minify CSS and JavaScript files
- Optimize images
- Enable HTTPS
- Set up proper caching headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the browser console for errors
- Verify all files are in the correct locations
- Ensure Node.js and npm are properly installed

## 🔮 Future Enhancements

- Backend API integration
- Real-time notifications
- Image upload functionality
- Payment processing
- Advanced search and filtering
- User ratings and reviews
- Mobile app development

---

**Built with ❤️ for the ReWear Community** 