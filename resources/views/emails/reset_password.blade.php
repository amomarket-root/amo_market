<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Reset Your Password - Amo Market</title>
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
            font-size: 26px;
            font-weight: 600;
            margin-bottom: 25px;
            color: #333;
            text-align: center;
        }

        h3 {
            font-weight: 400;
            font-size: 16px;
            color: #555;
            margin-bottom: 25px;
            line-height: 1.6;
        }

        p {
            font-size: 14px;
            color: #555;
            margin: 15px 0;
            line-height: 1.6;
        }

        a {
            color: #9F63FF;
            text-decoration: none;
            font-weight: 500;
        }

        .amo {
            color: #9F63FF;
            font-weight: 600;
        }

        .market {
            color: #2eee07;
            font-weight: 600;
        }

        .reset-link {
            display: inline-block;
            background-color: #9151f8;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 500;
            margin: 20px 0;
            transition: background-color 0.3s ease;
        }

        .reset-link:hover {
            background-color: #7a42c4;
        }

        .signature {
            margin-top: 30px;
            font-weight: 500;
            color: #333;
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
                font-size: 22px;
            }

            h3 {
                font-size: 15px;
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
                font-size: 20px;
            }

            h3 {
                font-size: 14px;
            }

            .reset-link {
                padding: 10px 20px;
                font-size: 14px;
            }
        }
    </style>
</head>

<body style="margin: 0; padding: 0;">
    <!-- Plain text fallback for non-HTML email clients -->
    <div class="plain-text">
        Amo Market Password Reset

        You are receiving this email because we received a password reset request for your account.

        To reset your password, click this link:
        {{ $reset_url }}

        If you did not request a password reset, no further action is required. If you have any concerns, please contact our support team at amomarket.supp@gmail.com.

        — Team Amo Market
    </div>

    <!--[if (gte mso 9)|(IE)]>
    <table width="600" align="center" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td>
    <![endif]-->

    <div class="container">
        <div class="logo-container">
            <img src="{{ asset('/image/amo_market_logo.webp') }}" alt="Amo Market Logo" class="logo" />
        </div>

        <h1><span class="amo">Amo</span><span class="market"> Market</span></h1>

        <h3>You are receiving this email because we received a password reset request for your account.</h3>

        <p style="text-align: center;">
            <a href="{{ $reset_url }}" class="reset-link">Reset Your Password</a>
        </p>

        <p>If you did not request a password reset, no further action is required. If you have any concerns, please contact our support team at <a href="mailto:amomarket.supp@gmail.com">amomarket.supp@gmail.com</a>.</p>

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
