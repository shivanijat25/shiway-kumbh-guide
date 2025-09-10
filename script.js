// --- Enhanced JavaScript for Shiway App ---

// Global variables
let currentLocation = null;
let searchFilters = {
    food: '',
    traffic: 'all',
    emergency: 'all'
};

// --- Initialize App ---
document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
    setupEventListeners();
    startAnimations();
    updateVisitorCount();
});

// --- App Initialization ---
function initializeApp() {
    populateShahiSnan();
    populateFoodStations();
    populateTrafficAlerts();
    populateEmergencyContacts();
    setupSearchFunctionality();
    getCurrentLocation();
}

// --- Enhanced List Population ---
function populateShahiSnan() {
    const shahiContainer = document.getElementById("shahiSnanContainer");
    if (!shahiContainer) return;

    shahiContainer.innerHTML = "";
    data.shahiSnan.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-success";
        li.style.animationDelay = `${index * 0.1}s`;

        const timeUntil = getTimeUntilEvent(item.date, item.time);
        const statusBadge = getEventStatusBadge(item.date, item.time);

        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h5 class="mb-2"><i class="fas fa-calendar-alt me-2"></i>${item.name}</h5>
                    <p class="mb-1"><i class="fas fa-map-marker-alt me-2"></i>${item.address}</p>
                    <p class="mb-1"><i class="fas fa-clock me-2"></i>${item.date} | ${item.time}</p>
                    ${timeUntil ? `<small class="text-muted">${timeUntil}</small>` : ''}
                </div>
                <div class="text-end">
                    ${statusBadge}
                    <br>
                    <button class="btn btn-sm btn-outline-primary mt-2" onclick="showOnMap(${item.lat}, ${item.lng}, '${item.name}')">
                        <i class="fas fa-map me-1"></i>View on Map
                    </button>
                </div>
            </div>
        `;

        li.classList.add('fade-in-up');
        shahiContainer.appendChild(li);
    });
}

function populateFoodStations() {
    const foodContainer = document.getElementById("foodContainer");
    if (!foodContainer) return;

    foodContainer.innerHTML = "";

    // Add search and filter controls
    const searchControls = document.createElement("div");
    searchControls.className = "mb-4";
    searchControls.innerHTML = `
        <div class="row g-3">
            <div class="col-md-8">
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" class="form-control" id="foodSearch" placeholder="Search food stations...">
                </div>
            </div>
            <div class="col-md-4">
                <select class="form-select" id="availabilityFilter">
                    <option value="all">All Stations</option>
                    <option value="open">Currently Open</option>
                    <option value="closed">Currently Closed</option>
                </select>
            </div>
        </div>
    `;
    foodContainer.parentNode.insertBefore(searchControls, foodContainer);

    data.foodStations.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-success food-station-item";
        li.style.animationDelay = `${index * 0.1}s`;

        const isOpen = checkIfOpen(item.availability);
        const statusBadge = isOpen ?
            '<span class="badge bg-success">Open Now</span>' :
            '<span class="badge bg-secondary">Closed</span>';

        const distance = currentLocation ?
            calculateDistance(currentLocation.lat, currentLocation.lng, item.lat, item.lng) : null;

        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h5 class="mb-2">
                        <i class="fas fa-utensils me-2"></i>${item.name}
                        ${statusBadge}
                    </h5>
                    <p class="mb-1"><i class="fas fa-map-marker-alt me-2"></i>${item.address}</p>
                    <p class="mb-1"><i class="fas fa-clock me-2"></i>Available: ${item.availability}</p>
                    <p class="mb-0"><i class="fas fa-calendar me-2"></i>${item.date}</p>
                    ${distance ? `<small class="text-muted"><i class="fas fa-route me-1"></i>${distance.toFixed(1)} km away</small>` : ''}
                </div>
                <div class="text-end">
                    <button class="btn btn-sm btn-outline-primary mb-2" onclick="showOnMap(${item.lat}, ${item.lng}, '${item.name}')">
                        <i class="fas fa-map me-1"></i>Directions
                    </button>
                    <br>
                    <button class="btn btn-sm btn-outline-success" onclick="shareLocation('${item.name}', ${item.lat}, ${item.lng})">
                        <i class="fas fa-share me-1"></i>Share
                    </button>
                </div>
            </div>
        `;

        li.classList.add('fade-in-up');
        li.dataset.name = item.name.toLowerCase();
        li.dataset.status = isOpen ? 'open' : 'closed';
        foodContainer.appendChild(li);
    });

    setupFoodSearch();
}

