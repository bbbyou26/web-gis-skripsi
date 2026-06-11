"""
routes_spatial.py — Spatial AI Chatbot
========================================================
Menangani endpoint:
  - POST /api/chat/spatial
"""
from flask import request, jsonify, session
import json
import re
from config import app, driver, HAS_GIS
from ai_engine import call_llm

@app.route("/api/chat/spatial", methods=["POST"])
def spatial_chat():
    """
    Chatbot Strategis: Fokus pada kecepatan dan ketepatan radius.
    Menghapus semua bottleneck pencarian yang lambat.
    """
    try:
        data               = request.get_json()
        prompt             = data.get("prompt", "")
        mode               = data.get("mode", "default")
        actors_in_radius   = data.get("actors", [])
        polygons_in_radius = data.get("polygons", [])
        pinned_center      = data.get("pinnedCenter")
        radius             = data.get("radius", 500)
        location_name      = data.get("location_name", "Area Target")

        # Authenticated User for DB Memory
        user_id = session.get("user") or session.get("moderator") or "guest_spatial"

        # ------------------------------------------------------------------
        # 1. KONSTRUKSI KONTEKS DATA (REAL-TIME)
        # ------------------------------------------------------------------
        context_text = f"### ANALISIS RADIUS ###\n"
        if pinned_center:
            lat = pinned_center.get('lat', 0)
            lng = pinned_center.get('lng', 0)
            context_text += f"- Lokasi Nyata: *{location_name}*\n"
            context_text += f"- Koordinat Pusat: {lat:.6f}, {lng:.6f}\n"
            context_text += f"- Jangkauan Radius: {radius} meter\n"
        context_text += "\n"

        
        if not actors_in_radius:
            context_text += "STATUS: Radius ini belum memiliki data aktor terpetakan.\n"
        else:
            context_text += f"STRUKTUR EKOSISTEM ({len(actors_in_radius)} entitas terdeteksi):\n"
            for a in actors_in_radius:
                name   = a.get('name', 'Unknown')
                a_type = a.get('type', 'Aktor')
                a_id   = a.get('id', '')
                context_text += f"- Nama: {name}, Tag AEO: [[{name}|{a_id}]] ({a_type})\n"


        # C. Prediction Trigger dihapus untuk realisme murni simulasi

        # ------------------------------------------------------------------
        # 3. SYSTEM PROMPT (Strategic & Professional)
        # ------------------------------------------------------------------
        system_prompt = (
            "Anda adalah Chatbot Strategis (Tool Cipta Kerja). "
            "Anda adalah AI Strategis yang memiliki memori jangka panjang dan kemampuan simulasi.\n\n"
            "INSTRUKSI EKSEKUSI:\n"
            "1. PERSONA: Penasihat Strategis Senior yang REALISTIS.\n"
            "4. VISUAL PREMIUM: Gunakan **Tabel Markdown** jika menyajikan perbandingan data.\n"
            "5. AEO LINKS (WAJIB): Ketika menyebutkan nama aktor, GUNAKAN HANYA 'Tag AEO' dari data (contoh: [[Nama|ID]]). JANGAN menulis ulang nama aktor secara terpisah (misal: jangan menulis '**Kopi Senja** [[Kopi Senja|ID]]').\n"
            "6. NO BRANDING: Dilarang menyebut kata 'Antigravity AI'.\n"
            "7. INFO SPASIAL: Selalu sebutkan titik koordinat dan radius jika tersedia di data. Format nama Lokasi Nyata HANYA dengan cetak miring (*Nama Lokasi*), jangan ditebalkan.\n"
        )

        user_prompt = f"DATA RADIUS:\n{context_text}\n\nPERINTAH USER: {prompt}"

        # Inject spesifik prompt berdasarkan mode (tanpa mengubah system_prompt)
        if mode != "default":
            # Manajemen Memori Lintas Sesi (Job Creation Context)
            history = session.get("job_creation_memory", [])
            # Tambahkan prompt user ke memori
            history.append({"mode": mode, "prompt": prompt})
            # Batasi memori max 5 iterasi terakhir agar token tidak bengkak
            history = history[-5:]
            session["job_creation_memory"] = history

            history_context = "\n[RIWAYAT KONTEKS IDE BISNIS / SUMBER DAYA]:\n"
            for h in history[:-1]:
                history_context += f"- Mode {h['mode'].upper()}: {h['prompt']}\n"
            if len(history) > 1:
                user_prompt = history_context + "\n" + user_prompt

            mode_instructions = {
                "sumber-daya": "FOKUS ANALISIS (Inventarisasi & Pemanfaatan):\n1. Lakukan inventarisasi aset secara detail pada produk/sumber daya yang disebutkan.\n2. Temukan 'Kekuatan Unik' dan potensi pemanfaatan segera yang praktis dan realistis tanpa modal besar.\n3. Hubungkan secara langsung dengan data Neo4j (aktor, lokasi) di radius ini untuk melihat siapa yang bisa menyediakan bahan atau menjadi mitra awal.",
                "identifikasi": "FOKUS ANALISIS (Permintaan & Kebutuhan Pasar):\n1. Tentukan secara praktis 'Profil Pembeli' potensial di sekitar lokasi/radius.\n2. Analisis 'Masalah & Harapan' calon pembeli, serta 'Dimensi Emosional' yang bisa diselesaikan oleh sumber daya ini.\n3. Manfaatkan aktor Neo4j di radius sebagai target pasar, calon pelanggan, atau pihak yang memiliki kebutuhan tersebut.",
                "analisis": "FOKUS ANALISIS (Teknis & Jembatan Operasional):\n1. Berikan alur kerja praktis dan langkah-langkah operasional yang realistis untuk mengeksekusi ide bisnis ini.\n2. Jelaskan 'Kebutuhan Alat & Bahan' secara detail.\n3. Kaitkan dengan aktor atau fasilitas di radius yang bisa dimanfaatkan untuk mendukung operasional (misalnya sebagai supplier atau tempat produksi).",
                "monetisasi": "FOKUS ANALISIS (Monetisasi & Model Pendapatan):\n1. Tentukan 'Sumber Uang' utama dan 'Strategi Harga' yang realistis sesuai dengan kondisi wilayah di radius ini.\n2. Berikan estimasi 'Unit Ekonomi' (seperti biaya produksi vs harga jual) untuk mengukur profitabilitas.\n3. Sebutkan aktor mana saja di lokasi yang bisa diubah menjadi pembeli/sumber pendapatan.",
                "model-bisnis": "FOKUS ANALISIS (Model Bisnis & Ekosistem):\n1. Rancang model bisnis yang tahan banting (survival economics) hingga skala menengah.\n2. Jelaskan bentuk 'Kemitraan' strategis yang bisa dijalin dengan aktor-aktor yang sudah ada di radius Neo4j.\n3. Jelaskan bagaimana ekosistem bisnis ini berputar dan saling mendukung antar aktor lokal.",
                "job-creation": "FOKUS ANALISIS (Penciptaan Lapangan Kerja):\n1. Daftarkan secara spesifik 'Pekerjaan Langsung' (misal: tukang, operator) dan 'Pekerjaan Tidak Langsung' (misal: kurir, supplier, admin) yang akan tercipta.\n2. Jelaskan bagaimana masyarakat sekitar atau calon pekerja di radius ini dapat diserap ke dalam ekosistem bisnis.\n3. Uraikan dampak ekonomi lokal dari terciptanya pekerjaan tersebut.",
                "skalabilitas": "FOKUS ANALISIS (Optimasi & Skalabilitas):\n1. Berikan strategi 'Optimasi' untuk memaksimalkan keuntungan dan efisiensi dari skala mikro.\n2. Jelaskan 'Rencana Ekspansi' dan skalabilitas bisnis ini ke depan (misal: dari lokal ke regional).\n3. Bagaimana infrastruktur dan aktor di radius ini dapat mendukung pertumbuhan bisnis tersebut."
            }
            if mode in mode_instructions:
                user_prompt += f"\n\n[INSTRUKSI MODE KHUSUS: {mode.upper()}]\nTolong FOKUSKAN jawaban Anda secara detail, realistis, dan praktis berdasarkan kerangka Job Creation:\n{mode_instructions[mode]}"
        else:
            # Jika mode default, reset memori job creation agar tidak bocor ke obrolan biasa
            if "job_creation_memory" in session:
                session.pop("job_creation_memory", None)

        # 4. PANGGIL LLM (Stateless untuk Kecepatan Real-Time)
        reply = call_llm(system_prompt=system_prompt, user_prompt=user_prompt, temperature=0.75)


        return jsonify({
            "success": True, 
            "reply": reply,
            "context": context_text
        })

    except Exception as e:
        print(f"[routes_spatial] Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/spatial/pin", methods=["POST"])
