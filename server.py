"""
server.py — Entry Point Utama Flask Server
==========================================
Cukup jalankan: python server.py

Arsitektur modul:
  config.py           → inisialisasi Flask, DB, OpenAI, Neo4j
  ai_engine.py        → engine AI: LLM, chart, predictor, simulator
  routes_auth.py      → autentikasi (login/register/logout/profil)
  routes_actors.py    → CRUD aktor Neo4j + embedding
  routes_spatial.py   → Spatial AI Chatbot
"""
from config import app

# Import semua modul route agar route-nya terdaftar ke `app`
import routes_auth       
import routes_actors     
import routes_spatial    

# ===============================
# RUN SERVER
# ===============================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
