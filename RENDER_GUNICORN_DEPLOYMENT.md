# Deploying Quiz App on Render's Free Tier with Gunicorn

This guide focuses specifically on deploying your Quiz App on Render's free tier using Gunicorn for optimal performance.

## Why Gunicorn?

Gunicorn (Green Unicorn) is a Python WSGI HTTP Server for UNIX that's widely used to deploy Python web applications. It offers several advantages:

- **Performance**: Much better than Flask's built-in development server
- **Reliability**: Handles concurrent requests efficiently
- **Scalability**: Can be configured with multiple workers and threads
- **Production-Ready**: Designed for production environments

## Deployment Steps

### 1. Push Your Code to GitHub

Use the provided `deploy_to_render.sh` (Linux/Mac) or `deploy_to_render.bat` (Windows) script to push your code to GitHub.

### 2. Deploy Using Render Blueprint

1. **Log in to Render** and go to your dashboard

2. **Create a new Web Service**:
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
     - A backend web service using Gunicorn (free tier)
     - A frontend static site (free tier)

## Gunicorn Configuration

Your app is configured with the following Gunicorn settings in the Procfile:

```
web: gunicorn --workers=2 --threads=4 --worker-class=gthread --bind 0.0.0.0:$PORT run:app
```

These settings are optimized for Render's free tier:

- **2 workers**: Good balance for the free tier's resources
- **4 threads per worker**: Allows handling more concurrent requests
- **gthread worker class**: Thread-based workers for better performance
- **Binding to $PORT**: Uses the port provided by Render's environment

## Maximizing Free Tier Performance

1. **Cold Starts**:
   - Free tier services spin down after 15 minutes of inactivity
   - First request after inactivity may take 30-60 seconds
   - Subsequent requests will be fast due to Gunicorn's efficiency

2. **Keep Your Service Active**:
   - Use a service like [UptimeRobot](https://uptimerobot.com) to ping your app every 14 minutes
   - This prevents the service from spinning down
   - Set up a monitor to ping your backend URL: `https://quiz-app-backend.onrender.com/api/quizzes/`

3. **Database Optimization**:
   - Use efficient queries to minimize database load
   - The free PostgreSQL instance has limited resources

## Troubleshooting Gunicorn Issues

If you encounter issues with Gunicorn:

1. **Check Render Logs**:
   - Go to your backend service in the Render dashboard
   - Click on "Logs" to see Gunicorn's output
   - Look for errors or warnings

2. **Common Issues**:
   - **Worker Timeout**: If requests take too long, workers might time out
   - **Memory Limits**: Free tier has memory limitations
   - **Module Not Found**: Check your import statements

3. **Solutions**:
   - Reduce the number of workers if you're hitting memory limits
   - Optimize database queries for faster response times
   - Make sure all dependencies are in requirements.txt

## Monitoring Your Deployment

Render provides basic monitoring for free tier services:

1. **Health Checks**:
   - Your service is configured with a health check at `/api/quizzes/`
   - Render will restart the service if health checks fail

2. **Logs**:
   - Check logs regularly for errors or performance issues
   - Gunicorn logs worker activity and request handling

3. **Metrics**:
   - Basic metrics are available in the Render dashboard
   - Monitor CPU and memory usage 