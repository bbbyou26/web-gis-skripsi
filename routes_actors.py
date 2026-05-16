"""
routes_actors.py — API CRUD Aktor di Knowledge Graph Neo4j
===========================================================
Menangani:
  - POST /api/actor/save   : simpan/update aktor ke Neo4j + embedding
  - GET  /api/actors       : ambil semua aktor dari Neo4j
  - POST /api/actor/delete : hapus aktor dari Neo4j
  - GET  /api/health       : cek status server & model
"""
import json
import uuid

from flask import request, jsonify

from config import app, driver, client_embed, EMBED_MODEL


# ---------------------------------------------------------------
# HELPER: Buat Embedding Teks (Semantic Search)
# ---------------------------------------------------------------
def get_embedding(text: str) -> list:
    """Buat vector embedding dari teks menggunakan OpenAI Embeddings API."""
    response = client_embed.embeddings.create(model=EMBED_MODEL, input=text)
    return response.data[0].embedding


# ---------------------------------------------------------------
# SIMPAN / UPDATE AKTOR
# ---------------------------------------------------------------
@app.route("/api/actor/save", methods=["POST"])
def save_actor():
    data       = request.get_json()
    actor_id   = data.get("id", str(uuid.uuid4()))
    actor_type = data.get("type", "unknown")
    name       = data.get("name", "")
    lat        = data.get("lat")
    lng        = data.get("lng")

    # Filter field yang tidak relevan untuk teks
    exclude_keys = {
        "lat", "lng", "foto", "Foto Visual Path", "color", "warna", "Warna",
        "Titik Koordinat (Lat, Lon)", "icon", "id", "type", "timestamp", "Marker Type"
    }
    text_content = {k: v for k, v in data.items()
                    if k not in exclude_keys and not isinstance(v, list)}
    text_content.update({k: v for k, v in data.items()
                          if k not in exclude_keys and isinstance(v, list)})

    str_representation  = json.dumps(text_content, ensure_ascii=False)
    full_data_repr      = json.dumps(data, ensure_ascii=False)

    # Buat embedding (semantic search)
    try:
        embedding = get_embedding(str_representation)
    except Exception as e:
        print(f"[routes_actors] Embedding failed: {e}")
        embedding = None

    # Simpan ke Neo4j (MERGE = insert or update)
    query = """
    MERGE (a:Actor {id: $act_id})
    SET a.type      = $act_type,
        a.name      = $name,
        a.lat       = $lat,
        a.lng       = $lng,
        a.raw_data  = $raw_data,
        a.embedding = $embedding
    """
    with driver.session(database="pp1") as neo_session:
        neo_session.run(
            query,
            act_id=actor_id, act_type=actor_type, name=name,
            lat=lat, lng=lng, raw_data=full_data_repr, embedding=embedding
        )

    return jsonify({"success": True, "id": actor_id})


# ---------------------------------------------------------------
# AMBIL SEMUA AKTOR
# ---------------------------------------------------------------
@app.route("/api/actors", methods=["GET"])
def get_actors():
    query = """
    MATCH (a:Actor)
    RETURN a.id AS id, a.type AS type, a.name AS name,
           a.lat AS lat, a.lng AS lng, a.raw_data AS raw_data
    """
    actors = []
    try:
        with driver.session(database="pp1") as neo_session:
            for record in neo_session.run(query):
                raw = {}
                if record["raw_data"]:
                    try:
                        raw = json.loads(record["raw_data"])
                    except Exception:
                        pass
                actors.append({
                    "id":       record["id"],
                    "type":     record["type"],
                    "name":     record["name"],
                    "lat":      record["lat"],
                    "lng":      record["lng"],
                    "raw_data": raw,
                })
        return jsonify({"actors": actors})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------
# HAPUS AKTOR
# ---------------------------------------------------------------
@app.route("/api/actor/delete", methods=["POST"])
def delete_actor():
    actor_id = request.get_json().get("id")
    query    = "MATCH (a:Actor {id: $act_id}) DETACH DELETE a"
    with driver.session(database="pp1") as neo_session:
        neo_session.run(query, act_id=actor_id)
    return jsonify({"success": True})


# ---------------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    from config import MODEL_NAME, BASE_URL
    return jsonify({"status": "ok", "model": MODEL_NAME, "base_url": BASE_URL})


# ---------------------------------------------------------------
# AI ASSIST: VALUE CHAIN SUGGESTIONS
# ---------------------------------------------------------------
@app.route("/api/ai/suggest_value_chain", methods=["POST"])
def suggest_value_chain():
    from ai_engine import call_llm
    data            = request.get_json()
    business_name   = data.get("business_name", "Bisnis")
    business_field  = data.get("business_field", "Umum")
    section_label   = data.get("section_label", "Value Chain")
    notes           = data.get("notes", "")
    existing_points = data.get("existing_points", [])
    user_question   = data.get("question", "") # Pertanyaan spesifik dari user

    system_prompt = "Anda adalah pakar strategi bisnis senior dan konsultan Value Chain Porter."
    
    # Jika ada pertanyaan spesifik
    if user_question:
        user_prompt = f"""
Anda sedang membantu pemilik bisnis '{business_name}' ({business_field}) dalam sesi konsultasi untuk bagian '{section_label}'.

Poin-poin yang sudah ada saat ini:
{chr(10).join(['- ' + p for p in existing_points]) if existing_points else '(Belum ada poin)'}

Catatan bisnis: {notes}

Pertanyaan Pengguna: "{user_question}"

Instruksi:
1. Jawab pertanyaan pengguna secara profesional, cerdas, dan edukatif.
2. Jelaskan kegunaan poin yang mereka tanyakan dalam konteks strategi bisnis.
3. Berikan saran tambahan atau rekomendasi jika relevan.
4. Jawab dalam Bahasa Indonesia yang ringkas namun padat (maks 100 kata).
"""
    else:
        # Initial analysis (ketika pertama klik AI Assist)
        user_prompt = f"""
Berikan analisis singkat dan 3 rekomendasi strategis untuk bagian '{section_label}' bisnis '{business_name}' ({business_field}).

Poin saat ini:
{chr(10).join(['- ' + p for p in existing_points]) if existing_points else '(Belum ada poin)'}

Instruksi:
1. Jelaskan secara singkat mengapa bagian ini penting untuk bisnis mereka.
2. Berikan 3 rekomendasi baru yang bisa diterapkan.
3. Format rekomendasi dimulai dengan 'REKOMENDASI:' agar mudah dikenali.
4. Gunakan Bahasa Indonesia profesional.
"""
    
    try:
        response = call_llm(system_prompt, user_prompt, temperature=0.6)
        return jsonify({"answer": response})
    except Exception as e:
        print(f"[AI Consult] Error: {e}")
        return jsonify({"error": str(e)}), 500
