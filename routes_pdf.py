import os
import re
import math
from flask import jsonify, request
import pypdf
from config import app, client_llm, MODEL_NAME

# ==========================================
# KONFIGURASI & VARIABEL GLOBAL
# ==========================================
PDF_PATH = os.path.join(app.root_path, 'static', 'dokumen.pdf')
pdf_pages = []  # List of dict: {"page_num": int, "text": str}
pdf_text_full = ""

# ==========================================
# EKSTRAKSI DOKUMEN PDF (STARTUP INDEXING)
# ==========================================
def init_pdf_processing():
    global pdf_pages, pdf_text_full
    if not os.path.exists(PDF_PATH):
        print(f"[PDF Init] Warning: File tidak ditemukan di {PDF_PATH}")
        return

    try:
        print(f"[PDF Init] Memulai ekstraksi teks dari {PDF_PATH}...")
        reader = pypdf.PdfReader(PDF_PATH)
        temp_pages = []
        full_txt = ""

        for idx, page in enumerate(reader.pages):
            page_num = idx + 1
            text = page.extract_text() or ""
            # Bersihkan whitespace berlebih
            text = re.sub(r'\s+', ' ', text).strip()
            temp_pages.append({
                "page_num": page_num,
                "text": text
            })
            full_txt += f"\n--- Halaman {page_num} ---\n{text}"

        pdf_pages = temp_pages
        pdf_text_full = full_txt
        print(f"[PDF Init] Sukses mengekstrak {len(pdf_pages)} halaman dari dokumen.pdf")
    except Exception as e:
        print(f"[PDF Init] Gagal mengekstrak PDF: {str(e)}")

# Jalankan inisialisasi ekstraksi saat modul di-import
init_pdf_processing()

# ==========================================
# MESIN PENCARI RAG RINGAN (KEYWORD MATCHING)
# ==========================================
def retrieve_relevant_pages(query, top_k=3):
    """
    Melakukan pencarian kata kunci yang relevan dari dokumen skripsi.
    Menggunakan pencocokan kemiripan frekuensi term sederhana (TF-IDF minimal) di Python.
    """
    if not pdf_pages:
        return []

    # Tokenisasi query
    query_words = re.findall(r'\b\w+\b', query.lower())
    # Saring stop words bahasa Indonesia sederhana
    stopwords = {
        'dan', 'di', 'yang', 'untuk', 'dari', 'ini', 'itu', 'ke', 'adalah', 'dengan',
        'pada', 'sebagai', 'saya', 'kami', 'atau', 'dalam', 'bisa', 'akan', 'ada',
        'oleh', 'juga', 'oleh', 'sebuah', 'ia', 'telah'
    }
    keywords = [w for w in query_words if w not in stopwords and len(w) > 2]

    if not keywords:
        keywords = query_words  # Fallback ke semua kata jika kosong

    scored_pages = []
    for page in pdf_pages:
        text_lower = page["text"].lower()
        score = 0
        match_count = 0

        for kw in keywords:
            # Berikan bobot lebih untuk frekuensi kemunculan kata kunci
            matches = len(re.findall(re.escape(kw), text_lower))
            if matches > 0:
                match_count += 1
                # Menggunakan logaritma frekuensi untuk mencegah dominasi berlebih
                score += (1 + math.log(matches)) * 1.5

        # Normalisasi panjang dokumen: kurangi skor sedikit untuk halaman yang terlalu panjang
        # agar halaman pendek yang fokus tidak tenggelam.
        if score > 0:
            doc_len = len(text_lower)
            length_penalty = math.log(doc_len) if doc_len > 0 else 1
            score = score / length_penalty
            # Tambahkan bonus jika halaman memuat banyak kata kunci yang unik
            score += (match_count * 0.8)

            scored_pages.append({
                "page_num": page["page_num"],
                "text": page["text"],
                "score": score
            })

    # Urutkan berdasarkan skor tertinggi
    scored_pages.sort(key=lambda x: x["score"], reverse=True)
    return scored_pages[:top_k]