function populateTrafficAlerts() {
    const trafficContainer = document.getElementById("trafficContainer");
    if (!trafficContainer) return;

    trafficContainer.innerHTML = "";

    // Add filter controls
    const filterControls = document.createElement("div");
    filterControls.className = "mb-4";
    filterControls.innerHTML = `
        <div class="btn-group w-100" role="group">
            <input type="radio" class="btn-check" name="trafficFilter" id="allTraffic" value="all" checked>
            <label class="btn btn-outline-primary" for="allTraffic">All Alerts</label>

            <input type="radio" class="btn-check" name="trafficFilter" id="highTraffic" value="high">
            <label class="btn btn-outline-danger" for="highTraffic">High Traffic</label>

            <input type="radio" class="btn-check" name="trafficFilter" id="clearTraffic" value="clear">
            <label class="btn btn-outline-success" for="clearTraffic">Clear Routes</label>
        </div>
    `;
    trafficContainer.parentNode.insertBefore(filterControls, trafficContainer);

    data.traffic.forEach((item, index) => {
        let liClass = "list-group-item-warning";
        let severity = "moderate";
        let icon = "fas fa-exclamation-triangle";

        if (item.info.includes("High Traffic")) {
            liClass = "list-group-item-danger";
            severity = "high";
            icon = "fas fa-times-circle";
        } else if (item.info.includes("Clear") || item.info.includes("Free")) {
            liClass = "list-group-item-success";
            severity = "clear";
            icon = "fas fa-check-circle";
        }

        const li = document.createElement("li");
        li.className = `list-group-item ${liClass} traffic-alert-item`;
        li.style.animationDelay = `${index * 0.1}s`;
        li.dataset.severity = severity;

        const lastUpdated = new Date();
        lastUpdated.setMinutes(lastUpdated.getMinutes() - Math.floor(Math.random() * 30));

        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1"><i class="${icon} me-2"></i>${item.info}</h6>
                    <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>Updated ${getTimeAgo(lastUpdated)}
                    </small>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary" onclick="showOnMap(${item.lat}, ${item.lng}, 'Traffic Alert')">
                        <i class="fas fa-map me-1"></i>View
                    </button>
                </div>
            </div>
        `;

        li.classList.add('fade-in-up');
        trafficContainer.appendChild(li);
    });

    setupTrafficFilter();
}

function populateEmergencyContacts() {
    const emergencyContainer = document.getElementById("emergencyContainer");
    if (!emergencyContainer) return;

    emergencyContainer.innerHTML = "";
    data.emergency.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-danger";
        li.style.animationDelay = `${index * 0.1}s`;

        const distance = currentLocation ?
            calculateDistance(currentLocation.lat, currentLocation.lng, item.lat, item.lng) : null;

        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="flex-grow-1">
                    <h6 class="mb-1"><i class="fas fa-ambulance me-2"></i>${item.info}</h6>
                    <p class="mb-1"><i class="fas fa-phone me-2"></i>${item.contact}</p>
                    ${distance ? `<small class="text-muted"><i class="fas fa-route me-1"></i>${distance.toFixed(1)} km away</small>` : ''}
                </div>
                <div class="text-end">
                    <a href="tel:${item.contact}" class="btn btn-danger btn-sm mb-2">
                        <i class="fas fa-phone me-1"></i>Call Now
                    </a>
                    <br>
                    <button class="btn btn-outline-primary btn-sm" onclick="showOnMap(${item.lat}, ${item.lng}, '${item.info}')">
                        <i class="fas fa-map me-1"></i>Locate
                    </button>
                </div>
            </div>
        `;

        li.classList.add('fade-in-up');
        emergencyContainer.appendChild(li);
    });
}

