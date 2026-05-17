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

<div align="center">

<table>
<tr>
<td align="center" style="padding:12px 40px; border:2px solid #4fc3f7; border-radius:10px;">
<b>DATA SPASIAL WILAYAH</b>
</td>
</tr>
</table>

<div style="color:#4fc3f7; font-size:22px;">&#8595;</div>

<table>
<tr>
<td align="center" style="padding:12px 40px; border:2px solid #4fc3f7; border-radius:10px;">
<b>ANALISIS AI • KNOWLEDGE GRAPH • LLM</b>
</td>
</tr>
</table>

<div style="color:#4fc3f7; font-size:22px;">&#8595;</div>

<table>
<tr>
<td align="center" style="padding:12px 40px; border:2px solid #4fc3f7; border-radius:10px;">
<b>VALIDASI OUTPUT AI (RAGAS)</b>
</td>
</tr>
</table>

<br>

<table>
<tr>

<td align="center" style="padding:0 20px;">
<div style="color:#4fc3f7; font-size:22px;">&#8595;</div>
<br>
<table>
<tr>
<td align="center" style="padding:10px 18px; border:2px solid #81d4fa; border-radius:10px;">
<b>POTENSI UMKM</b>
</td>
</tr>
</table>
</td>

<td align="center" style="padding:0 20px;">
<div style="color:#4fc3f7; font-size:22px;">&#8595;</div>
<br>
<table>
<tr>
<td align="center" style="padding:10px 18px; border:2px solid #4fc3f7; border-radius:10px;">
<b>INVESTASI STRATEGIS</b>
</td>
</tr>
</table>
</td>

<td align="center" style="padding:0 20px;">
<div style="color:#4fc3f7; font-size:22px;">&#8595;</div>
<br>
<table>
<tr>
<td align="center" style="padding:10px 18px; border:2px solid #29b6f6; border-radius:10px;">
<b>KEBIJAKAN PRESISI</b>
</td>
</tr>
</table>
</td>

</tr>
</table>

<div style="color:#4fc3f7; font-size:22px;">&#8595;</div>

<table>
<tr>
<td align="center" style="padding:14px 50px; border:3px solid #4fc3f7; border-radius:12px;">
<b>STRATEGI CIPTA LAPANGAN KERJA</b><br>
AI • GIS • SPATIAL INTELLIGENCE
</td>
</tr>
</table>

</div>


1. Inkubasi Wirausaha Lokal (UMKM)
Melalui analisis di **`routes_spatial.py`**, sistem memetakan anomali komoditas unggulan dan demografi pasar. AI kemudian memproyeksikan model bisnis baru yang memiliki survival rate tinggi di titik tersebut, memicu pembukaan usaha mandiri yang menyerap tenaga kerja lokal.

2. Aklerasi Investasi Masuk
Dengan segmentasi aktor pada **`routes_actors.py`**, investor luar dapat langsung melihat kalkulasi spasial mengenai ketersediaan lahan strategis dan pasokan angkatan kerja regional. Hal ini memotong birokrasi informasi dan mempercepat pembangunan industri padat karya.

3. Kebijakan Berbasis Data (Anti-Halusinasi)
Sistem menggunakan **`routes_ragas.py`** untuk menguji kelayakan rekomendasi ekonomi dari AI. Pemerintah dapat menggunakan keputusan bersih ini untuk merancang kurikulum pelatihan kerja (workforce training) yang link-and-match dengan kebutuhan riil industri lokal.

4. Presisi Proyek Padat Karya
Memetakan wilayah dengan indeks ekonomi lemah secara spasial, memberikan rekomendasi titik koordinat absolut kepada pemerintah untuk menyalurkan stimulus proyek infrastruktur padat karya agar tepat sasaran.

💻 Panduan Memulai
Prasyarat
Pastikan Anda telah menginstal Python 3.9+ dan pustaka GIS yang diperlukan pada sistem operasi Anda.

## 💻 Panduan Memulai

### ⚙️ Prasyarat Sistem
Pastikan perangkat Anda telah terinstal **Python 3.9+** sebelum mengeksekusi perintah di bawah ini.

---

### 🚀 Langkah Kerja Lokal

1. **Klona & Masuk ke Repositori**
   ```bash
   git clone [https://github.com/claraaaaiiiby26/web-gis-skripsi.git](https://github.com/claraaaaiiiby26/web-gis-skripsi.git)
   cd web-gis-skripsi
   
2. **Instalasi Paket Dependensi**
   ```bash
   pip install -r requirements.txt

3. **Inisialisasi Server Lokal**
   ```bash
   python server.py
