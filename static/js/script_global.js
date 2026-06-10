document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.querySelector('.nav-menu');

    if (toggle) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }

    // Toggle dropdown on mobile click
    const dropdownToggles = document.querySelectorAll('.nav-item > .nav-link');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth < 1100) {
                const content = toggle.nextElementSibling;
                if (content && content.classList.contains('dropdown-content')) {
                    e.preventDefault(); // Only prevent default if it has a dropdown
                    content.classList.toggle('active');

                    // Toggle chevron icon if it exists
                    const icon = toggle.querySelector('i');
                    if (icon) {
                        icon.style.transform = content.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
                    }
                }
            }
        });
    });

    // Scroll reveal animation for feature cards
    const featureCards = document.querySelectorAll('.feature-mini-card');
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
        observer.observe(card);
    });

    // Typewriter Effect for Hero Title
    const titleElements = document.querySelectorAll('.hero-title, .splash-title');
    titleElements.forEach(titleElement => {
        const fullText = titleElement.innerText;
        titleElement.innerHTML = '';
        titleElement.classList.add('typing');

        let i = 0;
        function typeWriter() {
            if (i < fullText.length) {
                const char = fullText.charAt(i);
                if (char === '\n') {
                    titleElement.innerHTML += '<br>';
                } else {
                    titleElement.innerHTML += char;
                }
                i++;
                setTimeout(typeWriter, 40); // 40ms per char speed
            } else {
                // Restart after 7 seconds (total ~10s cycle)
                setTimeout(() => {
                    titleElement.innerHTML = '';
                    i = 0;
                    typeWriter();
                }, 7000);
            }
        }
        typeWriter();
    });

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Close mobile menu if open
                if (menu.classList.contains('active')) {
                    menu.classList.remove('active');
                    toggle.classList.remove('active');
                }
            }
        });
    });

    // Feature Card Flip
    const cards = document.querySelectorAll('.feature-mini-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });

    // Realistic Lifting Animation for CTA Section
    const ctaSection = document.querySelector('.cta-exploration-section');
    const btnExploration = document.querySelector('.btn-exploration');
    const liftImage = document.querySelector('.cta-lift-image');

    if (btnExploration && liftImage && ctaSection) {
        let startTime = null;
        let animationFrameId = null;

        function animateLift(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = (timestamp - startTime) % 7000; // 7 seconds full cycle

            let yVal = 0;
            let shake = 0;

            if (elapsed < 1500) {
                // Phase 1: Prepare / Crouch (0s to 1.5s) - slowly sink 20px down
                const t = elapsed / 1500;
                const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                yVal = ease * 25;
            } else if (elapsed < 2500) {
                // Phase 2: Heavy lifting exertion (1.5s to 2.5s) - fast lift up to -80px
                const t = (elapsed - 1500) / 1000;
                const ease = 1 - Math.pow(1 - t, 4); // strong acceleration curve
                yVal = 25 - (ease * 105); // goes from +25px to -80px
            } else if (elapsed < 5000) {
                // Phase 3: Struggle & Shaking at peak (2.5s to 5.0s) - hold and tremble
                yVal = -80;
                // High-frequency shake to simulate heavy effort
                shake = Math.sin((elapsed - 2500) * 0.08) * 1.5;
            } else {
                // Phase 4: Slowly lowering the weight (5.0s to 7.0s)
                const t = (elapsed - 5000) / 2000;
                const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                yVal = -80 + (ease * 80);
            }

            // Apply synchronized translation so hands stay glued to the button
            btnExploration.style.transform = `translateY(${yVal + shake}px)`;
            liftImage.style.transform = `translateY(${yVal + (shake * 0.5)}px)`;

            animationFrameId = requestAnimationFrame(animateLift);
        }

        const ctaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animationFrameId) {
                        startTime = null;
                        animationFrameId = requestAnimationFrame(animateLift);
                    }
                } else {
                    if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                        animationFrameId = null;
                    }
                }
            });
        }, { threshold: 0.05 });
        ctaObserver.observe(ctaSection);
    }

    // Overlay Controls
    const btnTrigger = document.getElementById('btn-exploration-trigger');
    const explorationOverlay = document.getElementById('exploration-overlay');
    const closeExploration = document.getElementById('close-exploration-overlay');

    const triggerInfografis = document.getElementById('trigger-infografis');
    const infografisOverlay = document.getElementById('infografis-overlay');
    const closeInfografis = document.getElementById('close-infografis-overlay');

    // Notes Features
    const btnToggleNoteInput = document.getElementById('btn-toggle-note-input');
    const noteInputWrapper = document.getElementById('note-input-wrapper');
    const noteTextarea = document.getElementById('note-textarea');
    const btnSaveNote = document.getElementById('btn-save-note');
    const noteOutputContainer = document.getElementById('note-output-container');
    const noteOutputContent = document.getElementById('note-output-content');

    // Image Toggle inside Modal
    const toggleInfographicImage = document.getElementById('toggle-infographic-image');
    const infografisImagePanel = document.getElementById('infografis-image-panel');

    // Open main overlay
    if (btnTrigger && explorationOverlay) {
        btnTrigger.addEventListener('click', () => {
            explorationOverlay.classList.add('active');
            document.body.classList.add('no-scroll');
        });
    }

    // Close main overlay and show Thank You modal
    const thankYouOverlay = document.getElementById('thank-you-overlay');
    const btnThankYouOk = document.getElementById('btn-thank-you-ok');

    if (closeExploration && explorationOverlay && thankYouOverlay) {
        closeExploration.addEventListener('click', () => {
            explorationOverlay.classList.remove('active');
            thankYouOverlay.classList.add('active');
        });
    }

    if (btnThankYouOk && thankYouOverlay) {
        btnThankYouOk.addEventListener('click', () => {
            thankYouOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }

    // Open Infografis sub-modal
    if (triggerInfografis && infografisOverlay) {
        triggerInfografis.addEventListener('click', () => {
            infografisOverlay.classList.add('active');
        });
    }

    // Close Infografis sub-modal
    if (closeInfografis && infografisOverlay) {
        closeInfografis.addEventListener('click', () => {
            infografisOverlay.classList.remove('active');
        });
    }

    // Helper to escape HTML characters
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Get current time formatted as DD/MM/YYYY HH:MM:SS
    function getFormattedTimestamp() {
        const now = new Date();
        const date = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${date}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    // Load notes from localStorage
    let savedNotes = [];
    try {
        const stored = localStorage.getItem('user_notes');
        if (stored) {
            savedNotes = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Gagal memuat catatan dari localStorage", e);
    }

    // Render notes history list
    function renderNotes() {
        if (!noteOutputContent || !noteOutputContainer) return;

        noteOutputContent.innerHTML = '';

        if (savedNotes.length > 0) {
            savedNotes.forEach((note, index) => {
                const noteEntry = document.createElement('div');
                noteEntry.className = 'note-entry';
                noteEntry.innerHTML = `
                    <div class="note-entry-meta">
                        <div class="note-entry-meta-left">
                            <label class="note-checkbox-container">
                                <input type="checkbox" class="note-checkbox" data-index="${index}">
                                <span class="note-checkbox-checkmark"></span>
                            </label>
                            <span class="note-entry-number">Catatan #${index + 1}</span>
                        </div>
                        <span class="note-entry-time">${note.timestamp}</span>
                    </div>
                    <div class="note-entry-text">${escapeHTML(note.text)}</div>
                `;
                noteOutputContent.appendChild(noteEntry);
            });
            noteOutputContainer.classList.remove('hidden');
        } else {
            noteOutputContainer.classList.add('hidden');
        }
    }

    // Initialize rendering on load
    renderNotes();

    // Toggle note input field with chevron rotation
    if (btnToggleNoteInput && noteInputWrapper) {
        btnToggleNoteInput.addEventListener('click', () => {
            noteInputWrapper.classList.toggle('hidden');
            btnToggleNoteInput.classList.toggle('open');
        });
    }

    // Save notes & display in history
    if (btnSaveNote && noteTextarea && noteOutputContainer && noteOutputContent) {
        btnSaveNote.addEventListener('click', () => {
            const noteText = noteTextarea.value.trim();
            if (noteText) {
                const newNote = {
                    text: noteText,
                    timestamp: getFormattedTimestamp()
                };
                savedNotes.push(newNote);
                try {
                    localStorage.setItem('user_notes', JSON.stringify(savedNotes));
                } catch (e) {
                    console.error("Gagal menyimpan ke localStorage", e);
                }

                // Clear text area input
                noteTextarea.value = '';

                // Refresh rendering
                renderNotes();

                // Collapse input accordion and reset chevron
                noteInputWrapper.classList.add('hidden');
                if (btnToggleNoteInput) {
                    btnToggleNoteInput.classList.remove('open');
                }

                // Auto scroll note list to the bottom to see new note
                setTimeout(() => {
                    noteOutputContent.scrollTop = noteOutputContent.scrollHeight;
                }, 50);
            }
        });
    }

    // Dynamic TXT Export (100% reliable & lightweight, no external dependencies)
    const btnDownloadNotes = document.getElementById('btn-download-notes');
    if (btnDownloadNotes) {
        btnDownloadNotes.addEventListener('click', () => {
            if (savedNotes.length === 0) return;

            // Build a beautifully formatted plain text document
            let txtContent = "";
            txtContent += "============================================================\n";
            txtContent += "                 CATATAN PENELITIAN SKRIPSI                 \n";
            txtContent += "============================================================\n";
            txtContent += `Peneliti  : Bayu Dwi Prasetyo (NIM: 2211080)\n`;
            txtContent += `Prodi     : S1 Informatika - Universitas Mulia\n`;
            txtContent += `Unduh Pada: ${getFormattedTimestamp()}\n`;
            txtContent += "============================================================\n\n";

            savedNotes.forEach((note, index) => {
                txtContent += `[CATATAN #${index + 1}] - ${note.timestamp}\n`;
                txtContent += `------------------------------------------------------------\n`;
                // Remove HTML entities if any were escaped, but notes are plain text from textarea
                txtContent += `${note.text}\n`;
                txtContent += "============================================================\n\n";
            });

            txtContent += "Dibuat secara otomatis melalui website - 2211080\n";

            // Create a Blob and trigger an instant direct browser download
            const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Catatan_Skripsi_Bayu_${new Date().toISOString().slice(0, 10)}.txt`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Custom Toast Helper
    function showToast(message) {
        const container = document.getElementById('custom-toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <i class="fa-solid fa-circle-info toast-icon"></i>
            <span class="toast-message">${escapeHTML(message)}</span>
        `;
        container.appendChild(toast);

        // Auto remove after 3.5 seconds
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3500);
    }

    // Custom Confirmation Dialog Helper
    function showCustomConfirm(message, onConfirm) {
        const overlay = document.getElementById('custom-confirm-overlay');
        const messageEl = document.getElementById('custom-confirm-message');
        const btnCancel = document.getElementById('btn-confirm-cancel');
        const btnOk = document.getElementById('btn-confirm-ok');

        if (!overlay || !messageEl || !btnCancel || !btnOk) return;

        messageEl.textContent = message;
        overlay.classList.add('active');

        const clearListeners = () => {
            btnCancel.replaceWith(btnCancel.cloneNode(true));
            btnOk.replaceWith(btnOk.cloneNode(true));
        };

        const hideConfirm = () => {
            overlay.classList.remove('active');
        };

        const handleCancel = () => {
            hideConfirm();
            clearListeners();
        };

        const handleOk = () => {
            hideConfirm();
            clearListeners();
            onConfirm();
        };

        document.getElementById('btn-confirm-cancel').addEventListener('click', handleCancel);
        document.getElementById('btn-confirm-ok').addEventListener('click', handleOk);
    }

    // Delete selected checkboxes notes
    const btnDeleteSelected = document.getElementById('btn-delete-selected');
    if (btnDeleteSelected) {
        btnDeleteSelected.addEventListener('click', () => {
            const checkedBoxes = document.querySelectorAll('.note-checkbox:checked');
            if (checkedBoxes.length === 0) {
                showToast("Silahkan centang terlebih dahulu catatan yang ingin dihapus.");
                return;
            }

            showCustomConfirm(`Apakah Anda yakin ingin menghapus ${checkedBoxes.length} catatan terpilih?`, () => {
                const indices = Array.from(checkedBoxes)
                    .map(cb => parseInt(cb.getAttribute('data-index'), 10))
                    .sort((a, b) => b - a);

                indices.forEach(idx => {
                    savedNotes.splice(idx, 1);
                });

                try {
                    localStorage.setItem('user_notes', JSON.stringify(savedNotes));
                } catch (e) {
                    console.error("Gagal menyimpan ke localStorage", e);
                }

                renderNotes();
            });
        });
    }

    // Fullscreen Infographic Image Lightbox
    const infographicImg = document.querySelector('.infografis-img');
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;

    if (infographicImg && lightbox && lightboxImg) {
        infographicImg.addEventListener('click', () => {
            lightboxImg.src = infographicImg.src;
            lightbox.classList.add('active');
            document.body.classList.add('no-scroll');
        });

        // Close lightbox when clicking anywhere outside image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                lightbox.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });

        // Close lightbox when clicking the image itself
        lightboxImg.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }

    // Toggle infographic image inside modal
    if (toggleInfographicImage && infografisImagePanel) {
        toggleInfographicImage.addEventListener('change', () => {
            if (toggleInfographicImage.checked) {
                infografisImagePanel.classList.remove('hidden');
            } else {
                infografisImagePanel.classList.add('hidden');
            }
        });
    }
});
