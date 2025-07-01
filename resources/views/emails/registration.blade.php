<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Welcome to Amo Market</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

        /* Client-specific styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

        /* General styles */
        * {
            font-family: 'Poppins', sans-serif;
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: #f4f4f4;
            padding: 30px 10px;
            line-height: 1.6;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            padding: 40px 30px;
            border-radius: 10px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }

        .logo-container {
            text-align: center;
            margin-bottom: 25px;
        }

        .logo {
            max-width: 180px;
            height: auto;
        }

        h1 {
            text-align: center;
            margin-bottom: 20px;
            font-size: 28px;
        }

        h2 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 25px;
            color: #333;
            line-height: 1.4;
            text-align: center;
        }

        p {
            font-size: 15px;
            color: #555;
            margin: 15px 0;
            line-height: 1.6;
        }

        .credentials {
            background: #f9f9f9;
            padding: 15px 20px;
            border-left: 4px solid #9F63FF;
            border-radius: 6px;
            margin: 20px 0;
        }

        .credentials p {
            margin: 8px 0;
            font-size: 15px;
        }

        a {
            color: #9F63FF;
            text-decoration: none;
            font-weight: 500;
        }

        .signature {
            margin-top: 30px;
            font-weight: 500;
            color: #333;
        }

        .amo {
            color: #9F63FF;
            font-weight: 600;
        }

        .market {
            color: #2eee07;
            font-weight: 600;
        }

        /* Plain text fallback for non-HTML email clients */
        .plain-text {
            display: none;
            overflow: hidden;
            height: 0;
            max-height: 0;
            line-height: 0;
            mso-hide: all;
            width: 0;
            opacity: 0;
        }

        @media (max-width: 640px) {
            .container {
                padding: 30px 20px;
                margin: 0 15px;
            }

            .logo {
                max-width: 150px;
            }

            h1 {
                font-size: 24px;
            }

            h2 {
                font-size: 20px;
            }

            p, .credentials p {
                font-size: 14px;
            }
        }

        @media (max-width: 480px) {
            body {
                padding: 20px 5px;
            }

            .container {
                padding: 25px 15px;
            }

            .logo {
                max-width: 120px;
            }

            h1 {
                font-size: 22px;
            }

            .credentials {
                padding: 12px 15px;
            }
        }
    </style>
</head>

<body style="margin: 0; padding: 0;">
    <!-- Plain text fallback for non-HTML email clients -->
    <div class="plain-text">
        Welcome to Amo Market
        Thank you for signing up. We're excited to have you on board.

        Your login details:
        Email: {{ $email }}
        Password: {{ $maskedPassword }}

        Please keep these credentials secure and do not share them with anyone.
        If you didn't request this account, please contact our support team immediately at amomarket.supp@gmail.com.

        — Team Amo Market
    </div>

    <!--[if (gte mso 9)|(IE)]>
    <table width="600" align="center" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td>
    <![endif]-->

    <div class="container">
        <div class="logo-container">
            <img src="{{ asset('/image/amo_market_logo.webp') }}" alt="Amo Market" class="logo" />
        </div>

        <h1>Welcome to <span class="amo">Amo</span><span class="market"> Market</span></h1>

        <p>Thank you for signing up. We're excited to have you on board. Below are your login details:</p>

        <div class="credentials">
            <p><strong>Email:</strong> <a href="mailto:{{ $email }}">{{ $email }}</a></p>
            <p><strong>Password:</strong> {{ $maskedPassword }}</p>
        </div>

        <p>Please keep these credentials secure and do not share them with anyone.</p>
        <p>If you didn't request this account, please contact our support team immediately at <a href="mailto:amomarket.supp@gmail.com">amomarket.supp@gmail.com</a>.</p>

        <p class="signature">
            — Team <span class="amo">Amo</span><span class="market"> Market</span>
        </p>
    </div>

    <!--[if (gte mso 9)|(IE)]>
            </td>
        </tr>
    </table>
    <![endif]-->
</body>
</html>
