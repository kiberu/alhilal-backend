"""
Common views for the Alhilal application
"""
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Health check endpoint for monitoring
    """
    return JsonResponse({
        'status': 'healthy',
        'service': 'alhilal-backend',
        'version': '1.0.0'
    })


@csrf_exempt
@require_http_methods(["GET"])
def api_root(request):
    """
    API documentation landing page
    """
    base_url = request.build_absolute_uri('/').rstrip('/')
    
    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alhilal Travels API</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #333;
                line-height: 1.6;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }}
            .container {{
                max-width: 900px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                padding: 50px;
            }}
            h1 {{
                color: #667eea;
                font-size: 3em;
                margin-bottom: 10px;
                text-align: center;
            }}
            .subtitle {{
                text-align: center;
                color: #666;
                font-size: 1.2em;
                margin-bottom: 40px;
            }}
            .docs-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 40px 0;
            }}
            .doc-card {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 15px;
                text-decoration: none;
                transition: transform 0.3s, box-shadow 0.3s;
                text-align: center;
            }}
            .doc-card:hover {{
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            }}
            .doc-card h3 {{
                font-size: 1.5em;
                margin-bottom: 10px;
            }}
            .doc-card p {{
                opacity: 0.9;
                font-size: 0.95em;
            }}
            .features {{
                background: #f8f9fa;
                padding: 30px;
                border-radius: 15px;
                margin: 30px 0;
            }}
            .features h2 {{
                color: #667eea;
                margin-bottom: 20px;
            }}
            .features ul {{
                list-style: none;
                padding-left: 0;
            }}
            .features li {{
                padding: 10px 0;
                padding-left: 30px;
                position: relative;
            }}
            .features li:before {{
                content: "✓";
                position: absolute;
                left: 0;
                color: #667eea;
                font-weight: bold;
                font-size: 1.2em;
            }}
            .endpoints {{
                margin: 30px 0;
            }}
            .endpoint {{
                background: #f8f9fa;
                padding: 15px;
                border-radius: 10px;
                margin: 10px 0;
                font-family: 'Courier New', monospace;
                border-left: 4px solid #667eea;
            }}
            .footer {{
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #f0f0f0;
                color: #666;
            }}
            .badge {{
                background: #28a745;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 0.85em;
                display: inline-block;
                margin-bottom: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🕌 Alhilal Travels API</h1>
            <div class="subtitle">Pilgrimage Management System API v1.0.0</div>
            <div style="text-align: center;">
                <span class="badge">✓ Online</span>
            </div>
            
            <div class="docs-grid">
                <a href="{base_url}/api/docs/" class="doc-card">
                    <h3>📖 Swagger UI</h3>
                    <p>Interactive API documentation with try-it-out functionality</p>
                </a>
                <a href="{base_url}/api/redoc/" class="doc-card">
                    <h3>📚 ReDoc</h3>
                    <p>Clean, responsive API documentation</p>
                </a>
                <a href="{base_url}/api/schema/" class="doc-card">
                    <h3>🔗 OpenAPI Schema</h3>
                    <p>Download raw OpenAPI specification (JSON)</p>
                </a>
            </div>
            
            <div class="features">
                <h2>🚀 Features</h2>
                <ul>
                    <li>🕌 Trip & Package Management</li>
                    <li>👥 Pilgrim Information Management</li>
                    <li>📋 Booking & Payment Tracking</li>
                    <li>📄 Document Management (Passports & Visas)</li>
                    <li>📚 Content Management (Duas & Itineraries)</li>
                    <li>🔐 JWT Authentication</li>
                    <li>🔒 End-to-end Encryption for Sensitive Data</li>
                    <li>📊 Admin Dashboard Integration</li>
                </ul>
            </div>
            
            <div class="endpoints">
                <h2 style="color: #667eea; margin-bottom: 15px;">🔑 Quick Start</h2>
                <p style="margin-bottom: 15px;">Main API endpoints:</p>
                <div class="endpoint">
                    <strong>Authentication:</strong> POST /api/v1/auth/login/
                </div>
                <div class="endpoint">
                    <strong>Trips:</strong> GET /api/v1/trips/
                </div>
                <div class="endpoint">
                    <strong>Bookings:</strong> GET /api/v1/bookings/
                </div>
                <div class="endpoint">
                    <strong>Admin Panel:</strong> GET /admin/
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Alhilal Travels</strong></p>
                <p>🌐 <a href="https://alhilaltravels.com" style="color: #667eea; text-decoration: none;">alhilaltravels.com</a></p>
                <p>📧 info@alhilaltravels.com</p>
                <p style="margin-top: 10px; font-size: 0.9em;">© 2025 Alhilal Travels. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html)
