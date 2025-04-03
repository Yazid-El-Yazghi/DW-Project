// DOM Elements
const themeSwitch = document.getElementById('theme-switch');
const languageSelect = document.getElementById('language-select');

// State variables
let currentLanguage = 'nl';

// Translations
const translations = {
    nl: {
        searchPlaceholder: 'Zoek locaties...',
        searchButton: 'Zoeken',
        filterTypeLabel: 'Type:',
        filterTypeAll: 'Alle types',
        sortByLabel: 'Sorteren op:',
        sortByName: 'Naam',
        sortByDistance: 'Afstand',
        sortByPopularity: 'Populariteit',
        favoritesSectionTitle: 'Mijn favorieten',
        favoritesEmptyMessage: 'Je hebt nog geen favorieten toegevoegd.',
        viewDetailsButton: 'Meer details',
        footerText: 'BrusselsExplorer - Een project voor Dynamic Web',
        footerDataSource: 'Data via opendata.brussels',
        locationsContainerTitle: 'Culturele plaatsen in Brussel',
        loadingMessage: 'Locaties laden...',
        mapContainerTitle: 'Kaart',
        subtitle: 'Ontdekkingstocht door Brussel' // Added translation
    },
    fr: {
        searchPlaceholder: 'Rechercher des lieux...',
        searchButton: 'Rechercher',
        filterTypeLabel: 'Type:',
        filterTypeAll: 'Tous les types',
        sortByLabel: 'Trier par:',
        sortByName: 'Nom',
        sortByDistance: 'Distance',
        sortByPopularity: 'Popularité',
        favoritesSectionTitle: 'Mes favoris',
        favoritesEmptyMessage: 'Vous n\'avez pas encore ajouté de favoris.',
        viewDetailsButton: 'Plus de détails',
        footerText: 'BrusselsExplorer - Un projet pour Dynamic Web',
        footerDataSource: 'Données via opendata.brussels',
        locationsContainerTitle: 'Lieux culturels à Bruxelles',
        loadingMessage: 'Chargement des lieux...',
        mapContainerTitle: 'Carte',
        subtitle: 'Exploration de Bruxelles' // Added translation
    },
    en: {
        searchPlaceholder: 'Search locations...',
        searchButton: 'Search',
        filterTypeLabel: 'Type:',
        filterTypeAll: 'All types',
        sortByLabel: 'Sort by:',
        sortByName: 'Name',
        sortByDistance: 'Distance',
        sortByPopularity: 'Popularity',
        favoritesSectionTitle: 'My Favorites',
        favoritesEmptyMessage: 'You have not added any favorites yet.',
        viewDetailsButton: 'More details',
        footerText: 'BrusselsExplorer - A project for Dynamic Web',
        footerDataSource: 'Data via opendata.brussels',
        locationsContainerTitle: 'Cultural Places in Brussels',
        loadingMessage: 'Loading locations...',
        mapContainerTitle: 'Map',
        subtitle: 'Exploration Tour of Brussels' // Added translation
    }
};

// Event Listeners
themeSwitch.addEventListener('click', toggleTheme);
languageSelect.addEventListener('change', changeLanguage);

document.addEventListener('DOMContentLoaded', loadUserPreferences);

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkTheme', document.body.classList.contains('dark-theme'));
}

// Change language
function changeLanguage() {
    currentLanguage = languageSelect.value;

    // Update search input and button
    document.getElementById('search-input').placeholder = translations[currentLanguage].searchPlaceholder;
    document.getElementById('search-button').textContent = translations[currentLanguage].searchButton;

    // Update filter labels
    document.querySelectorAll('.filter-group label')[0].textContent = translations[currentLanguage].filterTypeLabel;
    document.querySelectorAll('.filter-group label')[1].textContent = translations[currentLanguage].sortByLabel;

    // Update filter options
    document.getElementById('filter-type').querySelector('option').textContent = translations[currentLanguage].filterTypeAll;
    document.getElementById('sort-by').querySelectorAll('option')[0].textContent = translations[currentLanguage].sortByName;
    document.getElementById('sort-by').querySelectorAll('option')[1].textContent = translations[currentLanguage].sortByDistance;
    document.getElementById('sort-by').querySelectorAll('option')[2].textContent = translations[currentLanguage].sortByPopularity;

    // Update favorites section
    document.getElementById('favorites-section').querySelector('h2').textContent = translations[currentLanguage].favoritesSectionTitle;
    document.getElementById('favorites-list').querySelector('p').textContent = translations[currentLanguage].favoritesEmptyMessage;

    // Update view details button in the template
    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
    viewDetailsButtons.forEach(button => {
        button.textContent = translations[currentLanguage].viewDetailsButton;
    });

    // Update locations container
    document.querySelector('.locations-container h2').textContent = translations[currentLanguage].locationsContainerTitle;
    document.getElementById('loading').querySelector('p').textContent = translations[currentLanguage].loadingMessage;

    // Update map container
    document.querySelector('.map-container h2').textContent = translations[currentLanguage].mapContainerTitle;

    // Update subtitle in the header
    document.querySelector('.title p').textContent = translations[currentLanguage].subtitle; // Update subtitle

    // Update footer
    const footer = document.querySelector('footer');
    footer.querySelector('p').textContent = translations[currentLanguage].footerText;
    footer.querySelectorAll('p')[1].innerHTML = `Data via <a href="https://opendata.brussels.be" target="_blank">opendata.brussels</a>`;
    
    localStorage.setItem('language', currentLanguage);
}

// Load user preferences
function loadUserPreferences() {
    // Load language
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
        currentLanguage = storedLanguage;
        languageSelect.value = currentLanguage;
        changeLanguage();
    }

    // Load theme
    if (localStorage.getItem('darkTheme') === 'true') {
        document.body.classList.add('dark-theme');
    }
}