// --- Utility Functions ---
function getTimeUntilEvent(date, time) {
    const eventDateTime = new Date(`${date} ${time.split(' - ')[0]}`);
    const now = new Date();
    const diff = eventDateTime - now;

    if (diff < 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `Starts in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Starts in ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Starting soon';
}

function getEventStatusBadge(date, time) {
    const eventDateTime = new Date(`${date} ${time.split(' - ')[0]}`);
    const endDateTime = new Date(`${date} ${time.split(' - ')[1]}`);
    const now = new Date();

    if (now >= eventDateTime && now <= endDateTime) {
        return '<span class="badge bg-success">Live Now</span>';
    } else if (now < eventDateTime) {
        return '<span class="badge bg-primary">Upcoming</span>';
    } else {
        return '<span class="badge bg-secondary">Completed</span>';
    }
}

function checkIfOpen(availability) {
    const [startTime, endTime] = availability.split(' - ');
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    const start = parseTime(startTime);
    const end = parseTime(endTime);

    return currentTime >= start && currentTime <= end;
}

function parseTime(timeStr) {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 100 + (minutes || 0);
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                // Refresh food stations to show distances
                if (document.getElementById("foodContainer")) {
                    populateFoodStations();
                }
            },
            error => console.warn("Geolocation error:", error)
        );
    }
}

// --- Search and Filter Functions ---
function setupFoodSearch() {
    const searchInput = document.getElementById('foodSearch');
    const filterSelect = document.getElementById('availabilityFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterFoodStations);
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', filterFoodStations);
    }
}

function filterFoodStations() {
    const searchTerm = document.getElementById('foodSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('availabilityFilter')?.value || 'all';
    const items = document.querySelectorAll('.food-station-item');

    items.forEach(item => {
        const name = item.dataset.name;
        const status = item.dataset.status;

        const matchesSearch = name.includes(searchTerm);
        const matchesFilter = statusFilter === 'all' || status === statusFilter;

        if (matchesSearch && matchesFilter) {
            item.style.display = 'block';
            item.classList.add('fade-in-up');
        } else {
            item.style.display = 'none';
        }
    });
}

function setupTrafficFilter() {
    const filterInputs = document.querySelectorAll('input[name="trafficFilter"]');
    filterInputs.forEach(input => {
        input.addEventListener('change', filterTrafficAlerts);
    });
}

function filterTrafficAlerts() {
    const selectedFilter = document.querySelector('input[name="trafficFilter"]:checked')?.value || 'all';
    const items = document.querySelectorAll('.traffic-alert-item');

    items.forEach(item => {
        const severity = item.dataset.severity;

        if (selectedFilter === 'all' || severity === selectedFilter) {
            item.style.display = 'block';
            item.classList.add('fade-in-up');
        } else {
            item.style.display = 'none';
        }
    });
}

// --- Interactive Functions ---
function showOnMap(lat, lng, title) {
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m`;
    window.open(mapUrl, '_blank');
}

function shareLocation(name, lat, lng) {
    if (navigator.share) {
        navigator.share({
            title: `${name} - Shiway`,
            text: `Check out this location: ${name}`,
            url: `https://www.google.com/maps?q=${lat},${lng}`
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Location link copied to clipboard!');
        });
    }
}

function showWeather() {
    const modal = new bootstrap.Modal(document.getElementById('weatherModal'));
    modal.show();

    // Simulate weather data update
    updateWeatherData();
}

function updateWeatherData() {
    // In a real app, this would fetch from a weather API
    const weatherData = {
        temp: Math.floor(Math.random() * 10) + 25,
        humidity: Math.floor(Math.random() * 30) + 50,
        windSpeed: Math.floor(Math.random() * 15) + 5,
        visibility: Math.floor(Math.random() * 5) + 8
    };

    document.querySelector('.weather-temp').textContent = `${weatherData.temp}°C`;
    document.querySelector('.weather-details .weather-detail:nth-child(1) span:last-child').textContent = `${weatherData.humidity}%`;
    document.querySelector('.weather-details .weather-detail:nth-child(2) span:last-child').textContent = `${weatherData.windSpeed} km/h`;
    document.querySelector('.weather-details .weather-detail:nth-child(3) span:last-child').textContent = `${weatherData.visibility} km`;
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// --- Animation Functions ---
function startAnimations() {
    // Animate visitor count
    animateCounter();

    // Setup scroll animations
    setupScrollAnimations();

    // Setup service card hover effects
    setupServiceCardEffects();
}

function animateCounter() {
    const counter = document.getElementById('visitorCount');
    if (!counter) return;

    let count = 0;
    const target = 50000;
    const increment = target / 100;

    const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
            count = target;
            clearInterval(timer);
        }
        counter.textContent = `${Math.floor(count / 1000)}K+`;
    }, 20);
}

function updateVisitorCount() {
    // Simulate real-time visitor count updates
    setInterval(() => {
        const counter = document.getElementById('visitorCount');
        if (counter) {
            const currentCount = parseInt(counter.textContent.replace('K+', '')) * 1000;
            const newCount = currentCount + Math.floor(Math.random() * 10) + 1;
            counter.textContent = `${Math.floor(newCount / 1000)}K+`;
        }
    }, 30000); // Update every 30 seconds
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.service-card, .feature-item').forEach(el => {
        observer.observe(el);
    });
}

function setupServiceCardEffects() {
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// --- Event Listeners ---
function setupEventListeners() {
    // Smooth scrolling for scroll indicator
    document.querySelector('.scroll-indicator')?.addEventListener('click', () => {
        document.querySelector('.quick-actions-section').scrollIntoView({
            behavior: 'smooth'
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Service card click handlers
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-explore')) {
                const link = card.querySelector('.btn-explore');
                if (link && link.href) {
                    window.location.href = link.href;
                }
            }
        });
    });
}