# ==========================================
# ENDPOINT API
# ==========================================

@app.route("/api/pdf/outline", methods=["GET"])
def get_pdf_outline():
    """
    Mengembalikan outline bab skripsi beserta ringkasan statis 
    dan halaman rujukan untuk accordion.
    """
    outline = [
        {
            "id": "bab1",
            "title": "Bab I: Pendahuluan",
            "page": 10,
            "summary": [
                "Latar Belakang: Tingginya angka pengangguran terdidik akibat keterbatasan ketersediaan lapangan kerja dan adanya mismatch (ketidaksesuaian) antara lulusan perguruan tinggi dengan kebutuhan industri, yang mendorong fenomena peralihan pekerja ke sektor informal (necessity entrepreneurship). Kondisi lokal Kelurahan Argosari, Samboja, dijadikan objek penelitian karena mengalami ketimpangan ekonomi serta dampak lingkungan akibat aktivitas tambang batubara yang merusak lahan pertanian warga, di mana sektor UMKM berpotensi menjadi penyerap tenaga kerja namun belum memiliki pemetaan rantai nilai (value chain) yang jelas.",
                "Fokus Wilayah: Penelitian secara spesifik mengambil lokasi di Kelurahan Argosari, Kecamatan Samboja, Kabupaten Kutai Kartanegara, Kalimantan Timur.",
                "Solusi & Tujuan Akhir: Mengembangkan aplikasi Web GIS yang mengintegrasikan basis data graf (Knowledge Graph) berbasis Neo4j untuk memetakan hubungan antar-aktor ekonomi, serta memanfaatkan Large Language Model (LLM) dengan framework RAG untuk menyediakan sistem pendukung keputusan (Decision Support System) yang interaktif dalam merumuskan strategi penciptaan nilai tambah ekonomi lokal."
            ],
            "sections": [
                {"label": "Latar Belakang", "page": 10},
                {"label": "Rumusan Masalah", "page": 15},
                {"label": "Batasan Penelitian", "page": 16},
                {"label": "Tujuan Penelitian", "page": 17},
                {"label": "Manfaat Penelitian", "page": 18}
            ]
        },
        {
            "id": "bab2",
            "title": "Bab II: Landasan Teori",
            "page": 20,
            "summary": [
                "Tinjauan Pustaka & Keaslian: Melakukan review terhadap penelitian terdahulu mengenai solusi pengangguran, sistem informasi geografis UMKM, serta penegasan posisi keaslian penelitian ini dalam peta keilmuan.",
                "Kecerdasan Buatan & NLP: Landasan teori mengenai Gen AI, LLM, Conversational Agent, Context Engineering, Prompting (Role-Play & Constrained), RAG, AEO, Semantic Search, dan Dialogue Management.",
                "Komputasi Spasial, Graf & Bisnis: Teori Web GIS (Geocoding, Spatial Reasoning, Buffering, Point in Polygon), Graph Database (Neo4j), REST API, Manajemen Bisnis (Value Chain Porter, JTBD, Multiplier Effect, Effectuation, LED), serta Pemodelan Sistem (DSS, Prototyping, UML, Flowchart, dan Black Box/Functional Testing)."
            ],
            "sections": [
                {"label": "Tinjauan Pustaka", "page": 20},
                {"label": "Keaslian Penelitian", "page": 26},
                {"label": "Kecerdasan Buatan dan Pemrosesan Bahasa Alami", "page": 29},
                {"label": "Sistem Informasi Geografis dan Komputasi Spasial", "page": 35},
                {"label": "Arsitektur Basis Data, Graf, dan Komputasi Jaringan", "page": 38},
                {"label": "Teori Manajemen Bisnis dan Ekonomi", "page": 44},
                {"label": "Rekayasa Perangkat Lunak dan Pemodelan Sistem", "page": 49}
            ]
        },
        {
            "id": "bab3",
            "title": "Bab III: Metodologi Penelitian",
            "page": 56,
            "summary": [
                "Metode Pengumpulan & Analisis Data: Menggunakan observasi, wawancara, komputasi kuantitatif, studi dokumentasi, analisis kebutuhan fungsional sistem (Web GIS, Polygon Drawing, Neo4j, Chatbot AI, AEO Links), dan logika aturan (spasial, relasional, AI).",
                "Pengembangan & Perancangan: Spesifikasi hardware/software, metode prototyping (identifikasi, prototipe awal, evaluasi, perbaikan, implementasi), serta pemodelan visual menggunakan UML Use Case dan Activity Diagram untuk manajemen profil, draw poligon, dan interaksi chatbot.",
                "Eksperimen & Pengujian: Rencana pengujian fungsional (Web GIS, Chatbot, AEO Links, evaluasi output LLM via metrik RAGAS) dan pengujian lapangan melalui penyuntikan data nyata, validasi geografi, serta simulasi job creation berdasarkan alur penelitian."
            ],
            "sections": [
                {"label": "Metode Penelitian", "page": 56},
                {"label": "Metode Pengumpulan Data", "page": 56},
                {"label": "Metode Analisis Data", "page": 66},
                {"label": "Metode Pengembangan Proses Perangkat Lunak", "page": 69},
                {"label": "Metode Perancangan", "page": 81},
                {"label": "Eksperimen dan Pengujian", "page": 93},
                {"label": "Alur Penelitian", "page": 97}
            ]
        },
        {
            "id": "bab4",
            "title": "Bab IV: Perancangan & Hasil",
            "page": None,
            "coming_soon": True,
            "summary": [
                "Bab ini masih dalam tahap penulisan dan belum tersedia di dalam dokumen.",
                "Akan memuat implementasi Neo4j Graph Database, visualisasi peta Leaflet, dan simulasi Job Creation.",
                "Estimasi tersedia setelah revisi dokumen final diselesaikan."
            ],
            "sections": []
        }
    ]
    return jsonify(outline)


