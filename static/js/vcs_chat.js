window.toggleVCS = function () {
    const overlay = document.getElementById('vcsOverlay');
    if (overlay) overlay.classList.toggle('hidden');
};

window.resetVCS = function () {
    fetch('/api/vcs/reset', { method: 'POST' })
    .then(res => res.json())
    .then(() => {
        const container = document.getElementById('vcsMessages');
        container.innerHTML = `
          <div class="message bot">
            <div class="bubble">Halo! Saya AI Konsultan Value Chain. Silakan deskripsikan profil bisnis atau ide usaha Anda, dan saya akan membuatkan Value Chain (Primary & Support Activities) secara lengkap beserta Strategi Peningkatan Margin yang bisa Anda copy/paste.</div>
          </div>
        `;
        showToast('Sesi Value Chain direset', 'info');
    });
};

window.sendVCSMessage = function () {
    const input = document.getElementById('vcsInput');
    const text = input.value.trim();
    if (!text) return;

    appendVCSMessage('user', text);
    input.value = '';

    const typingEl = document.createElement('div');
    typingEl.className = 'message bot typing-indicator-vcs';
    typingEl.innerHTML = `<div class="bubble"><em>AI sedang menyusun Value Chain...</em></div>`;
    document.getElementById('vcsMessages').appendChild(typingEl);
    document.getElementById('vcsMessages').scrollTop = document.getElementById('vcsMessages').scrollHeight;

    fetch('/api/vcs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
    })
    .then(res => res.json())
    .then(data => {
        document.querySelectorAll('.typing-indicator-vcs').forEach(el => el.remove());
        if (data.reply) {
            appendVCSMessage('bot', data.reply);
        } else {
            appendVCSMessage('bot', "Gagal mendapatkan respons AI.");
        }
    })
    .catch(err => {
        document.querySelectorAll('.typing-indicator-vcs').forEach(el => el.remove());
        appendVCSMessage('bot', "Terjadi kesalahan pada server.");
    });
};

window.copyVCSText = function(text, btn) {
    function success() {
        if (typeof showToast !== 'undefined') showToast('Tersalin!', 'info');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '✔';
        setTimeout(() => { btn.innerHTML = originalHtml; }, 1500);
    }
    
    function fallbackCopy(txt) {
        var textArea = document.createElement("textarea");
        textArea.value = txt;
        
        textArea.style.fontSize = '16px';
        textArea.style.border = '0';
        textArea.style.padding = '0';
        textArea.style.margin = '0';
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        let yPosition = window.pageYOffset || document.documentElement.scrollTop;
        textArea.style.top = yPosition + 'px';
        textArea.setAttribute('readonly', '');
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Copy error', err);
        }
        
        document.body.removeChild(textArea);
        success();
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(success).catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
};

function appendVCSMessage(sender, text) {
    const container = document.getElementById('vcsMessages');
    if (!container) return;

    let formattedText = text;
    if (typeof marked !== 'undefined') {
        formattedText = marked.parse(text).replace(/<table[^>]*>/g, match => '<div class="table-scroll-wrapper">' + match).replace(/<\/table>/g, '</table></div>');
    }

    const msgContainer = document.createElement('div');
    msgContainer.className = 'message-container ' + sender;
    msgContainer.style.display = 'flex';
    msgContainer.style.flexDirection = 'column';
    msgContainer.style.alignItems = sender === 'user' ? 'flex-end' : 'flex-start';
    msgContainer.style.marginBottom = '15px';

    const msg = document.createElement('div');
    msg.className = 'message ' + sender;
    msg.style.maxWidth = '100%';

    // For bot messages, make list items copyable
    if (sender === 'bot') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formattedText;
        
        tempDiv.querySelectorAll('li').forEach(el => {
            // Kita HANYA menambahkan ikon copy pada <li> yang TIDAK memiliki nested list (anak poin)
            // Ini berarti tombol copy HANYA akan ada di poin-poin terbawah (yang sebenarnya ingin disalin), BUKAN di judul/header bold.
            const hasNested = el.querySelector('ul, ol');
            if (hasNested) return; // Lewati jika ini adalah judul (seperti "Tusuk Sate:")
            
            const btn = document.createElement('span');
            btn.className = 'vcs-copy-btn';
            btn.title = 'Salin bagian ini';
            btn.innerHTML = '<img src="/static/image/icon/copy.svg" style="width: 14px; height: 14px;">';
            btn.onclick = function(e) {
                e.stopPropagation();
                let textToCopy = el.innerText || el.textContent;
                window.copyVCSText(textToCopy.trim(), this);
            };

            // make the button inline
            btn.style.display = 'inline-flex';
            btn.style.marginLeft = '8px';
            btn.style.verticalAlign = 'middle';

            el.appendChild(btn);
        });
        
        formattedText = tempDiv.innerHTML;
    }

    msg.innerHTML = `<div class="bubble">${formattedText}</div>`;
    msgContainer.appendChild(msg);

    container.appendChild(msgContainer);
    container.scrollTop = container.scrollHeight;
}