// --- Enhanced Google Maps ---
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    const map = new google.maps.Map(mapElement, {
        center: { lat: 23.1822, lng: 75.7777 },
        zoom: 14,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
    });

    const infoWindow = new google.maps.InfoWindow();

    // Custom marker icons
    const markerIcons = {
        shahi: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="#FF6B35" stroke="white" stroke-width="2"/>
                    <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">📅</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(40, 40)
        },
        food: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="#06D6A0" stroke="white" stroke-width="2"/>
                    <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">🍛</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(40, 40)
        },
        traffic: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="#C73E1D" stroke="white" stroke-width="2"/>
                    <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">⚠️</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(40, 40)
        },
        emergency: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="#667eea" stroke="white" stroke-width="2"/>
                    <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">🚨</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(40, 40)
        }
    };

    // Add Shahi Snan markers
    data.shahiSnan.forEach(item => {
        const marker = new google.maps.Marker({
            position: { lat: item.lat, lng: item.lng },
            map: map,
            title: item.name,
            icon: markerIcons.shahi,
            animation: google.maps.Animation.DROP
        });

        marker.addListener('click', () => {
            infoWindow.setContent(`
                <div class="p-3">
                    <h6 class="mb-2">${item.name}</h6>
                    <p class="mb-1"><strong>Address:</strong> ${item.address}</p>
                    <p class="mb-1"><strong>Date:</strong> ${item.date}</p>
                    <p class="mb-0"><strong>Time:</strong> ${item.time}</p>
                </div>
            `);
            infoWindow.open(map, marker);
        });
    });

    // Add Food Station markers
    data.foodStations.forEach(item => {
        const marker = new google.maps.Marker({
            position: { lat: item.lat, lng: item.lng },
            map: map,
            title: item.name,
            icon: markerIcons.food,
            animation: google.maps.Animation.DROP
        });

        marker.addListener('click', () => {
            const isOpen = checkIfOpen(item.availability);
            infoWindow.setContent(`
                <div class="p-3">
                    <h6 class="mb-2">${item.name}</h6>
                    <p class="mb-1"><strong>Address:</strong> ${item.address}</p>
                    <p class="mb-1"><strong>Available:</strong> ${item.availability}</p>
                    <p class="mb-0">
                        <span class="badge ${isOpen ? 'bg-success' : 'bg-secondary'}">
                            ${isOpen ? 'Open Now' : 'Closed'}
                        </span>
                    </p>
                </div>
            `);
            infoWindow.open(map, marker);
        });
    });

    // Add Traffic markers
    data.traffic.forEach(item => {
        const marker = new google.maps.Marker({
            position: { lat: item.lat, lng: item.lng },
            map: map,
            title: item.info,
            icon: markerIcons.traffic,
            animation: google.maps.Animation.DROP
        });

        marker.addListener('click', () => {
            infoWindow.setContent(`
                <div class="p-3">
                    <h6 class="mb-2">Traffic Alert</h6>
                    <p class="mb-0">${item.info}</p>
                </div>
            `);
            infoWindow.open(map, marker);
        });
    });

    // Add Emergency markers
    data.emergency.forEach(item => {
        const marker = new google.maps.Marker({
            position: { lat: item.lat, lng: item.lng },
            map: map,
            title: item.info,
            icon: markerIcons.emergency,
            animation: google.maps.Animation.DROP
        });

        marker.addListener('click', () => {
            infoWindow.setContent(`
                <div class="p-3">
                    <h6 class="mb-2">Emergency Service</h6>
                    <p class="mb-2">${item.info}</p>
                    <a href="tel:${item.contact}" class="btn btn-danger btn-sm">
                        <i class="fas fa-phone me-1"></i>Call ${item.contact}
                    </a>
                </div>
            `);
            infoWindow.open(map, marker);
        });
    });

    // Show user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userPos = { lat: position.coords.latitude, lng: position.coords.longitude };

            const userMarker = new google.maps.Marker({
                position: userPos,
                map: map,
                title: "Your Location",
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                            <circle cx="15" cy="15" r="12" fill="#4285F4" stroke="white" stroke-width="3"/>
                            <circle cx="15" cy="15" r="4" fill="white"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(30, 30)
                }
            });

            map.setCenter(userPos);

            userMarker.addListener('click', () => {
                infoWindow.setContent(`
                    <div class="p-3 text-center">
                        <h6 class="mb-2">📍 Your Location</h6>
                        <p class="mb-0">You are here</p>
                    </div>
                `);
                infoWindow.open(map, userMarker);
            });
        });
    }
}

// Initialize map when window loads
if (typeof google !== 'undefined') {
    window.onload = initMap;
} else {
    // Fallback if Google Maps API is not loaded
    console.warn('Google Maps API not loaded');
}
