# ReWear Backend API

A comprehensive Node.js/Express backend for the ReWear Community Clothing Exchange platform. This API provides all the necessary endpoints for user authentication, item management, swap functionality, and admin operations.

## Features

- **User Authentication**: JWT-based authentication with registration, login, and password management
- **Item Management**: CRUD operations for clothing items with image upload support
- **Swap System**: Direct item swaps and points-based redemptions
- **Admin Panel**: Comprehensive admin tools for moderation and platform management
- **Search & Filtering**: Advanced search with multiple filter options
- **Rating System**: User ratings for completed swaps
- **Points System**: Virtual currency for points-based exchanges
- **Image Upload**: Multer-based image upload with validation
- **Security**: Rate limiting, input validation, and security middleware

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Image Storage**: Local file system (configurable for cloud storage)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

1. **Clone the repository and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/rewear_db
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| POST | `/logout` | User logout | Private |
| GET | `/me` | Get current user profile | Private |
| POST | `/refresh` | Refresh JWT token | Private |
| POST | `/change-password` | Change user password | Private |
| POST | `/forgot-password` | Request password reset | Public |
| POST | `/reset-password` | Reset password with token | Public |

### Users (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/profile/:userId` | Get user public profile | Public |
| PUT | `/profile` | Update user profile | Private |
| GET | `/items/:userId` | Get user's items | Public |
| GET | `/stats/:userId` | Get user statistics | Public |
| GET | `/search` | Search users | Public |
| GET | `/me/items` | Get current user's items | Private |
| GET | `/me/swaps` | Get current user's swaps | Private |
| PUT | `/preferences` | Update user preferences | Private |
| DELETE | `/me` | Delete current user account | Private |

### Items (`/api/items`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/` | Create new item | Private |
| GET | `/` | Get all items with filters | Public |
| GET | `/featured` | Get featured items | Public |
| GET | `/:itemId` | Get item by ID | Public |
| PUT | `/:itemId` | Update item | Private (owner) |
| DELETE | `/:itemId` | Delete item | Private (owner) |
| POST | `/:itemId/like` | Toggle like on item | Private |
| DELETE | `/:itemId/images/:imageId` | Delete item image | Private (owner) |
| POST | `/:itemId/images/primary` | Set primary image | Private (owner) |
| GET | `/categories` | Get available categories | Public |
| GET | `/types` | Get available types | Public |

### Swaps (`/api/swaps`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/` | Create swap request | Private |
| GET | `/` | Get user's swaps | Private |
| GET | `/pending` | Get pending swaps | Private |
| GET | `/:swapId` | Get swap details | Private (participants) |
| PUT | `/:swapId/accept` | Accept swap request | Private (recipient) |
| PUT | `/:swapId/reject` | Reject swap request | Private (recipient) |
| PUT | `/:swapId/complete` | Complete swap | Private (participants) |
| PUT | `/:swapId/cancel` | Cancel swap | Private (participants) |
| POST | `/:swapId/rate` | Rate completed swap | Private (participants) |
| GET | `/stats` | Get swap statistics | Private |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/dashboard` | Get admin dashboard stats | Admin |
| GET | `/items` | Get items for moderation | Admin |
| PUT | `/items/:itemId/approve` | Approve item | Admin |
| PUT | `/items/:itemId/reject` | Reject item | Admin |
| PUT | `/items/:itemId/feature` | Toggle item featured status | Admin |
| DELETE | `/items/:itemId` | Remove item | Admin |
| GET | `/users` | Get users for management | Admin |
| PUT | `/users/:userId/verify` | Verify user account | Admin |
| PUT | `/users/:userId/deactivate` | Deactivate user | Admin |
| PUT | `/users/:userId/activate` | Activate user | Admin |
| PUT | `/users/:userId/points` | Adjust user points | Admin |
| GET | `/swaps` | Get swaps for monitoring | Admin |
| GET | `/reports` | Get platform reports | Admin |

## Database Models

### User Model
- Authentication fields (email, password)
- Profile information (firstName, lastName, username, bio, location)
- Points system integration
- Role-based access control
- Account status management

### Item Model
- Item details (title, description, category, type, size, condition)
- Image management with primary image support
- Status tracking (pending, approved, available, swapped, etc.)
- Swap type configuration (direct, points, both)
- View and like tracking

### Swap Model
- Swap type (direct or points-based)
- Status management (pending, accepted, completed, etc.)
- Participant tracking
- Rating system for completed swaps
- Message and communication support

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## File Upload

Image uploads are handled using Multer with the following configuration:
- Maximum 5 images per item
- File size limit: 5MB per image
- Supported formats: JPEG, JPG, PNG, WebP
- Images are stored locally in `uploads/items/` directory

## Validation

All input is validated using express-validator with comprehensive validation rules:
- Email format validation
- Password strength requirements
- Required field validation
- Data type and range validation
- Custom business logic validation

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Request rate limiting to prevent abuse
- **Input Validation**: Comprehensive input sanitization
- **JWT Security**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security

## Error Handling

The API includes comprehensive error handling:
- Validation errors with detailed field-specific messages
- Authentication and authorization errors
- Database operation errors
- File upload errors
- Custom business logic errors

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/rewear_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure proper CORS origins
4. Set up proper JWT secrets
5. Configure image storage (consider cloud storage)
6. Set up proper logging and monitoring
7. Configure rate limiting for production traffic

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // if applicable
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message",
      "value": "invalid value"
    }
  ]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please refer to the project documentation or create an issue in the repository. 