from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import bcrypt
from supabase import create_client
import os, uuid

auth_bp = Blueprint("auth", __name__)

def get_supabase():
    return create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "buyer")  # buyer atau mitra
    full_name = data.get("full_name")

    if not email or not password:
        return jsonify({"error": "Email dan password wajib diisi"}), 400

    # Hash password — NEVER store plaintext
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    supabase = get_supabase()
    try:
        result = supabase.table("users").insert({
            "email": email,
            "password_hash": password_hash,
            "role": role,
            "full_name": full_name
        }).execute()
        
        user = result.data[0]
        token = create_access_token(identity={"id": user["id"], "role": user["role"]})
        return jsonify({"token": token, "user": {"id": user["id"], "email": user["email"], "role": user["role"]}}), 201

    except Exception as e:
        # Email duplicate akan trigger unique constraint error dari Postgres
        return jsonify({"error": "Email sudah terdaftar"}), 409

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("email", email).execute()

    if not result.data:
        return jsonify({"error": "Email atau password salah"}), 401

    user = result.data[0]

    # bcrypt.checkpw membandingkan input dengan hash — ini satu-satunya cara yang benar
    if not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
        return jsonify({"error": "Email atau password salah"}), 401

    token = create_access_token(identity={"id": user["id"], "role": user["role"]})
    return jsonify({"token": token, "user": {"id": user["id"], "email": user["email"], "role": user["role"]}}), 200