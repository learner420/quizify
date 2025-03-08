# AI-Powered Quiz Application

A comprehensive quiz application with user authentication, token-based quiz access, and payment integration using Razorpay.

## Features

- User authentication (register, login, profile management)
- Password reset functionality
- Token-based quiz access system
- Payment integration with Razorpay
- Dynamic quiz loading and submission
- Quiz attempt tracking and history
- Responsive UI with React
- Admin panel for user and token management

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: React (JavaScript)
- **Database**: SQLite (local development) / PostgreSQL (production)
- **Payment Gateway**: Razorpay

## Project Structure

```
/
├── backend/                  # Flask backend
│   ├── app/                  # Application package
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── static/           # Static files
│   │   ├── templates/        # HTML templates
│   │   └── __init__.py       # App initialization
│   ├── quizzes/              # Quiz data storage
│   │   ├── subject1/         # Subject categories
│   │   └── subject2/
│   ├── .env                  # Environment variables
│   ├── requirements.txt      # Python dependencies
│   └── run.py                # App entry point
│
└── frontend/                 # React frontend
    ├── public/               # Public assets
    └── src/                  # Source code
        ├── components/       # Reusable components
        ├── pages/            # Page components
        └── services/         # API services
```

## Setup Instructions

### Quick Setup (Windows)

1. Run the setup script to initialize the database and install dependencies:
   ```
   setup.bat
   ```

2. Run the application:
   ```
   run_backend.bat  # In one terminal
   run_frontend.bat  # In another terminal
   ```

3. Access the application:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

4. Use the demo account:
   - Email: demo@example.com
   - Password: password123

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Configure environment variables:
   - Update the values in `.env` file with your API keys

6. Initialize the database:
   ```
   python init_db.py
   ```

7. Run the application:
   ```
   python run.py
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Admin Features

The first user registered will automatically be assigned admin privileges. Admin users can:

1. Manage users:
   - View all users
   - Edit tokens for individual users
   - Perform bulk token operations (add, subtract, or set tokens for multiple users)
   - Change user roles
   - Search and filter users

2. Configure token packages:
   - Edit existing token packages (price and token amounts)
   - Add new token packages
   - Remove token packages

3. Access all features without spending tokens

To access the admin panel, log in with an admin account and navigate to `/admin`.

## Deployment

### Deploying to Render

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Use the render.yaml file for configuration
4. Set up the environment variables in Render:
   - RAZORPAY_KEY_ID
   - RAZORPAY_KEY_SECRET

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Quizzes
- `GET /api/quizzes` - Get all subjects
- `GET /api/quizzes/<subject>` - Get all quizzes in a subject
- `GET /api/quizzes/<subject>/<quiz_name>` - Get a specific quiz
- `POST /api/quizzes/<subject>/<quiz_name>/submit` - Submit quiz answers
- `GET /api/quizzes/attempts` - Get user's quiz attempts

### Payments
- `GET /api/payment/packages` - Get token packages
- `POST /api/payment/create-order` - Create a Razorpay order
- `POST /api/payment/verify-payment` - Verify a payment
- `GET /api/payment/transactions` - Get user's transactions

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/<user_id>` - Get a specific user
- `PUT /api/admin/users/<user_id>/tokens` - Update user tokens
- `PUT /api/admin/users/<user_id>/role` - Update user role
- `GET /api/admin/token-packages` - Get token packages
- `PUT /api/admin/token-packages` - Update token packages

## Email Configuration for Password Reset

The application uses email for password reset functionality. You can configure it in two ways:

### Development Mode

In development mode, emails are not actually sent but are printed to the console. No configuration is needed.

### Production Mode

For production, configure the following environment variables:

```
SMTP_SERVER=your-smtp-server.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-email-password
```

You can use services like:
- Gmail (requires app password)
- Mailtrap.io (for testing)
- SendGrid
- Mailgun

## License

This project is licensed under the MIT License - see the LICENSE file for details. 