document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------------
    // KONFIGURASI PDF.js
    // ---------------------------------------------------------------
    const pdfUrl = '/static/dokumen.pdf';
    
    // Set worker PDF.js agar pemrosesan berjalan di background thread
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    let pdfDoc = null,
        pageNum = 1,
        pageIsRendering = false,
        pageNumIsPending = null,
        scale = 1.25;

    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const canvasContainer = document.getElementById('pdf-canvas-container');
    const loadingSpinner = document.getElementById('pdf-loading-spinner');

    // DOM Elements - Overlay & Triggers
    const triggerPdf = document.getElementById('trigger-pdf');
    const pdfOverlay = document.getElementById('pdf-overlay');
    const closePdf = document.getElementById('close-pdf-overlay');
    const explorationOverlay = document.getElementById('exploration-overlay');

    // DOM Elements - Toolbar
    const pdfPrevBtn = document.getElementById('pdf-prev');
    const pdfNextBtn = document.getElementById('pdf-next');
    const pdfZoomInBtn = document.getElementById('pdf-zoom-in');
    const pdfZoomOutBtn = document.getElementById('pdf-zoom-out');
    const pdfPageNumSpan = document.getElementById('pdf-page-num');
    const pdfPageCountSpan = document.getElementById('pdf-page-count');

    // DOM Elements - Tabs
    const tabBtns = document.querySelectorAll('.pdf-tab-btn');
    const tabContents = document.querySelectorAll('.pdf-tab-content');

    // DOM Elements - AI Chat
    const chatTextarea = document.getElementById('pdf-chat-textarea');
    const chatSendBtn = document.getElementById('btn-send-pdf-chat');
    const chatHistory = document.getElementById('pdf-chat-history');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');

    // DOM Elements - Outline & Accordion
    const accordionList = document.getElementById('pdf-accordion-list');

    // DOM Elements - AI Tools
    const btnToolSummaryDoc = document.getElementById('btn-tool-summary-doc');
    const btnToolSummaryPage = document.getElementById('btn-tool-summary-page');
    const btnToolFindings = document.getElementById('btn-tool-findings');
    const toolOutputPanel = document.getElementById('tool-output-panel');
    const toolOutputContent = document.getElementById('tool-output-content');
    const btnClearToolOutput = document.getElementById('btn-clear-tool-output');

    // Sesi riwayat chat untuk RAG
    let chatHistorySession = [
        { role: "assistant", content: "Selamat datang! Silakan ajukan pertanyaan seputar isi draf skripsi saya. Saya akan menjawab seolah sedang mempertahankan proposal di depan Anda. [Halaman 1]" }
    ];

    // Verify basic HTML elements exist
    if (!triggerPdf || !pdfOverlay || !closePdf) return;

    // ---------------------------------------------------------------
    // LOGIKA PENAMPIL PDF (PDF.js)
    // ---------------------------------------------------------------
    
    // Render Halaman
    const renderPage = (num) => {
        if (!ctx || !pdfDoc) return;
        pageIsRendering = true;

        if (loadingSpinner) loadingSpinner.style.display = 'flex';

        pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            const renderTask = page.render(renderContext);

            renderTask.promise.then(() => {
                pageIsRendering = false;
                if (loadingSpinner) loadingSpinner.style.display = 'none';

                if (pageNumIsPending !== null) {
                    renderPage(pageNumIsPending);
                    pageNumIsPending = null;
                }
            });

            // Update indikator halaman di UI
            if (pdfPageNumSpan) pdfPageNumSpan.textContent = num;
        }).catch(err => {
            console.error("Gagal merender halaman: ", err);
            pageIsRendering = false;
        });
    };

    // Antrian render halaman jika perpindahan halaman cepat
    const queueRenderPage = (num) => {
        if (pageIsRendering) {
            pageNumIsPending = num;
        } else {
            renderPage(num);
        }
    };

    // Navigasi halaman sebelumnya
    const showPrevPage = () => {
        if (pageNum <= 1) return;
        pageNum--;
        queueRenderPage(pageNum);
    };

    // Navigasi halaman berikutnya
    const showNextPage = () => {
        if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
        pageNum++;
        queueRenderPage(pageNum);
    };

    // Lompat ke Halaman tertentu
    const jumpToPage = (num) => {
        const pageInt = parseInt(num, 10);
        if (!pdfDoc || isNaN(pageInt) || pageInt < 1 || pageInt > pdfDoc.numPages) return;
        pageNum = pageInt;
        queueRenderPage(pageNum);

        // Berikan kilatan animasi pada canvas untuk memberi petunjuk lompat halaman berhasil
        if (canvas) {
            canvas.style.transform = 'scale(0.98)';
            setTimeout(() => {
                canvas.style.transform = 'scale(1)';
            }, 200);
        }
    };

    // Zoom In
    const zoomIn = () => {
        if (scale >= 3.0) return;
        scale += 0.25;
        queueRenderPage(pageNum);
    };

    // Zoom Out
    const zoomOut = () => {
        if (scale <= 0.75) return;
        scale -= 0.25;
        queueRenderPage(pageNum);
    };

    // Inisiasi pemuatan dokumen PDF (Lazy Loading)
    const loadPdfDocument = () => {
        if (pdfDoc) return; // Sudah ter-load sebelumnya

        if (loadingSpinner) {
            loadingSpinner.style.display = 'flex';
            loadingSpinner.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memuat Dokumen...';
        }

        pdfjsLib.getDocument(pdfUrl).promise.then(pdfDoc_ => {
            pdfDoc = pdfDoc_;
            
            if (pdfPageCountSpan) pdfPageCountSpan.textContent = pdfDoc.numPages;
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            
            renderPage(pageNum);
            // Load outline setelah PDF berhasil dimuat
            loadOutline();
        }).catch(err => {
            console.error("Gagal memuat dokumen PDF: ", err);
            if (loadingSpinner) {
                loadingSpinner.innerHTML = '<span style="color:#ef4444; font-weight:bold;"><i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat berkas PDF.</span>';
            }
        });
    };

    // Bind event listener toolbar
    if (pdfPrevBtn) pdfPrevBtn.addEventListener('click', showPrevPage);
    if (pdfNextBtn) pdfNextBtn.addEventListener('click', showNextPage);
    if (pdfZoomInBtn) pdfZoomInBtn.addEventListener('click', zoomIn);
    if (pdfZoomOutBtn) pdfZoomOutBtn.addEventListener('click', zoomOut);

    // ---------------------------------------------------------------
    // LOGIKA MODAL OVERLAY BUKA-TUTUP
    // ---------------------------------------------------------------

    // Buka Modal PDF
    triggerPdf.addEventListener('click', () => {
        pdfOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
        // Load berkas PDF
        loadPdfDocument();
    });

    // Tutup Modal PDF
    const closePdfModal = () => {
        pdfOverlay.classList.remove('active');
        
        // Hapus status no-scroll di body hanya jika overlay utama tidak aktif
        const isMainOverlayActive = explorationOverlay && explorationOverlay.classList.contains('active');
        if (!isMainOverlayActive) {
            document.body.classList.remove('no-scroll');
        }

        // Reset mobile columns/height custom resizes
        const viewerCol = document.querySelector('.pdf-viewer-column');
        if (viewerCol) {
            viewerCol.style.height = '';
        }
    };

    closePdf.addEventListener('click', closePdfModal);

    // Tutup jika klik area kosong (backdrop)
    pdfOverlay.addEventListener('click', (e) => {
        if (e.target === pdfOverlay) {
            closePdfModal();
        }
    });

    // Dukungan Esc Key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pdfOverlay.classList.contains('active')) {
            closePdfModal();
        }
    });

    // ---------------------------------------------------------------
    // LOGIKA TABS SIDEBAR AI
    // ---------------------------------------------------------------
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Toggle Button Active
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle Content Active
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${targetTab}`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // ---------------------------------------------------------------
    // LOGIKA TABS 1: CHAT ASISTEN (RAG + PERSONA AUTHOR)
    // ---------------------------------------------------------------
    
    // Format teks asisten AI untuk mengubah [Halaman X] menjadi tautan interaktif
    const formatCitationLinks = (text) => {
        // Regex untuk mencari pola [Halaman X] atau [halaman X]
        const citationRegex = /\[[Hh]alaman\s+(\d+)\]/g;
        return text.replace(citationRegex, (match, pageNum) => {
            return `<span class="chat-page-link" data-page="${pageNum}">[Halaman ${pageNum}]</span>`;
        });
    };

    // Tampilkan Indikator Sedang Mengetik
    const showTypingIndicator = () => {
        const indicator = document.createElement('div');
        indicator.className = 'chat-bubble ai typing-temp';
        indicator.innerHTML = `
            <div class="chat-bubble-avatar">
                <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <div class="chat-bubble-text">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        chatHistory.appendChild(indicator);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    };

    // Hapus Indikator Mengetik
    const removeTypingIndicator = () => {
        const temp = chatHistory.querySelector('.typing-temp');
        if (temp) {
            chatHistory.removeChild(temp);
        }
    };

    // Kirim pesan chat ke backend
    const sendChatMessage = () => {
        const text = chatTextarea.value.trim();
        if (!text) return;

        // Kosongkan textarea
        chatTextarea.value = '';

        // Tampilkan pesan User di UI
        const userBubble = document.createElement('div');
        userBubble.className = 'chat-bubble user';
        userBubble.innerHTML = `
            <div class="chat-bubble-avatar">
                <i class="fa-solid fa-user"></i>
            </div>
            <div class="chat-bubble-text">${escapeHTML(text)}</div>
        `;
        chatHistory.appendChild(userBubble);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Tambah ke riwayat sesi lokal
        chatHistorySession.push({ role: "user", content: text });

        // Tampilkan Loading typing indicator
        showTypingIndicator();

        // Kirim Fetch POST ke backend Flask
        fetch('/api/pdf/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: text,
                history: chatHistorySession
            })
        })
        .then(res => res.json())
        .then(data => {
            removeTypingIndicator();

            if (data.error) {
                throw new Error(data.error);
            }

            const aiResponse = data.response;
            chatHistorySession.push({ role: "assistant", content: aiResponse });

            // Tampilkan bubble asisten AI dengan tautan halaman
            const aiBubble = document.createElement('div');
            aiBubble.className = 'chat-bubble ai';
            aiBubble.innerHTML = `
                <div class="chat-bubble-avatar">
                    <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <div class="chat-bubble-text">${formatCitationLinks(aiResponse)}</div>
            `;
            chatHistory.appendChild(aiBubble);
            chatHistory.scrollTop = chatHistory.scrollHeight;
        })
        .catch(err => {
            console.error("Error chat:", err);
            removeTypingIndicator();

            const errorBubble = document.createElement('div');
            errorBubble.className = 'chat-bubble ai';
            errorBubble.innerHTML = `
                <div class="chat-bubble-avatar">
                    <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <div class="chat-bubble-text" style="color:#ef4444;">
                    Maaf, terjadi kendala saat menghubungkan ke AI Engine penelitian. Pastikan server Flask berjalan.
                </div>
            `;
            chatHistory.appendChild(errorBubble);
            chatHistory.scrollTop = chatHistory.scrollHeight;
        });
    };

    // Bind event kirim pesan
    if (chatSendBtn) chatSendBtn.addEventListener('click', sendChatMessage);
    if (chatTextarea) {
        chatTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }

    // Delegasi klik tautan halaman [Halaman X] di dalam chat history
    if (chatHistory) {
        chatHistory.addEventListener('click', (e) => {
            const pageLink = e.target.closest('.chat-page-link');
            if (pageLink) {
                const targetPage = pageLink.getAttribute('data-page');
                jumpToPage(targetPage);
            }
        });
    }

    // Bind chip pertanyaan saran
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            chatTextarea.value = chip.textContent;
            sendChatMessage();
        });
    });

    // Helper escape HTML
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

    // ---------------------------------------------------------------
    // LOGIKA TABS 2: OUTLINE / RINGKASAN PER BAB (Opsi 4)
    // ---------------------------------------------------------------
    let outlineLoaded = false;
    
    const loadOutline = () => {
        if (outlineLoaded || !accordionList) return;

        accordionList.innerHTML = '<div style="font-size:0.9rem;color:#64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat outline bab...</div>';

        fetch('/api/pdf/outline')
            .then(res => res.json())
            .then(data => {
                accordionList.innerHTML = '';
                
                data.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'pdf-acc-card' + (item.coming_soon ? ' coming-soon' : '');

                    // Build action row: coming_soon = badge, else = section jump buttons
                    let actionRowHtml = '';
                    if (item.coming_soon) {
                        actionRowHtml = `
                            <div class="pdf-acc-action-row">
                                <span class="pdf-coming-soon-badge">
                                    <i class="fa-solid fa-clock"></i> Belum Tersedia
                                </span>
                            </div>
                        `;
                    } else if (item.sections && item.sections.length > 0) {
                        const sectionBtns = item.sections.map(s => `
                            <button class="btn-acc-jump" data-page="${s.page}">
                                <i class="fa-solid fa-circle-arrow-right"></i> ${s.label}
                                <span class="pdf-page-tag-inline">Hal. ${s.page}</span>
                            </button>
                        `).join('');
                        actionRowHtml = `<div class="pdf-acc-action-row pdf-acc-sections">${sectionBtns}</div>`;
                    } else {
                        actionRowHtml = `
                            <div class="pdf-acc-action-row">
                                <span class="pdf-page-tag">Halaman ${item.page}</span>
                                <button class="btn-acc-jump" data-page="${item.page}">
                                    <i class="fa-solid fa-circle-arrow-right"></i> Lompat ke Halaman
                                </button>
                            </div>
                        `;
                    }

                    card.innerHTML = `
                        <div class="pdf-acc-header" data-id="${item.id}">
                            <div class="pdf-acc-header-left">
                                <i class="fa-solid ${item.coming_soon ? 'fa-hourglass-half' : 'fa-book-bookmark'}"></i>
                                <span>${item.title}</span>
                                ${item.coming_soon ? '<span class="badge-soon-inline">Coming Soon</span>' : ''}
                            </div>
                            <i class="fa-solid fa-chevron-down pdf-acc-chevron"></i>
                        </div>
                        <div class="pdf-acc-body">
                            <ul>
                                ${item.summary.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                            ${actionRowHtml}
                        </div>
                    `;
                    accordionList.appendChild(card);
                });

                // Toggle Accordion Click Event
                const headers = accordionList.querySelectorAll('.pdf-acc-header');
                headers.forEach(header => {
                    header.addEventListener('click', () => {
                        const card = header.parentElement;
                        const isOpen = card.classList.contains('open');
                        
                        // Close all accordions
                        accordionList.querySelectorAll('.pdf-acc-card').forEach(c => c.classList.remove('open'));
                        
                        // Open clicked if was closed
                        if (!isOpen) {
                            card.classList.add('open');
                        }
                    });
                });

                // Jump Button Event Listener inside Accordion
                accordionList.querySelectorAll('.btn-acc-jump').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const page = btn.getAttribute('data-page');
                        jumpToPage(page);
                    });
                });

                outlineLoaded = true;
            })
            .catch(err => {
                console.error("Error loading outline:", err);
                accordionList.innerHTML = '<div style="font-size:0.9rem;color:#ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat outline.</div>';
            });
    };


    // ---------------------------------------------------------------
    // LOGIKA TABS 3: AI QUICK TOOLS (Opsi 1 & 3)
    // ---------------------------------------------------------------
    
    // Jalankan tools AI
    const runAITool = (type) => {
        if (!toolOutputPanel || !toolOutputContent) return;

        // Show panel & loading state
        toolOutputPanel.classList.remove('hidden');
        toolOutputContent.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sedang merangkum dan memproses data riset...';
        toolOutputPanel.scrollIntoView({ behavior: 'smooth', block: 'end' });

        const bodyData = { type: type };
        if (type === 'page') {
            bodyData.page_num = pageNum;
        }

        fetch('/api/pdf/quick-summary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        })
        .then(res => res.json())
        .then(data => {
            // Tampilkan hasil rangkuman
            // Ubah list markdown sederhana (-) menjadi bullet point HTML jika ada
            let formatted = data.summary;
            if (formatted.includes('\n- ')) {
                formatted = formatted.replace(/\n- /g, '<br>• ');
            }
            toolOutputContent.innerHTML = formatCitationLinks(formatted);
        })
        .catch(err => {
            console.error("Error tools AI:", err);
            toolOutputContent.innerHTML = '<span style="color:#ef4444;">Gagal memproses permintaan AI. Pastikan server Flask aktif.</span>';
        });
    };

    if (btnToolSummaryDoc) {
        btnToolSummaryDoc.addEventListener('click', () => runAITool('document'));
    }
    if (btnToolSummaryPage) {
        btnToolSummaryPage.addEventListener('click', () => runAITool('page'));
    }
    if (btnToolFindings) {
        btnToolFindings.addEventListener('click', () => runAITool('findings'));
    }

    // Tutup Output Panel
    if (btnClearToolOutput) {
        btnClearToolOutput.addEventListener('click', () => {
            toolOutputPanel.classList.add('hidden');
            toolOutputContent.innerHTML = '';
        });
    }

    // ---------------------------------------------------------------
    // LOGIKA RESIZE COLUMN DI MOBILE (DRAG/SWIPE HANDLE TO EXPAND CANVAS)
    // ---------------------------------------------------------------
    const mobileResizer = document.getElementById('pdf-mobile-resizer');
    const viewerColumn = document.querySelector('.pdf-viewer-column');

    if (mobileResizer && viewerColumn) {
        let startY = 0;
        let startHeight = 0;
        let isDragging = false;

        const onDragStart = (e) => {
            // Only trigger drag behavior on responsive mobile viewport layout
            if (window.innerWidth > 900) return;

            isDragging = true;
            startY = e.touches ? e.touches[0].clientY : e.clientY;
            startHeight = viewerColumn.getBoundingClientRect().height;

            mobileResizer.classList.add('active');

            // Attach listeners to document to track drag movements smoothly
            document.addEventListener('mousemove', onDragMove, { passive: false });
            document.addEventListener('mouseup', onDragEnd);
            document.addEventListener('touchmove', onDragMove, { passive: false });
            document.addEventListener('touchend', onDragEnd);
            document.addEventListener('touchcancel', onDragEnd);
        };

        const onDragMove = (e) => {
            if (!isDragging) return;

            // Prevent browser scroll behaviors on mobile while dragging the slider
            if (e.cancelable) {
                e.preventDefault();
            }

            const currentY = e.touches ? e.touches[0].clientY : e.clientY;
            const deltaY = currentY - startY;

            // Calculate new height (constrain between 180px and 80% of window height)
            let newHeight = startHeight + deltaY;
            const minHeight = 180;
            const maxHeight = window.innerHeight * 0.8;

            if (newHeight < minHeight) newHeight = minHeight;
            if (newHeight > maxHeight) newHeight = maxHeight;

            viewerColumn.style.height = `${newHeight}px`;
        };

        const onDragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            mobileResizer.classList.remove('active');

            // Clean up event listeners
            document.removeEventListener('mousemove', onDragMove);
            document.removeEventListener('mouseup', onDragEnd);
            document.removeEventListener('touchmove', onDragMove);
            document.removeEventListener('touchend', onDragEnd);
            document.removeEventListener('touchcancel', onDragEnd);
        };

        // Attach initial triggers
        mobileResizer.addEventListener('mousedown', onDragStart);
        mobileResizer.addEventListener('touchstart', onDragStart, { passive: true });
    }
});
