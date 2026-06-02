import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List


class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")

    def send_recap(
        self,
        recipient_emails: List[str],
        subject: str,
        markdown_content: str
    ) -> None:
        msg = MIMEMultipart("alternative")
        msg["From"] = self.smtp_user
        msg["To"] = ", ".join(recipient_emails)
        msg["Subject"] = subject

        msg.attach(MIMEText(markdown_content, "plain", "utf-8"))

        try:
            import markdown
            html_content = markdown.markdown(
                markdown_content,
                extensions=["fenced_code", "tables"]
            )
            
            html_template = f"""
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }}
                    .content {{
                        background: white;
                        padding: 30px;
                        border-radius: 15px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    }}
                    h1 {{ color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px; }}
                    h2 {{ color: #764ba2; margin-top: 30px; }}
                    h3 {{ color: #5a67d8; }}
                    blockquote {{
                        border-left: 4px solid #667eea;
                        padding-left: 15px;
                        margin: 20px 0;
                        color: #666;
                        font-style: italic;
                        background: #f7fafc;
                        padding: 15px;
                        border-radius: 0 8px 8px 0;
                    }}
                    code {{ background: #f7fafc; padding: 2px 6px; border-radius: 4px; }}
                    .footer {{
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e2e8f0;
                        text-align: center;
                        color: #718096;
                        font-size: 0.9em;
                    }}
                </style>
            </head>
            <body>
                <div class="content">
                    {html_content}
                    <div class="footer">
                        🎲 本战报由TRPG史诗纪要生成器自动生成<br>
                        记录每一次难忘的冒险旅程
                    </div>
                </div>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(html_template, "html", "utf-8"))
        except ImportError:
            pass

        with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)
