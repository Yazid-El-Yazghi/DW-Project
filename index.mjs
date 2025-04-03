// Constants
const API_URL = 'https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_lieux_culturels/records?limit=20';

// DOM Elements
const locationsListElement = document.getElementById('locations-list');
const loadingElement = document.getElementById('loading');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const filterTypeElement = document.getElementById('filter-type');
const sortByElement = document.getElementById('sort-by');
const themeSwitch = document.getElementById('theme-switch');
const languageSelect = document.getElementById('language-select');
const backButton = document.getElementById('back-button');
const locationDetailSection = document.getElementById('location-detail');
const locationDetailContent = document.getElementById('location-detail-content');
const favoritesSection = document.getElementById('favorites-section');
const favoritesList = document.getElementById('favorites-list');
const mapElement = document.getElementById('map');
const favoritesButton = document.getElementById('favorites-button');

// State variables
let locations = [];
let filteredLocations = [];
let favorites = [];
let currentPosition = null;
let currentLanguage = 'nl';
let map = null;
let markers = [];

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
        favoritesSectionTitle: 'Mijn favorieten',
        favoritesEmptyMessage: 'Je hebt nog geen favorieten toegevoegd.',
        viewDetailsButton: 'Meer details',
        backButton: '← Terug',
        footerText: 'BrusselsExplorer - Een project voor Dynamic Web',
        footerDataSource: 'Data via opendata.brussels',
        locationsContainerTitle: 'Culturele plaatsen in Brussel',
        loadingMessage: 'Locaties laden...',
        mapContainerTitle: 'Kaart',
        subtitle: 'Ontdekkingstocht door Brussel',
        allTypes: 'Alle types',
        noResults: 'Geen locaties gevonden.',
        loading: 'Locaties laden...',
        moreDetails: 'Meer details',
        noFavorites: 'Je hebt nog geen favorieten.',
        errorLoading: 'Fout bij het laden van gegevens.',
        welcomeMessage: 'Zoek naar locaties in Brussel of klik op de kaart',
        yourLocation: 'Jouw locatie',
        addToFavorites: 'Voeg toe aan favorieten',
        removeFromFavorites: 'Verwijder uit favorieten',
        showDetails: 'Toon details',
        tryAgain: 'Probeer opnieuw',
        favorites: 'Favorieten',
        showFavorites: 'Toon favorieten',
        hideFavorites: 'Verberg favorieten'
    },
    fr: {
        searchPlaceholder: 'Rechercher des lieux...',
        searchButton: 'Rechercher',
        filterTypeLabel: 'Type:',
        filterTypeAll: 'Tous les types',
        sortByLabel: 'Trier par:',
        sortByName: 'Nom',
        sortByDistance: 'Distance',
        favoritesSectionTitle: 'Mes favoris',
        favoritesEmptyMessage: 'Vous n\'avez pas encore ajouté de favoris.',
        viewDetailsButton: 'Plus de détails',
        backButton: '← Retour',
        footerText: 'BrusselsExplorer - Un projet pour Dynamic Web',
        footerDataSource: 'Données via opendata.brussels',
        locationsContainerTitle: 'Lieux culturels à Bruxelles',
        loadingMessage: 'Chargement des lieux...',
        mapContainerTitle: 'Carte',
        subtitle: 'Exploration de Bruxelles',
        allTypes: 'Tous les types',
        noResults: 'Aucun lieu trouvé.',
        loading: 'Chargement des lieux...',
        moreDetails: 'Plus de détails',
        noFavorites: 'Vous n\'avez pas encore de favoris.',
        errorLoading: 'Erreur lors du chargement des données.',
        welcomeMessage: 'Recherchez des lieux à Bruxelles ou cliquez sur la carte',
        yourLocation: 'Votre position',
        addToFavorites: 'Ajouter aux favoris',
        removeFromFavorites: 'Retirer des favoris',
        showDetails: 'Afficher les détails',
        tryAgain: 'Réessayer',
        favorites: 'Favoris',
        showFavorites: 'Afficher les favoris',
        hideFavorites: 'Masquer les favoris'
    },
    en: {
        searchPlaceholder: 'Search locations...',
        searchButton: 'Search',
        filterTypeLabel: 'Type:',
        filterTypeAll: 'All types',
        sortByLabel: 'Sort by:',
        sortByName: 'Name',
        sortByDistance: 'Distance',
        favoritesSectionTitle: 'My Favorites',
        favoritesEmptyMessage: 'You have not added any favorites yet.',
        viewDetailsButton: 'More details',
        backButton: '← Back',
        footerText: 'BrusselsExplorer - A project for Dynamic Web',
        footerDataSource: 'Data via opendata.brussels',
        locationsContainerTitle: 'Cultural Places in Brussels',
        loadingMessage: 'Loading locations...',
        mapContainerTitle: 'Map',
        subtitle: 'Exploration Tour of Brussels',
        allTypes: 'All types',
        noResults: 'No locations found.',
        loading: 'Loading locations...',
        moreDetails: 'More details',
        noFavorites: 'You have no favorites yet.',
        errorLoading: 'Error loading data.',
        welcomeMessage: 'Search for locations in Brussels or click on the map',
        yourLocation: 'Your location',
        addToFavorites: 'Add to favorites',
        removeFromFavorites: 'Remove from favorites',
        showDetails: 'Show details',
        tryAgain: 'Try again',
        favorites: 'Favorites',
        showFavorites: 'Show favorites',
        hideFavorites: 'Hide favorites'
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', initialize);
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', event => {
    if (event.key === 'Enter') performSearch();
});
filterTypeElement.addEventListener('change', filterAndDisplayLocations);
sortByElement.addEventListener('change', filterAndDisplayLocations);
themeSwitch.addEventListener('click', toggleTheme);
languageSelect.addEventListener('change', changeLanguage);
backButton.addEventListener('click', () => {
    locationDetailSection.style.display = 'none';
});
favoritesButton.addEventListener('click', toggleFavoritesSection);

