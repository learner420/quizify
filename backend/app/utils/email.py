import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

def send_email(to, subject, body):
    """
    Send an email using SMTP
    
    Args:
        to (str): Recipient email address
        subject (str): Email subject
        body (str): Email body content
    """
    # Get email configuration from environment variables
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.mailtrap.io')
    smtp_port = int(os.environ.get('SMTP_PORT', '2525'))
    smtp_username = os.environ.get('SMTP_USERNAME')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    # Check if we're in development mode
    is_development = os.environ.get('FLASK_ENV') == 'development'
    
    # If credentials are not set and we're in development, log the email instead of sending
    if not all([smtp_username, smtp_password]):
        if is_development:
            logging.info(f"Development mode: Email would be sent to {to}")
            logging.info(f"Subject: {subject}")
            logging.info(f"Body: {body}")
            print(f"\n----- EMAIL WOULD BE SENT -----")
            print(f"To: {to}")
            print(f"Subject: {subject}")
            print(f"Body: {body}")
            print(f"----- END OF EMAIL -----\n")
            return
        else:
            # For production, we still want to raise an error if credentials are missing
            raise ValueError("SMTP credentials not configured")
    
    # Create message
    msg = MIMEMultipart()
    msg['From'] = smtp_username
    msg['To'] = to
    msg['Subject'] = subject
    
    # Add body
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # Create SMTP session
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        
        # Send email
        server.send_message(msg)
        server.quit()
        
        if is_development:
            print(f"Email sent to {to} successfully")
    except Exception as e:
        if is_development:
            # In development, log the error but don't crash
            logging.error(f"Failed to send email: {str(e)}")
            print(f"Failed to send email: {str(e)}")
            print(f"Email would have been sent to: {to}")
            print(f"Subject: {subject}")
            return
        else:
            # In production, raise the exception
            raise Exception(f"Failed to send email: {str(e)}") 