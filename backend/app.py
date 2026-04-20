from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
import os
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
CORS(app,
     origins=["http://localhost:3000"],
     supports_credentials=True,
     methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"]
)

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_KEY")
)

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

# ── Existing Routes ──────────────────────────────────────────────
@app.route('/api/profile', methods=['GET'])
@require_auth
def get_profile(user):
    result = supabase.table('profiles') \
        .select('*') \
        .eq('id', user.id) \
        .single() \
        .execute()
    return jsonify(result.data)

@app.route('/api/profile', methods=['PATCH'])
@require_auth
def update_profile(user):
    body = request.get_json()
    allowed_fields = {'full_name', 'phone_number'}
    update_data = {k: v for k, v in body.items() if k in allowed_fields}
    result = supabase.table('profiles') \
        .update(update_data) \
        .eq('id', user.id) \
        .execute()
    return jsonify(result.data)

# ── Register Surplus Routes ──────────────────────────────────────
# Import SETELAH app & supabase & require_auth didefinisikan
# untuk menghindari circular import
from routes.surplus import register_surplus_routes
register_surplus_routes(app, supabase, require_auth)

if __name__ == '__main__':
    app.run(debug=True, port=5000)