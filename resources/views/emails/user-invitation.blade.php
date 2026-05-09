<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You are invited to join SARAH</title>
    <style>
        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f4f6fb;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            padding: 30px;
            text-align: center;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 2px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 16px;
        }
        .message {
            font-size: 14px;
            color: #536076;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .button {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
        }
        .footer a {
            color: #2563eb;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">SARAH</div>
        </div>
        <div class="content">
            <h1 class="greeting">Hello, {{ $user->name }}!</h1>
            <p class="message">
                You have been invited to join <strong>SARAH Command Center</strong>, our Smart Automated Response & Alerting Hub platform.
            </p>
            <p class="message">
                To complete your registration and set your password, please click the button below. This invitation link will expire in 48 hours.
            </p>
            <a href="{{ $inviteUrl }}" class="button">Accept Invitation</a>
            <p class="message" style="margin-bottom: 0;">
                If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p class="message" style="margin-top: 8px; font-size: 12px; word-break: break-all;">
                {{ $inviteUrl }}
            </p>
        </div>
        <div class="footer">
            <p>
                This invitation was sent to <strong>{{ $user->email }}</strong><br>
                If you didn't request this invitation, you can safely ignore this email.
            </p>
            <p style="margin-top: 12px;">
                &copy; {{ date('Y') }} PT Abhinawa Sumberdaya Asia. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>