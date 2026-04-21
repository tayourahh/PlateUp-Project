# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.status_code = 200
        return response

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY!")
    
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

def get_current_user():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        response = supabase.auth.get_user(token)
        return response.user
    except Exception as e:
        print(f"Auth error: {e}")
        return None

def require_auth(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(user, *args, **kwargs)
    return decorated

@app.route('/api/profile', methods=['GET'])
@require_auth
def get_profile(user):
    result = supabase.table('profiles') \
        .select('*').eq('id', user.id).single().execute()
    return jsonify(result.data)

@app.route('/api/profile', methods=['PATCH'])
@require_auth
def update_profile(user):
    body = request.get_json()
    allowed_fields = {'full_name', 'phone_number'}
    update_data = {k: v for k, v in body.items() if k in allowed_fields}
    result = supabase.table('profiles') \
        .update(update_data).eq('id', user.id).execute()
    return jsonify(result.data)

# Debug import surplus
try:
    from routes.surplus import register_surplus_routes
    register_surplus_routes(app, supabase, require_auth)
    print("[OK] Surplus routes registered successfully")
except Exception as e:
    import traceback
    print(f"[ERROR] Failed to import surplus routes: {type(e).__name__}: {e}")
    traceback.print_exc()

# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Flask is running'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)