def save_spatial_pin():
    """Simpan pin secara ringan ke Neo4j."""
    data = request.get_json()
    if driver:
        with driver.session() as session:
            session.run("MATCH (f:FocusArea) DETACH DELETE f")
            session.run("CREATE (f:FocusArea {lat: $lat, lng: $lng, radius: $radius})",
                        lat=data.get("lat"), lng=data.get("lng"), radius=data.get("radius"))
    return jsonify({"success": True})

vcs_memory_store = [] # Use global store for memory to prevent Cookie Too Large (HTTP 431)

@app.route("/api/vcs/reset", methods=["POST"])
def reset_vcs():
    """Endpoint untuk mereset memori percakapan VCS."""
    global vcs_memory_store
    vcs_memory_store.clear()
    return jsonify({"success": True})

@app.route("/api/vcs/generate", methods=["POST"])
def generate_vcs():
    """Endpoint untuk menghasilkan Value Chain System (Primary & Support Activities) secara interaktif."""
    try:
        data = request.get_json()
        prompt = data.get("prompt", "")
        
        global vcs_memory_store
        history = vcs_memory_store
        
        if not history:
            system_prompt = (
                "Anda adalah AI Konsultan Bisnis Spesialis Value Chain System (VCS) dari Porter.\n"
                "Tugas Anda adalah merancang rantai nilai (Primary & Support Activities) secara detail untuk ide bisnis yang diberikan.\n"
                "Sertakan juga Strategi Peningkatan Margin yang praktis.\n"
                "Gunakan list (bullet points) atau paragraf.\n"
                "Buat struktur utama:\n"
                "1. Primary Activities\n"
                "2. Support Activities\n"
                "3. Margin Strategy"
            )
        else:
            system_prompt = (
                "Anda adalah AI Konsultan Bisnis. Ini adalah sesi diskusi lanjutan dengan pengguna mengenai analisis bisnis sebelumnya.\n"
                "Jawablah pertanyaan secara interaktif, natural, dan analitis layaknya konsultan sungguhan.\n"
                "JANGAN mengulangi format struktur rantai nilai (Primary/Support) secara keseluruhan jika tidak diminta.\n"
                "Fokus berikan solusi, taktik lanjutan, atau jawaban spesifik terhadap pertanyaan pengguna."
            )
        
        history_context = ""
        if history:
            history_context = "[RIWAYAT DISKUSI SEBELUMNYA]:\n"
            for h in history:
                history_context += f"User: {h['user']}\nAI: {h['bot']}\n\n"
        
        user_prompt = f"{history_context}[PERTANYAAN BARU]:\n{prompt}"
        
        reply = call_llm(system_prompt=system_prompt, user_prompt=user_prompt, temperature=0.75)
        
        # Simpan ke memori (batasi 5 putaran agar token tidak berlebih)
        history.append({"user": prompt, "bot": reply})
        vcs_memory_store = history[-5:]
        
        return jsonify({"success": True, "reply": reply})
    except Exception as e:
        print(f"[vcs_generate] Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
