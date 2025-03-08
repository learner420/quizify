# Deploying Quiz App on Render (Free Tier)

This guide will help you deploy the Quiz App on Render's free tier.

## Prerequisites

1. A GitHub account
2. A Render account (sign up at [render.com](https://render.com))
3. Your Quiz App code pushed to a GitHub repository

## Deployment Steps

### 1. Push Your Code to GitHub

Use the provided `upload_to_github.sh` (Linux/Mac) or `upload_to_github.bat` (Windows) script to push your code to GitHub.

### 2. Deploy Using Render Blueprint

1. **Log in to Render** and go to your dashboard

2. **Create a new Blueprint instance**:
   - Click the "New" button
   - Select "Blueprint"
   - Connect your GitHub account if not already connected
   - Select your Quiz App repository
   - Click "Apply Blueprint"

3. **Configure Environment Variables**:
   Render will prompt you to set up these environment variables:
   - `RAZORPAY_KEY_ID` - Your Razorpay API key
   - `RAZORPAY_KEY_SECRET` - Your Razorpay API secret
   - `SMTP_USERNAME` - Email for password reset functionality
   - `SMTP_PASSWORD` - Password for the email account

4. **Deploy**:
   - Click "Apply" to start the deployment
   - Render will automatically create:
     - A PostgreSQL database (free tier)
     - A backend web service with Gunicorn (free tier)
     - A frontend static site (free tier)

5. **Access Your Application**:
   - Once deployment is complete, you can access your application using the URL provided by Render
   - The frontend will be available at the main URL
   - The backend API will be available at the URL of the backend service

## Gunicorn Configuration

The backend is configured to use Gunicorn with optimized settings for Render's free tier:

```
gunicorn --workers=2 --threads=4 --worker-class=gthread --bind 0.0.0.0:$PORT run:app
```

- **2 workers**: Balances performance with memory usage on the free tier
- **4 threads per worker**: Handles more concurrent requests
- **gthread worker class**: Better performance for web applications

For more detailed information about the Gunicorn deployment, see the `RENDER_GUNICORN_DEPLOYMENT.md` file.

## Free Tier Limitations

Render's free tier has some limitations:

1. **Web Services**:
   - Spin down after 15 minutes of inactivity
   - Spin up when a new request comes in (may take a few seconds)
   - Limited to 750 hours per month

2. **PostgreSQL**:
   - 1GB storage
   - Automatically deleted after 90 days of inactivity

3. **Static Sites**:
   - Unlimited static sites
   - 100GB bandwidth per month

## Keeping Your App Active

To prevent your app from spinning down, you can set up a simple cron job to ping your app every 14 minutes:

1. Use a service like [Cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com)
2. Set up a monitor to ping your backend URL every 14 minutes
3. This will keep your app active and prevent it from spinning down

## Troubleshooting

If you encounter any issues during deployment:

1. **Check Render Logs**:
   - Go to your service in the Render dashboard
   - Click on "Logs" to see what's happening

2. **Database Connection Issues**:
   - Make sure your app is correctly configured to use the PostgreSQL database
   - Check the `DATABASE_URL` environment variable

3. **Frontend/Backend Connection Issues**:
   - Make sure the `REACT_APP_API_URL` is correctly set
   - Check CORS configuration in your backend 