@app.route("/api/pdf/chat", methods=["POST"])
def pdf_chat():
    """
    Endpoint RAG Chat dengan Persona penulis "Talk to the Author".
    """
    data = request.json or {}
    user_message = data.get("message", "").strip()
    history = data.get("history", [])

    if not user_message:
        return jsonify({"error": "Pesan tidak boleh kosong"}), 400

    # Ambil konteks halaman yang relevan
    relevant_pages = retrieve_relevant_pages(user_message, top_k=3)
    
    if not relevant_pages:
        # Jika tidak ada halaman relevan yang terdeteksi secara keyword, gunakan ringkasan umum
        context = "Dokumen Skripsi: Rancang Bangun Aplikasi Web GIS Berbasis Knowledge Graph dan LLM untuk Identifikasi Value Chain Ekosistem Pencipta Kerja Studi Kasus Samboja oleh Bayu Dwi Prasetyo."
        pages_cited = []
    else:
        context = ""
        pages_cited = []
        for p in relevant_pages:
            context += f"\n[Halaman {p['page_num']}]\n{p['text']}\n"
            pages_cited.append(p['page_num'])

    # Format history percakapan untuk LLM
    messages = [
        {
            "role": "system",
            "content": f"""Anda adalah Bayu Dwi Prasetyo (NIM: 2211080), mahasiswa S1 Informatika Universitas Mulia Balikpapan sekaligus peneliti dan penulis proposal skripsi ini.
Anda harus menjawab pertanyaan tentang penelitian skripsi Anda dengan nada akademis, cerdas, ramah, dan profesional, seolah-olah Anda sedang memaparkan dan mempertahankan proposal Anda di hadapan Dosen Penguji.

Gunakan informasi dari dokumen skripsi Anda berikut ini untuk menjawab pertanyaan:
------------------------
{context}
------------------------

ATURAN PENTING:
1. Jawablah seolah-olah Anda adalah penulisnya (gunakan kata 'Saya', 'Penelitian saya', atau 'Skripsi saya').
2. Di akhir kalimat atau klausa yang merujuk informasi dari dokumen, sebutkan referensi halaman dalam format [Halaman X] (contoh: "...menggunakan Effectuation Theory untuk pemetaan potensi lokal [Halaman 39].").
3. Hubungkan teori-teori dalam skripsi Anda seperti Effectuation Theory, Jobs-to-be-Done (JTBD), Knowledge Graph (Neo4j), Web GIS (Leaflet), dan LLM untuk menjawab.
4. Jika pertanyaan di luar lingkup skripsi Anda, jawablah secara sopan bahwa hal tersebut di luar fokus penelitian Anda di Kelurahan Argosari.
"""
        }
    ]

    # Tambahkan riwayat percakapan (maksimal 6 interaksi terakhir agar efisien)
    for h in history[-6:]:
        messages.append({"role": h.get("role"), "content": h.get("content")})

    # Tambahkan pesan user saat ini
    messages.append({"role": "user", "content": user_message})

    try:
        # Hubungkan ke OpenAI/Maiarouter client_llm dari config.py
        response = client_llm.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.3
        )
        ai_response = response.choices[0].message.content
        return jsonify({
            "response": ai_response,
            "pages_cited": pages_cited
        })
    except Exception as e:
        print(f"[PDF Chat] Error calling LLM: {str(e)}")
        # Fallback response jika API mengalami kendala
        fallback_text = (
            f"Terima kasih atas pertanyaannya. Berdasarkan draf skripsi saya, "
            f"penelitian ini berfokus pada Rancang Bangun Web GIS berbasis Knowledge Graph dan LLM "
            f"di Kelurahan Argosari [Halaman 3]. Terjadi kendala teknis saat menghubungkan ke AI Engine, "
            f"namun secara konsep hal ini ditujukan untuk memetakan rantai nilai ekosistem pencipta kerja."
        )
        return jsonify({
            "response": fallback_text,
            "pages_cited": [3]
        })


