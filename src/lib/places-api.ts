import { Redis } from "@upstash/redis";
import { rateLimiters } from "@/lib/rate-limit";

const redisUrl =
    process.env.KV_REST_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken =
    process.env.KV_REST_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken
    ? new Redis({ url: redisUrl, token: redisToken })
    : null;

export interface PlaceResult {
    place_id: string;
    formatted_address: string;
    name?: string;
    geometry?: {
        location: {
            lat: number;
            lng: number;
        };
    };
    address_components?: Array<{
        long_name: string;
        short_name: string;
        types: string[];
    }>;
    types?: string[];
}

export interface PlacesSearchParams {
    query: string;
    types?: string;
    country?: string;
}

export async function searchPlaces(
    params: PlacesSearchParams,
    userId: string
): Promise<{ places: PlaceResult[]; fromCache: boolean }> {
    const { query, types, country } = params;

    // Create cache key
    const cacheKey = `places:${userId}:${query}:${types || ""}:${
        country || ""
    }`;

    // Check cache first
    if (redis) {
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return { places: cached as PlaceResult[], fromCache: true };
            }
        } catch (error) {
            console.warn("Cache read error:", error);
        }
    }

    // Apply rate limiting (uses centralized Upstash config)
    const placesLimiter = rateLimiters.places;
    if (placesLimiter) {
        const { success, reset } = await placesLimiter.limit(`user:${userId}`);
        if (!success) {
            throw new Error(
                `Rate limit exceeded. Try again in ${Math.ceil(
                    (reset - Date.now()) / 1000
                )} seconds.`
            );
        }
    }

    // Validate query parameters
    if (!query || query.trim().length === 0) {
        throw new Error("Query parameter is required");
    }

    if (query.length > 100) {
        throw new Error("Query too long (max 100 characters)");
    }

    // Validate types parameter
    const allowedTypes = [
        "accounting",
        "airport",
        "amusement_park",
        "aquarium",
        "art_gallery",
        "atm",
        "bakery",
        "bank",
        "bar",
        "beauty_salon",
        "bicycle_store",
        "book_store",
        "bowling_alley",
        "bus_station",
        "cafe",
        "campground",
        "car_dealer",
        "car_rental",
        "car_repair",
        "car_wash",
        "casino",
        "cemetery",
        "church",
        "city_hall",
        "clothing_store",
        "convenience_store",
        "courthouse",
        "dentist",
        "department_store",
        "doctor",
        "drugstore",
        "electrician",
        "electronics_store",
        "embassy",
        "fire_station",
        "florist",
        "funeral_home",
        "furniture_store",
        "gas_station",
        "gym",
        "hair_care",
        "hardware_store",
        "hindu_temple",
        "home_goods_store",
        "hospital",
        "insurance_agency",
        "jewelry_store",
        "laundry",
        "lawyer",
        "library",
        "light_rail_station",
        "liquor_store",
        "local_government_office",
        "locksmith",
        "lodging",
        "meal_delivery",
        "meal_takeaway",
        "mosque",
        "movie_rental",
        "movie_theater",
        "moving_company",
        "museum",
        "night_club",
        "painter",
        "park",
        "parking",
        "pet_store",
        "pharmacy",
        "physiotherapist",
        "plumber",
        "police",
        "post_office",
        "primary_school",
        "real_estate_agency",
        "restaurant",
        "roofing_contractor",
        "rv_park",
        "school",
        "secondary_school",
        "shoe_store",
        "shopping_mall",
        "spa",
        "stadium",
        "storage",
        "store",
        "subway_station",
        "supermarket",
        "synagogue",
        "taxi_stand",
        "tourist_attraction",
        "train_station",
        "transit_station",
        "travel_agency",
        "university",
        "veterinary_care",
        "zoo",
    ];

    if (types && !allowedTypes.includes(types)) {
        throw new Error(
            `Invalid type parameter. Must be one of: ${allowedTypes
                .slice(0, 10)
                .join(", ")}...`
        );
    }

    // Validate country parameter
    if (country && country.length !== 2) {
        throw new Error("Country parameter must be a 2-letter country code");
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        throw new Error("Google Places API key not configured");
    }

    // Build the Google Places API Text Search URL
    const baseUrl =
        "https://maps.googleapis.com/maps/api/place/textsearch/json";
    const searchParams = new URLSearchParams({
        query: query.trim(),
        key: apiKey,
    });

    if (types) {
        searchParams.append("type", types);
    }

    if (country) {
        searchParams.append("region", country);
    }

    const googleApiUrl = `${baseUrl}?${searchParams.toString()}`;

    try {
        const response = await fetch(googleApiUrl);

        if (!response.ok) {
            throw new Error(
                `Google Places API error: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
            throw new Error(
                `Google Places API status error: ${data.status} - ${
                    data.error_message || "Unknown error"
                }`
            );
        }

        // Transform the results to match our PlaceResult interface
        const places: PlaceResult[] = (data.results || [])
            .slice(0, 10) // Limit to 10 results
            .map((place: any) => ({
                place_id: place.place_id,
                formatted_address: place.formatted_address,
                name: place.name,
                geometry: place.geometry
                    ? {
                          location: {
                              lat: place.geometry.location.lat,
                              lng: place.geometry.location.lng,
                          },
                      }
                    : undefined,
                address_components: place.address_components,
                types: place.types,
            }));

        // Cache the results for 1 hour
        if (redis) {
            try {
                await redis.setex(cacheKey, 3600, places);
            } catch (error) {
                console.warn("Cache write error:", error);
            }
        }

        return { places, fromCache: false };
    } catch (error) {
        console.error("Places API error:", error);
        throw error;
    }
}
