APLIKASI WEB GIS BERBASIS KNOWLEDGE GRAPH DAN LLM UNTUK IDENTIFIKASI VALUE CHAIN EKOSISTEM PENCIPTA KERJA

Aplikasi Web-GIS ini dirancang untuk mengintegrasikan analisis data spasial (pemetaan) dengan kecerdasan buatan (AI Engine). Sistem ini dirancang bukan hanya sebagai alat pemetaan visual, melainkan sebagai platform pengambilan keputusan strategis yang mampu mendorong pertumbuhan ekonomi dan membuka lapangan pekerjaan baru melalui analisis potensi wilayah.

🚀 Fungsi Utama Sistem
Sistem ini dibangun menggunakan arsitektur modular dengan pembagian tugas (routing) yang jelas:

server.py & config.py: Berfungsi sebagai pusat kendali dan konfigurasi utama aplikasi backend.

routes_spatial.py: Menghandle seluruh visualisasi, manipulasi, dan analisis data geografis/spasial (Web-GIS) untuk memetakan potensi wilayah.

ai_engine.py: Otak AI yang berfungsi memproses data, memberikan rekomendasi cerdas, atau berinteraksi dengan pengguna berbasis data kontekstual wilayah.

routes_ragas.py: Mengimplementasikan framework Ragas untuk mengevaluasi kualitas, akurasi, dan relevansi jawaban yang dihasilkan oleh AI Engine (memastikan rekomendasi bebas dari halusinasi).

routes_actors.py & routes_auth.py: Mengatur manajemen pengguna (aktor sistem) seperti masyarakat, investor, atau pemerintah, serta sistem autentikasi keamanan.

templates/ & static/: Menyediakan antarmuka pengguna (UI/UX) berbasis web yang responsif dan interaktif (beranda.html).

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
