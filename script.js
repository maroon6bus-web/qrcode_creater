document.addEventListener('DOMContentLoaded', () => {
    const qrText = document.getElementById('qr-text');
    const colorDark = document.getElementById('color-dark');
    const colorLight = document.getElementById('color-light');
    const qrCodeContainer = document.getElementById('qr-code');
    const placeholderText = document.getElementById('placeholder-text');
    const qrDisplayArea = document.getElementById('qr-wrapper');

    const historyList = document.getElementById('history-list');

    let qrcode = null;
    let history = []; // Array to store history items

    // Default configuration
    const qrConfig = {
        text: "",
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    };

    let historyTimeout = null;

    function generateQR() {
        const text = qrText.value.trim();
        
        // If input is empty, clear and show placeholder
        if (!text) {
            clearQR();
            return;
        }

        // Update config
        qrConfig.text = text;
        qrConfig.colorDark = colorDark.value;
        qrConfig.colorLight = colorLight.value;

        // Apply background color to the container itself for seamless look
        qrCodeContainer.style.backgroundColor = colorLight.value;

        // Hide placeholder and style display area
        placeholderText.style.opacity = '0';
        qrDisplayArea.classList.add('active');
        qrCodeContainer.classList.add('show');


        // Generate or update QR
        if (qrcode === null) {
            qrcode = new QRCode(qrCodeContainer, qrConfig);
        } else {
            qrcode.clear();
            // Re-instantiating handles color changes better with this library
            qrCodeContainer.innerHTML = '';
            qrcode = new QRCode(qrCodeContainer, qrConfig);
        }

        // Add to history after user stops typing for 1.5 seconds
        clearTimeout(historyTimeout);
        historyTimeout = setTimeout(() => {
            addToHistory(text);
        }, 1500);
    }

    function clearQR() {
        if (qrcode) {
            qrcode.clear();
            qrCodeContainer.innerHTML = '';
            qrcode = null;
        }
        placeholderText.style.opacity = '1';
        qrDisplayArea.classList.remove('active');
        qrCodeContainer.classList.remove('show');

    }



    // Event Listeners
    // Use input event for real-time generation as user types
    qrText.addEventListener('input', generateQR);
    
    // Update when colors change
    colorDark.addEventListener('input', generateQR);
    colorLight.addEventListener('input', generateQR);



    // History Functions
    function getSiteName(text) {
        try {
            const url = new URL(text);
            return url.hostname;
        } catch (e) {
            return text.length > 20 ? text.substring(0, 20) + "..." : text;
        }
    }

    function addToHistory(text) {
        if (!text) return;
        
        // Avoid adding consecutive exact duplicates
        if (history.length > 0 && history[0].text === text) {
            return;
        }

        const siteName = getSiteName(text);
        
        const historyItem = {
            id: Date.now(),
            text: text,
            siteName: siteName,
            colorDark: colorDark.value,
            colorLight: colorLight.value
        };

        history.unshift(historyItem);
        // Keep only last 10 items to avoid clutter
        if (history.length > 10) {
            history.pop();
        }
        
        renderHistory();
    }

    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';
        
        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'history-info';
            
            const siteNameSpan = document.createElement('span');
            siteNameSpan.className = 'history-site-name';
            siteNameSpan.textContent = item.siteName;
            
            const urlSpan = document.createElement('span');
            urlSpan.className = 'history-url';
            urlSpan.textContent = item.text;
            
            infoDiv.appendChild(siteNameSpan);
            infoDiv.appendChild(urlSpan);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '削除'; // Delete in Japanese
            deleteBtn.onclick = (e) => {
                e.stopPropagation(); // Prevent li click
                history = history.filter(h => h.id !== item.id);
                renderHistory();
            };
            
            li.onclick = () => {
                qrText.value = item.text;
                colorDark.value = item.colorDark;
                colorLight.value = item.colorLight;
                generateQR(); // Regen with loaded values
            };
            
            li.appendChild(infoDiv);
            li.appendChild(deleteBtn);
            
            historyList.appendChild(li);
        });
    }
});
