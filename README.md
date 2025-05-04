# Tourism Activities Platform

A modern web application for managing and discovering tourism activities and destinations in Saudi Arabia.

## 🚀 Features

- **Activity Discovery**: Browse and search through various tourism activities
- **Destination Management**: Add, edit, and manage tourism destinations by admin only 
- **Advanced Filtering**: Filter activities by price, location, and categories
- **User Profiles**: Manage your profile with customizable information and profile pictures
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **User-friendly Interface**: Modern UI with intuitive navigation

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- CSS3 with modern features
- Axios for API requests

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Multer for file handling

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- MongoDB installed and running
- Git

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/khaled2wz/senior-pro.git
   cd senior-pro
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   # Create a .env file with necessary configurations
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**

   Create a `.env` file in the backend directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

   Create a `.env` file in the frontend directory with:
   ```
   VITE_API_URL=http://localhost:5000
   ```

## 🚀 Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## 📱 Usage

1. **Browse Activities**
   - Use the search bar to find specific activities
   - Apply filters to narrow down results
   - Click on activities to view details

2. **Manage Destinations**
   - Add new destinations with images and details
   - Edit existing destination information
   - Remove outdated destinations

3. **User Authentication**
   - Register a new account
   - Log in to access additional features
   - Manage your profile

4. **Profile Management**
   - Update personal information (first name, last name, email, phone)
   - Upload and manage profile pictures
   - Secure password handling
   - Email verification

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature/improvement`)
6. Create a Pull Request

## 📄 License

 

## 👥 Authors

- **Khaled Alhazmi** - *Initial work* - [khaled2wz](https://github.com/khaled2wz)

## 🙏 Acknowledgments



## 📞 Support

For support, email [Khaledalhzmy2@gmail.com] or open an issue in the repository.

## 🔄 Project Status

Project is: _in development_

## 🗺️ Roadmap

- [ ] Add multi-language support
- [ ] Implement real-time notifications
- [ ] Add booking system
- [ ] Integrate payment gateway
- [ ] Add user reviews and ratings
- [ ] Implement advanced search features
- [ ] Add itinerary generator

## 🧪 Testing

The project includes comprehensive test suites for both backend and frontend components.

### Backend Tests

#### Running Model Unit Tests

```bash
cd backend
npm test -- tests/unit/models
```

#### Running Service/Middleware Unit Tests

```bash
cd backend
npm test -- tests/unit/services
```

#### Running Controller Tests

```bash
cd backend
npm test -- tests/controllers/like-functionality.test.js
```

#### Running E2E API Tests

```bash
cd backend
npm test -- tests/e2e
```

#### Running All Backend Tests

```bash
cd backend
npm test
```

#### Generate Backend Test Coverage Report

```bash
cd backend
npm run test:coverage
```

### Frontend Tests

#### Running Component Tests

```bash
cd frontend
npm test
```

#### Testing Specific Components

```bash
cd frontend
npm test -- src/__tests__/components/LikeButton.test.jsx
```

#### Generate Frontend Test Coverage Report

```bash
cd frontend
npm run test:coverage
```

### Important Notes

- **💾 Database Safety**: All backend tests use an in-memory MongoDB database to protect your real data
- **🔄 Test Isolation**: Each test runs in isolation with its own test data
- **🧩 Mocking**: Frontend tests use mocks for API calls to focus on UI testing
- **📊 Coverage**: Test coverage reports help identify untested code areas