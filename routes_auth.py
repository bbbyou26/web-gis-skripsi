"""
routes_auth.py — Autentikasi & Manajemen Profil Pengguna
=========================================================
Menangani:
  - Halaman utama (map, workspace, auth)
  - Login / Register / Logout
  - Update profil (nama & foto)
"""
import os
import uuid
import base64
from datetime import datetime

from flask import render_template, redirect, url_for, session, request, jsonify
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

from config import app, users_collection


# ---------------------------------------------------------------
# HELPER: Ambil Data User dari Sesi
# ---------------------------------------------------------------
def get_current_user_data():
    """Kembalikan dict {name, foto_base64} atau None jika belum login."""
    user_akun = session.get("user")
    if not user_akun:
        return None

    user_doc = users_collection.find_one({"nama_akun": user_akun})
    if not user_doc:
        return None

    b64_foto = user_doc.get("foto", "")
    if b64_foto.startswith("uploads/"):
        foto_path = os.path.join(app.config['UPLOAD_FOLDER'], os.path.basename(b64_foto))
        if os.path.exists(foto_path):
            with open(foto_path, "rb") as img:
                b64_foto = base64.b64encode(img.read()).decode('utf-8')
        else:
            b64_foto = ""

    return {"name": user_doc.get("nama", user_akun), "foto": b64_foto}


# ---------------------------------------------------------------
# HALAMAN UTAMA
# ---------------------------------------------------------------
@app.route("/map.html")
def app_page():
    user_data = get_current_user_data()
    if not user_data:
        return redirect(url_for("index"))
    return render_template("map.html", user=user_data)




@app.route("/")
@app.route("/index.html")
def index():
    return render_template("index.html")

@app.route("/beranda.html")
def beranda():
    return render_template("beranda.html")

@app.route("/tentang.html")
def tentang():
    return render_template("tentang.html")

@app.route("/soon.html")
def soon():
    return render_template("soon.html")
  
@app.route("/auth")
def auth_page():
    return render_template("auth.html")


@app.route("/login_page")
def login_page():
    return redirect(url_for("auth_page", **request.args))


# ---------------------------------------------------------------
# AUTH: LOGIN & REGISTER
# ---------------------------------------------------------------
@app.route("/login", methods=["POST"])
def login_user():
    nama_akun = request.form.get("nama_akun")
    password  = request.form.get("password")
    user      = users_collection.find_one({"nama_akun": nama_akun})

    if not user:
        return redirect(url_for("login_page", error="user_not_found"))

    if check_password_hash(user["password"], password):
        session["user"] = nama_akun
        return redirect(url_for("app_page"))

    return redirect(url_for("login_page", error="wrong_password"))


@app.route("/register", methods=["POST"])
def register_user():
    nama_akun = request.form.get("nama_akun")
    nama      = request.form.get("nama")
    password  = request.form.get("password")

    if not nama_akun or not password or not nama:
        return redirect(url_for("login_page", error="register_field_invalid"))

    if users_collection.find_one({"nama_akun": nama_akun}):
        return redirect(url_for("login_page", error="register_name_used"))

    foto      = request.files.get("foto")
    b64_foto  = ""
    if foto and foto.filename != "":
        b64_foto = base64.b64encode(foto.read()).decode('utf-8')

    users_collection.insert_one({
        "nama_akun":  nama_akun,
        "nama":       nama,
        "password":   generate_password_hash(password),
        "foto":       b64_foto,
        "created_at": datetime.utcnow()
    })
    return redirect(url_for("login_page", error="register_success"))


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login_page"))


# ---------------------------------------------------------------
# PROFIL: UPDATE NAMA & FOTO
# ---------------------------------------------------------------
@app.route("/api/user/update", methods=["POST"])
def update_user_profile():
    nama_akun = session.get("user")
    if not nama_akun:
        return jsonify({"error": "Unauthorized"}), 401

    nama        = request.form.get("nama")
    foto        = request.files.get("foto")
    update_data = {}

    if nama:
        update_data["nama"] = nama

    if foto and foto.filename != "":
        update_data["foto"] = base64.b64encode(foto.read()).decode('utf-8')

    if update_data:
        users_collection.update_one({"nama_akun": nama_akun}, {"$set": update_data})
        return jsonify({"success": True})

    return jsonify({"error": "No data provided"}), 400
