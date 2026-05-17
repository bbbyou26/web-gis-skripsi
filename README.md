# 🗺️ Web-GIS AI: Identifikasi Value Chain Ekosistem Pencipta Kerja

<p align="center">
  <img src="https://img.shields.io/badge/Framework-Flask-blue?style=for-the-badge&logo=python" alt="Framework">
  <img src="https://img.shields.io/badge/AI--Engine-LLM%20%7C%20Ragas-orange?style=for-the-badge&logo=openai" alt="AI Engine">
  <img src="https://img.shields.io/badge/GIS-Leaflet.js-green?style=for-the-badge&logo=scipy" alt="GIS">
</p>

<p align="center">
  <strong>Sistem Informasi Geografis Berbasis Knowledge Graph dan LLM untuk Pemetaan Potensi Wilayah dan Solusi Stimulus Lapangan Kerja.</strong>
</p>

---

### 📌 Ringkasan Eksekutif
Aplikasi Web-GIS ini mengintegrasikan analisis data spasial dengan kecerdasan buatan (**AI Engine**). Sistem tidak hanya berfungsi sebagai alat pemetaan visual standar, melainkan didesain sebagai *Decision Support System* (DSS) untuk mendeteksi rantai nilai (*value chain*) daerah demi mendorong pertumbuhan ekonomi dan membuka lapangan pekerjaan baru.

---

## 🛠️ Arsitektur & Fungsi Sistem

Sistem ini dibangun dengan pendekatan modular. Klik pada masing-masing komponen di bawah ini untuk melihat detail fungsinya:

<details>
<summary><b>🧠 Inti Aplikasi & Engine AI</b></summary>
<br>

* **`server.py` & `config.py`**
    * Pusat kendali utama eksekusi program.
    * Manajemen *environment variables* dan konfigurasi basis data global.
* **`ai_engine.py`**
    * Otak AI yang memproses *Knowledge Graph* dan LLM.
    * Menghasilkan rekomendasi keputusan ekonomi secara kontekstual.
</details>

<details>
<summary><b>🌐 Modul Spasial & Validasi (Web-GIS)</b></summary>
<br>

* **`routes_spatial.py`**
    * *Engine* pemetaan interaktif menggunakan Leaflet.js.
    * Mengolah visualisasi, manipulasi, dan analisis data geografis/spasial fisik wilayah.
* **`routes_ragas.py`**
    * Framework **Ragas Evaluation**.
    * Memvalidasi akurasi dan relevansi output AI untuk memastikan rekomendasi bebas dari halusinasi data.
</details>

<details>
<summary><b>👥 Gerbang Akses & Interface</b></summary>
<br>

* **`routes_actors.py` & `routes_auth.py`**
    * Manajemen hak akses aktor (Masyarakat, Investor, Pemerintah).
    * Sistem autentikasi keamanan token/session.
* **`templates/` & `static/`**
    * Aset antarmuka (UI/UX) web (`beranda.html`) yang responsif.
</details>

---

## 💼 Solusi Ekonomi & Penciptaan Lapangan Kerja

Sistem ini mengonversi data spasial mentah menjadi peluang ekonomi riil melalui 4 pilar intervensi:
