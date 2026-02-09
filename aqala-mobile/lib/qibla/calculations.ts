// Kaaba coordinates in Mecca
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

/**
 * Calculate Qibla direction (bearing) from a given location
 * Returns the angle in degrees from North (0-360)
 */
export function calculateQiblaDirection(userLat: number, userLng: number): number {
    // Convert to radians
    const lat1 = toRadians(userLat);
    const lat2 = toRadians(KAABA_LAT);
    const lngDiff = toRadians(KAABA_LNG - userLng);

    // Calculate bearing using great-circle formula
    const x = Math.sin(lngDiff) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lngDiff);

    let bearing = Math.atan2(x, y);
    bearing = toDegrees(bearing);

    // Normalize to 0-360
    return (bearing + 360) % 360;
}

/**
 * Calculate distance to Kaaba in kilometers
 */
export function calculateDistanceToKaaba(userLat: number, userLng: number): number {
    const R = 6371; // Earth's radius in km

    const lat1 = toRadians(userLat);
    const lat2 = toRadians(KAABA_LAT);
    const latDiff = toRadians(KAABA_LAT - userLat);
    const lngDiff = toRadians(KAABA_LNG - userLng);

    const a = Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Get compass direction label from degrees
 */
export function getCompassDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    } else if (km < 10) {
        return `${km.toFixed(1)} km`;
    } else {
        return `${Math.round(km).toLocaleString()} km`;
    }
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}
