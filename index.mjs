// DOM Elements
const themeSwitch = document.getElementById('theme-switch');
const languageSelect = document.getElementById('language-select');

// State variabelen
let currentLanguage = 'nl';

// Vertalingen
const translations = {
    nl: { searchPlaceholder: 'Zoek locaties...', searchButton: 'Zoeken' },
    fr: { searchPlaceholder: 'Rechercher des lieux...', searchButton: 'Rechercher' },
    en: { searchPlaceholder: 'Search locations...', searchButton: 'Search' }
};

// Event Listeners
themeSwitch.addEventListener('click', toggleTheme);
languageSelect.addEventListener('change', changeLanguage);

document.addEventListener('DOMContentLoaded', loadUserPreferences);

// Toggle thema
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkTheme', document.body.classList.contains('dark-theme'));
}

// Verander taal
function changeLanguage() {
    currentLanguage = languageSelect.value;
    document.getElementById('search-input').placeholder = translations[currentLanguage].searchPlaceholder;
    document.getElementById('search-button').textContent = translations[currentLanguage].searchButton;
    localStorage.setItem('language', currentLanguage);
}

// Laad gebruikersvoorkeuren
function loadUserPreferences() {
    // Laad taal
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
        currentLanguage = storedLanguage;
        languageSelect.value = currentLanguage;
        changeLanguage();
    }

    // Laad thema
    if (localStorage.getItem('darkTheme') === 'true') {
        document.body.classList.add('dark-theme');
    }
}