// Initialization function
async function initialize() {
    // Verberg detail view bij het starten
    locationDetailSection.style.display = 'none';
    
    // Show loading indicator
    showLoading();
    
    // Load preferences and favorites
    loadUserPreferences();
    loadFavorites();
    
    // Try to get location
    try {
        await getUserLocation();
    } catch (error) {
        console.warn('Could not get location:', error.message);
    }
    
    // Fetch location data
    try {
        await fetchLocations();
        populateFilterOptions();
        
        // Toon welkomstbericht zoals ervoor
        locationsListElement.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-search"></i>
                <p>Search for locations in Brussels or click on the map</p>
            </div>
        `;
        
        initMap();
        // Toon alle locaties op de kaart
        updateMap(locations);
    } catch (error) {
        console.error('Error fetching data:', error);
        showError(translations[currentLanguage].errorLoading);
    }
    
    hideLoading();
}

// Fetch data from API
async function fetchLocations() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if valid data
        if (!data || !data.results || !data.results.length) {
            throw new Error('No valid data received');
        }
        
        // Process the data
        locations = data.results.map((item, index) => {
            // Collect different location types
            const locationType = item.plaats || item.lieu || 'Brussel';
            
            // Add to filter options
            if (!filterTypeElement.querySelector(`option[value="${locationType}"]`)) {
                const option = document.createElement('option');
                option.value = locationType;
                option.textContent = locationType;
                filterTypeElement.appendChild(option);
            }
            
            // Get coordinates
            let coordinates = null;
            if (item.coordonnees_geographiques) {
                coordinates = {
                    lat: item.coordonnees_geographiques.lat,
                    lon: item.coordonnees_geographiques.lon
                };
            }
            
            return {
                id: index.toString(),
                name: item.beschrijving || item.description || 'Unknown location',
                type: locationType,
                address: `${item.adres || item.adresse || ''}, ${item.code_postal || ''}`,
                description: item.beschrijving || item.description || 'No description available',
                coordinates: coordinates,
                googleMaps: item.google_maps || null,
                distance: currentPosition && coordinates ? 
                    calculateDistance(
                        currentPosition.latitude, 
                        currentPosition.longitude,
                        coordinates.lat,
                        coordinates.lon
                    ) : null
            };
        });
        
        return locations;
    } catch (error) {
        console.error('Error fetching locations:', error);
        throw error;
    }
}

// Filter and sort locations
function filterAndDisplayLocations() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterType = filterTypeElement.value;
    const sortBy = sortByElement.value;
    
    // Filter locations
    filteredLocations = locations.filter(location => {
        const matchesSearch = !searchTerm || 
                              location.name.toLowerCase().includes(searchTerm) || 
                              location.description.toLowerCase().includes(searchTerm);
        const matchesType = filterType === 'all' || location.type === filterType;
        
        return matchesSearch && matchesType;
    });
    
    // Sort locations
    filteredLocations.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'distance':
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            default:
                return 0;
        }
    });
    
    displayLocations(filteredLocations);
    updateMap(filteredLocations);
}

// Display locations in the list
function displayLocations(locationsToDisplay) {
    locationsListElement.innerHTML = '';
    
    if (locationsToDisplay.length === 0) {
        // Als er geen locaties zijn om te tonen
        const showingFavorites = favoritesButton.classList.contains('active');
        
        locationsListElement.innerHTML = `
            <div class="no-results">
                <i class="fas fa-${showingFavorites ? 'heart' : 'search'}"></i>
                <p>${showingFavorites ? 'No favorites found' : 'No locations found'}</p>
            </div>
        `;
        return;
    }
    
    locationsToDisplay.forEach(location => {
        const card = createLocationCard(location);
        locationsListElement.appendChild(card);
    });
}

// Create a location card
function createLocationCard(location) {
    const card = document.createElement('div');
    card.className = 'location-card';
    card.dataset.id = location.id;
    
    card.innerHTML = `
        <div class="location-header">
            <h3 class="location-name">${location.name}</h3>
            <button class="favorite-btn" aria-label="${favorites.includes(location.id) ? translations[currentLanguage].removeFromFavorites : translations[currentLanguage].addToFavorites}">
                <i class="${favorites.includes(location.id) ? 'fas' : 'far'} fa-heart"></i>
            </button>
        </div>
        <div class="location-details">
            <p class="location-type"><i class="fas fa-tag"></i> ${location.type}</p>
            <p class="location-address"><i class="fas fa-map-marker-alt"></i> ${location.address}</p>
            ${location.distance ? `<p class="location-distance"><i class="fas fa-location-arrow"></i> ${location.distance.toFixed(1)} km</p>` : ''}
            <button class="view-details-btn">${translations[currentLanguage].moreDetails}</button>
        </div>
    `;
    
    // Event listeners
    card.querySelector('.favorite-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(location.id);
    });
    
    card.querySelector('.view-details-btn').addEventListener('click', () => {
        showDetailView(location);
    });
    
    return card;
}

// Show detail view
function showDetailView(location) {
    locationDetailContent.innerHTML = `
        <h2>${location.name}</h2>
        <div class="detail-info">
            <p><strong>Type:</strong> ${location.type}</p>
            <p><strong>Adres:</strong> ${location.address}</p>
            ${location.distance ? `<p><strong>Afstand:</strong> ${location.distance.toFixed(1)} km</p>` : ''}
        </div>
        
        <div class="detail-description">
            <p>${location.description}</p>
        </div>
        
        ${location.googleMaps ? `
        <a href="${location.googleMaps}" target="_blank" class="map-link">
            <i class="fas fa-map-marker-alt"></i> Google Maps
        </a>` : ''}
        
        <button id="detail-favorite-btn" class="${favorites.includes(location.id) ? 'active' : ''}">
            <i class="${favorites.includes(location.id) ? 'fas' : 'far'} fa-heart"></i>
            ${favorites.includes(location.id) ? translations[currentLanguage].removeFromFavorites : translations[currentLanguage].addToFavorites}
        </button>
    `;
    
    // Favorite button in detail view
    document.getElementById('detail-favorite-btn').addEventListener('click', () => {
        toggleFavorite(location.id);
        showDetailView(location); // Show detail view again to update the button
    });
    
    locationDetailSection.style.display = 'block';
    
    // Scroll naar de detailsectie
    locationDetailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Toggle favorite
function toggleFavorite(locationId) {
    const index = favorites.indexOf(locationId);
    
    if (index === -1) {
        // Add to favorites
        favorites.push(locationId);
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
    }
    
    // Update UI
    document.querySelectorAll(`.location-card[data-id="${locationId}"] .favorite-btn i`).forEach(icon => {
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
    });
    
    // Als we favorieten bekijken, update dan de weergave
    if (favoritesButton.classList.contains('active')) {
        // Toon alleen favorieten
        displayLocations(locations.filter(location => favorites.includes(location.id)));
        // Update de kaart
        updateMap(locations.filter(location => favorites.includes(location.id)));
    }
    
    // Save
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Populate filter options
function populateFilterOptions() {
    // Filter options are already populated during loading of locations
}

// Search function
function performSearch() {
    filterAndDisplayLocations();
    
    // Wanneer we zoeken, update ook de kaart met de gefilterde resultaten
    if (map) {
        updateMap(filteredLocations);
    }
}

// Change language
function changeLanguage() {
    currentLanguage = languageSelect.value;
    
    // Update UI texts
    searchInput.placeholder = translations[currentLanguage].searchPlaceholder;
    searchButton.textContent = translations[currentLanguage].searchButton;
    backButton.textContent = translations[currentLanguage].backButton;
    
    // Update favorites button
    const showingFavorites = favoritesButton.classList.contains('active');
    favoritesButton.setAttribute('aria-label', showingFavorites ? 
        translations[currentLanguage].hideFavorites : 
        translations[currentLanguage].showFavorites);
    favoritesButton.title = showingFavorites ? 
        translations[currentLanguage].hideFavorites : 
        translations[currentLanguage].showFavorites;
    
    // Update filter labels
    document.querySelectorAll('.filter-group label')[0].textContent = translations[currentLanguage].filterTypeLabel;
    document.querySelectorAll('.filter-group label')[1].textContent = translations[currentLanguage].sortByLabel;

    // Update filter options
    document.getElementById('filter-type').querySelector('option').textContent = translations[currentLanguage].filterTypeAll;
    document.getElementById('sort-by').querySelectorAll('option')[0].textContent = translations[currentLanguage].sortByName;
    document.getElementById('sort-by').querySelectorAll('option')[1].textContent = translations[currentLanguage].sortByDistance;

    // Update view details button in the template
    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
    viewDetailsButtons.forEach(button => {
        button.textContent = translations[currentLanguage].viewDetailsButton;
    });

    // Update locations container
    document.querySelector('.locations-container h2').textContent = translations[currentLanguage].locationsContainerTitle;
    document.getElementById('loading').querySelector('p').textContent = translations[currentLanguage].loadingMessage;
    
    // Check if welcome message is showing, and update it if it is
    const welcomeMessage = document.querySelector('.welcome-message p');
    if (welcomeMessage) {
        welcomeMessage.textContent = translations[currentLanguage].welcomeMessage;
    }

    // Update map container
    document.querySelector('.map-container h2').textContent = translations[currentLanguage].mapContainerTitle;

    // Update subtitle in the header
    document.querySelector('.title p').textContent = translations[currentLanguage].subtitle;
    
    // Update preferences
    localStorage.setItem('language', currentLanguage);
    
    // Update display if there are filtered locations
    if (filteredLocations.length > 0 && locationsListElement.querySelector('.welcome-message') === null) {
        displayLocations(filteredLocations);
    }
}

// Get current location
async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            position => {
                currentPosition = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                resolve(currentPosition);
            },
            error => reject(error),
            { enableHighAccuracy: true, timeout: 5000 }
        );
    });
}

// Calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkTheme', document.body.classList.contains('dark-theme'));
}

// Load favorites
function loadFavorites() {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
        favorites = JSON.parse(storedFavorites);
    }
}

// Toggle favorites section
function toggleFavoritesSection() {
    // Controleer of we momenteel favorieten tonen
    const showingFavorites = favoritesButton.classList.contains('active');
    
    // Toggle de status van de knop
    favoritesButton.classList.toggle('active');
    
    if (!showingFavorites) {
        // Toon alleen favorieten in de locatielijst
        displayLocations(locations.filter(location => favorites.includes(location.id)));
        // Update de kaart om alleen favorieten te tonen
        updateMap(locations.filter(location => favorites.includes(location.id)));
        // Update de knop
        favoritesButton.setAttribute('aria-label', 'Hide favorites');
        favoritesButton.title = 'Hide favorites';
    } else {
        // Toon zoekresultaten als er filters zijn toegepast, anders toon welkomstbericht
        if (searchInput.value || filterTypeElement.value !== 'all') {
            // Er is een zoekopdracht of filter actief
            filterAndDisplayLocations();
        } else {
            // Toon weer het welkomstbericht
            locationsListElement.innerHTML = `
                <div class="welcome-message">
                    <i class="fas fa-search"></i>
                    <p>Search for locations in Brussels or click on the map</p>
                </div>
            `;
        }
        // Toon weer alle locaties op de kaart
        updateMap(locations);
        // Update de knop
        favoritesButton.setAttribute('aria-label', 'Show favorites');
        favoritesButton.title = 'Show favorites';
    }
}

// Update favorites button state
function updateFavoritesButtonState(isActive) {
    if (isActive) {
        favoritesButton.classList.add('active');
        favoritesButton.setAttribute('aria-label', translations[currentLanguage].hideFavorites);
        favoritesButton.title = translations[currentLanguage].hideFavorites;
    } else {
        favoritesButton.classList.remove('active');
        favoritesButton.setAttribute('aria-label', translations[currentLanguage].showFavorites);
        favoritesButton.title = translations[currentLanguage].showFavorites;
    }
}

// Display favorites
function displayFavorites() {
    // Update de titel
    document.querySelector('#favorites-section h2').textContent = translations[currentLanguage].favoritesSectionTitle;
    
    if (favorites.length === 0) {
        // Geen favorieten
        favoritesList.innerHTML = `<p>${translations[currentLanguage].noFavorites}</p>`;
        return;
    }
    
    // Maak de lijst leeg
    favoritesList.innerHTML = '';
    
    // Filter locaties om alleen favorieten weer te geven
    const favoriteLocations = locations.filter(location => favorites.includes(location.id));
    
    // Toon elke favoriete locatie
    favoriteLocations.forEach(location => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.dataset.id = location.id;
        
        favoriteItem.innerHTML = `
            <h3>${location.name}</h3>
            <p>${location.type}</p>
            <div class="favorite-actions">
                <button class="view-favorite-btn">${translations[currentLanguage].viewDetailsButton}</button>
                <button class="remove-favorite-btn">${translations[currentLanguage].removeFromFavorites}</button>
            </div>
        `;
        
        // Event listeners
        favoriteItem.querySelector('.view-favorite-btn').addEventListener('click', () => {
            showDetailView(location);
        });
        
        favoriteItem.querySelector('.remove-favorite-btn').addEventListener('click', () => {
            toggleFavorite(location.id);
            displayFavorites(); // Update de favorietenlijst
        });
        
        favoritesList.appendChild(favoriteItem);
    });
}

// Load user preferences
function loadUserPreferences() {
    // Load language
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
        currentLanguage = storedLanguage;
        languageSelect.value = currentLanguage;
    }
    
    // Load theme
    const darkTheme = localStorage.getItem('darkTheme') === 'true';
    if (darkTheme) {
        document.body.classList.add('dark-theme');
    }
}

// Show loading indicator
function showLoading() {
    loadingElement.style.display = 'flex';
}

// Hide loading indicator
function hideLoading() {
    loadingElement.style.display = 'none';
}

// Show error message
function showError(message) {
    locationsListElement.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button onclick="location.reload()">Try again</button>
        </div>
    `;
}

// Initialize the map
function initMap() {
    // Check if the Leaflet library is available
    if (!window.L) {
        // Load Leaflet if it's not available
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
        document.head.appendChild(link);
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
        script.onload = () => createMap();
        document.head.appendChild(script);
    } else {
        createMap();
    }
}

// Create the map
function createMap() {
    if (!window.L) return;
    
    // Initially center on Brussels
    const brussels = [50.85045, 4.34878];
    
    // If there's a current position, use that
    const center = currentPosition ? 
                 [currentPosition.latitude, currentPosition.longitude] : 
                 brussels;
    
    // Create the map
    map = L.map(mapElement).setView(center, 13);
    
    // Add a map layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Mark the current location if available with a red marker
    if (currentPosition) {
        // Maak een aangepast rood icoon
        const redIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #e74c3c; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
        
        L.marker([currentPosition.latitude, currentPosition.longitude], {
            icon: redIcon,
            zIndexOffset: 1000 // Zorg dat deze marker bovenop andere markers blijft
        })
        .addTo(map)
        .bindPopup(translations[currentLanguage].yourLocation)
        .openPopup();
    }
    
    // Add event listener to map clicks
    map.on('click', function(e) {
        // Find the closest location to the clicked point
        let closestLocation = null;
        let minDistance = Infinity;
        
        locations.forEach(location => {
            if (location.coordinates) {
                const distance = calculateDistance(
                    e.latlng.lat, 
                    e.latlng.lng, 
                    location.coordinates.lat, 
                    location.coordinates.lon
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestLocation = location;
                }
            }
        });
        
        // If a close location was found (within 1km), show its details
        if (closestLocation && minDistance < 1) {
            showDetailView(closestLocation);
        }
    });
    
    // Add locations to the map
    updateMap(locations); // Toon alle locaties op de kaart
}

// Update the map markers
function updateMap(locationsToShow) {
    if (!map) return;
    
    // Remove existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Add new markers
    locationsToShow.forEach(location => {
        if (location.coordinates) {
            const marker = L.marker([location.coordinates.lat, location.coordinates.lon])
                .addTo(map)
                .bindPopup(`
                    <div class="marker-popup">
                        <h3>${location.name}</h3>
                        <p>${location.address}</p>
                        <button class="popup-details-btn">${translations[currentLanguage].showDetails}</button>
                    </div>
                `);
            
            // Add event listener to the popup for the details button
            marker.on('popupopen', () => {
                const detailsBtn = document.querySelector('.popup-details-btn');
                if (detailsBtn) {
                    detailsBtn.addEventListener('click', () => {
                        showDetailView(location);
                        marker.closePopup();
                    });
                }
            });
            
            markers.push(marker);
        }
    });
    
    // If there are markers, make sure they all fit on the map
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1)); // Pad for some extra space
    }
}