@app.route("/api/pdf/quick-summary", methods=["POST"])
def pdf_quick_summary():
    """
    Endpoint untuk ringkasan cepat:
    - Ringkas Halaman Ini
    - Temukan Temuan Utama
    """
    data = request.json or {}
    action_type = data.get("type", "document")
    page_num = data.get("page_num", 1)

    try:
        if action_type == "page":
            # Temukan teks halaman spesifik
            page_data = next((p for p in pdf_pages if p["page_num"] == page_num), None)
            if not page_data:
                return jsonify({"summary": "Halaman tidak ditemukan."}), 404
            
            prompt = (
                f"Ringkaslah isi halaman {page_num} berikut ini dari dokumen skripsi Bayu Dwi Prasetyo "
                f"menjadi 3-4 poin bullet penting dan akademis dalam bahasa Indonesia:\n\n{page_data['text']}"
            )
        elif action_type == "findings":
            prompt = (
                "Berdasarkan teks berikut, rumuskan 4 poin temuan utama, kebaruan (novelty), atau kontribusi "
                "terpenting dari penelitian skripsi Bayu Dwi Prasetyo:\n\n"
                f"{pdf_text_full[:8000]}"  # Kirim subset halaman awal/daftar isi/latar belakang untuk menghemat token
            )
        else: # Full document summary
            prompt = (
                "Berikan ringkasan eksekutif komprehensif tentang rancangan penelitian skripsi Bayu Dwi Prasetyo "
                "dalam 3 paragraf rapi. Bahas latar belakang, metodologi, dan tujuan akhirnya:\n\n"
                f"{pdf_text_full[:8000]}"
            )

        response = client_llm.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "Anda adalah asisten akademik cerdas yang merangkum hasil penelitian skripsi."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        summary = response.choices[0].message.content
        return jsonify({"summary": summary})

    except Exception as e:
        print(f"[PDF Summary] Error: {str(e)}")
        return jsonify({
            "summary": "Gagal menghasilkan ringkasan secara otomatis karena kendala koneksi AI. Silakan coba beberapa saat lagi."
        })
