
// PROFILE LOGIC
(function () {
    const keluarBtn = document.getElementById('Keluar');
    if (keluarBtn) {
        keluarBtn.addEventListener('click', () => {
            window.location.href = '/logout';
        });
    }

    const profilBtn = document.getElementById('Profil');
    if (profilBtn) {
        profilBtn.addEventListener('click', () => {
            document.getElementById('profileEditOverlay').classList.remove('hidden');
            document.getElementById('profileWrapper').classList.remove('active');
        });
    }

    window.previewProfilePhoto = function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('profilePreviewImg').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const name = document.getElementById('profileNameInput').value;
            const file = document.getElementById('profileFileInput').files[0];

            const formData = new FormData();
            formData.append('nama', name);
            if (file) formData.append('foto', file);

            saveBtn.disabled = true;
            saveBtn.innerText = "Menyimpan...";

            try {
                const res = await fetch('/api/user/update', {
                    method: 'POST',
                    body: formData
                });
                const json = await res.json();
                if (json.success) {
                    const newImgSrc = document.getElementById('profilePreviewImg').src;
                    document.querySelectorAll('.open-profile img, #imgProfile img').forEach(img => {
                        img.src = newImgSrc;
                    });
                    document.querySelectorAll('.nama').forEach(el => {
                        el.innerText = name;
                    });

                    document.getElementById('profileEditOverlay').classList.add('hidden');
                    if (typeof showToast === 'function') showToast("Profil diperbarui!", "success");
                } else {
                    alert("Gagal update profil: " + (json.error || "Unknown error"));
                }
            } catch (err) {
                console.error(err);
                alert("Terjadi kesalahan koneksi.");
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerText = "Simpan Perubahan";
            }
        });
    }
})();
