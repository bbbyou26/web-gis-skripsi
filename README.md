🗺️ Web-GIS AI: Identifikasi Value Chain Ekosistem Pencipta Kerja

<p align="center">
<img src="https://img.shields.io/badge/Framework-Flask%20%7C%20FastAPI-blue?style=for-the-badge&logo=python" alt="Framework">
<img src="https://img.shields.io/badge/AI--Engine-LLM%20%2526%20Ragas-orange?style=for-the-badge&logo=openai" alt="AI Engine">
<img src="https://img.shields.io/badge/GIS-Leaflet.js%20%2F%20OpenLayers-green?style=for-the-badge&logo=scipy" alt="GIS">
</p>

<p align="center">
<strong>Sistem Informasi Geografis Berbasis Knowledge Graph dan LLM untuk Pemetaan Potensi Wilayah dan Solusi Stimulus Lapangan Kerja.</strong>
</p>

Aplikasi Web-GIS ini mengintegrasikan analisis data spasial dengan kecerdasan buatan (AI Engine berbasis Large Language Model). Sistem ini tidak hanya berfungsi sebagai alat pemetaan visual, melainkan sebagai platform pengambilan keputusan strategis (Decision Support System) yang mampu mendorong pertumbuhan ekonomi serta membuka lapangan pekerjaan baru melalui analisis rantai nilai (value chain) wilayah.

🚀 Fungsi Utama Sistem
Sistem ini dibangun menggunakan arsitektur modular dengan pembagian tugas (routing) yang jelas:

<details>
<summary><b>🧠 Inti Aplikasi & Engine AI</b></summary>
  
server.py & config.py

Pusat kendali utama eksekusi program.

Manajemen environment variables dan konfigurasi basis data global.

ai_engine.py

Otak AI yang memproses Knowledge Graph dan LLM.

Menghasilkan rekomendasi keputusan ekonomi secara kontekstual.

</details>

<details>
<summary><b>🌐 Modul Spasial & Validasi (Web-GIS)</b></summary>


routes_spatial.py

Engine pemetaan interaktif.

Mengolah visualisasi, manipulasi, dan analisis data geografis/spasial fisik wilayah.

routes_ragas.py

Framework Ragas Evaluation.

Memvalidasi akurasi dan relevansi output AI untuk memastikan rekomendasi bebas dari halusinasi data.

</details>

<details>
<summary><b>👥 Gerbang Akses & Interface</b></summary>


routes_actors.py & routes_auth.py

Manajemen hak akses aktor (Masyarakat, Investor, Pemerintah).

Sistem autentikasi keamanan token/session.

templates/ & static/

Aset antarmuka (UI/UX) web (beranda.html) yang responsif.

</details>

💼 Solusi Ekonomi & Penciptaan Lapangan Kerja
Bagaimana sistem Web-GIS berbasis AI ini berkontribusi nyata dalam menurunkan angka pengangguran dan menciptakan lapangan kerja?

1. Pemetaan Potensi Wilayah untuk UMKM & Bisnis Baru
Melalui routes_spatial.py, sistem dapat memetakan komoditas unggulan, kepadatan penduduk, dan fasilitas pendukung di suatu daerah. AI Engine kemudian memberikan analisis prediktif mengenai bisnis apa yang paling berpotensi sukses di wilayah tersebut. Hal ini memicu lahirnya wirausaha baru (UMKM) yang otomatis menyerap tenaga kerja lokal.

2. Menghubungkan Investor dengan Tenaga Kerja Lokal
Sistem mengklasifikasikan pengguna melalui routes_actors.py. Investor yang ingin membuka pabrik atau cabang bisnis dapat melihat analisis spasial mengenai ketersediaan lahan strategis sekaligus profil demografi angkatan kerja di wilayah tersebut. Ini mempercepat proses investasi yang berorientasi pada penyerapan tenaga kerja.

3. Rekomendasi AI yang Akurat dan Terpercaya (Ragas Evaluated)
Dengan adanya integrasi routes_ragas.py, setiap analisis ekonomi dan rekomendasi peluang kerja yang dikeluarkan oleh AI memiliki validitas yang tinggi. Pemerintah atau dinas terkait dapat menggunakan data ini untuk merancang program pelatihan kerja (workforce training) yang link and match dengan kebutuhan industri di wilayah tersebut.

4. Efisiensi Alokasi Proyek Padat Karya
Pemerintah dapat mengidentifikasi wilayah dengan tingkat ekonomi rendah secara spasial, lalu membuat perencanaan proyek infrastruktur padat karya langsung tepat sasaran di titik-titik koordinat yang membutuhkan.

🛠️ Teknologi yang Digunakan
Backend: Python (Flask/FastAPI berdasarkan struktur route)

Frontend: HTML5, CSS3, JavaScript (Leaflet.js / OpenLayers untuk peta)

AI & Evaluation: Custom AI Engine & Ragas Framework

Dependencies: Tertera lengkap pada requirements.txt

💻 Cara Instalasi
Clone repositori ini:

Bash
git clone https://github.com/claraaaaiiiby26/web-gis-skripsi.git
Masuk ke direktori proyek:

Bash
cd web-gis-skripsi
Install seluruh library yang dibutuhkan:

Bash
pip install -r requirements.txt
Jalankan server:

Bash
python server.py
