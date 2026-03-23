import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HotelResult {
  id: string;
  name: string;
  pricePerNight: number;
  rating: number;
  distance: string;
  amenities: string[];
  image: string;
  address?: string;
  priceLevel?: string;
}

// Source 1: Geoapify Place Details — reads OSM `image` / `wikimedia_commons` tags
async function getGeoapifyPhoto(placeId: string, apiKey: string): Promise<string | null> {
  if (!placeId) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const url = `https://api.geoapify.com/v2/place-details?id=${encodeURIComponent(placeId)}&features=details&apiKey=${apiKey}`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = await response.json();
    const raw = data?.features?.[0]?.properties?.datasource?.raw;
    if (!raw) return null;
    if (raw.image && typeof raw.image === 'string' && raw.image.startsWith('http')) {
      return raw.image;
    }
    if (raw.wikimedia_commons) {
      const commons = String(raw.wikimedia_commons);
      const filename = commons.startsWith('File:') ? commons.slice(5) : commons;
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=400`;
    }
    return null;
  } catch {
    return null;
  }
}

// Source 2: Wikipedia geosearch by coordinates — finds the nearest geo-tagged article
async function getWikipediaPhotoByCoords(lat: number, lon: number): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=300&gslimit=3&format=json&origin=*`;
    const response = await fetch(searchUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'TactTrip/1.0 (travel planner)' },
    });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = await response.json();
    const results = data?.query?.geosearch;
    if (!results || results.length === 0) return null;

    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
    const title = results[0].title;
    const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=600&origin=*`;
    const imgResponse = await fetch(imgUrl, {
      signal: controller2.signal,
      headers: { 'User-Agent': 'TactTrip/1.0 (travel planner)' },
    });
    clearTimeout(timeoutId2);
    if (!imgResponse.ok) return null;
    const imgData = await imgResponse.json();
    const pages = imgData?.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0] as any;
    if (page?.thumbnail?.source) {
      let src = page.thumbnail.source as string;
      if (src.startsWith('//')) src = `https:${src}`;
      return src;
    }
    return null;
  } catch {
    return null;
  }
}

// Source 3: Wikipedia name search fallback
async function getWikimediaImageByName(name: string, city: string): Promise<string | null> {
  if (!name || name.trim().length === 0) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'TactTrip/1.0 (travel planner)' },
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      const pages = data?.query?.pages;
      if (pages) {
        const page = Object.values(pages)[0] as any;
        if (page?.thumbnail?.source) {
          let src: string = page.thumbnail.source;
          if (src.startsWith('//')) src = `https:${src}`;
          return src;
        }
      }
    }
    if (city) {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 4000);
      const url2 = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(`${name} ${city}`)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
      const response2 = await fetch(url2, {
        signal: controller2.signal,
        headers: { 'User-Agent': 'TactTrip/1.0 (travel planner)' },
      });
      clearTimeout(timeoutId2);
      if (response2.ok) {
        const data2 = await response2.json();
        const pages2 = data2?.query?.pages;
        if (pages2) {
          const page2 = Object.values(pages2)[0] as any;
          if (page2?.thumbnail?.source) {
            let src: string = page2.thumbnail.source;
            if (src.startsWith('//')) src = `https:${src}`;
            return src;
          }
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Tries all photo sources in priority order:
// 1. Geoapify place details (OSM tags) — most accurate
// 2. Wikipedia geosearch by GPS coordinates — location-accurate
// 3. Wikipedia name search — name-based fallback
async function getBestPhoto(
  placeId: string,
  name: string,
  city: string,
  lat: number,
  lon: number,
  apiKey: string,
): Promise<string | null> {
  const [geoapifyResult, coordResult] = await Promise.allSettled([
    getGeoapifyPhoto(placeId, apiKey),
    getWikipediaPhotoByCoords(lat, lon),
  ]);

  const geoapifyPhoto = geoapifyResult.status === 'fulfilled' ? geoapifyResult.value : null;
  const coordPhoto = coordResult.status === 'fulfilled' ? coordResult.value : null;

  if (geoapifyPhoto) return geoapifyPhoto;
  if (coordPhoto) return coordPhoto;

  return getWikimediaImageByName(name, city);
}

// Generic hotel fallback images
const HOTEL_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&q=80',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=80',
];

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city } = await req.json();

    if (!city) {
      return new Response(
        JSON.stringify({ error: 'City is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GEOAPIFY_API_KEY');

    if (!apiKey) {
      console.error('GEOAPIFY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Geoapify API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching hotels for city: ${city}`);

    // Step 1: Geocode the city
    const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city + ', India')}&format=json&apiKey=${apiKey}`;
    const geoResponse = await fetch(geocodeUrl);
    const geoData = await geoResponse.json();
    console.log('Geocode response:', JSON.stringify(geoData).substring(0, 200));

    if (!geoData.results || geoData.results.length === 0) {
      console.error('Failed to geocode city');
      return new Response(
        JSON.stringify({ hotels: [], message: 'No hotels found for this location', source: 'geocode_error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cityLocation = {
      lat: geoData.results[0].lat,
      lng: geoData.results[0].lon,
    };
    console.log(`City coordinates: ${cityLocation.lat}, ${cityLocation.lng}`);

    // Step 2: Search for hotels using Geoapify Places API
    const hotelsUrl = `https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:${cityLocation.lng},${cityLocation.lat},10000&limit=20&apiKey=${apiKey}`;
    const hotelsResponse = await fetch(hotelsUrl);
    const hotelsData = await hotelsResponse.json();
    console.log(`Hotels search found ${hotelsData.features?.length || 0} hotels`);

    if (!hotelsData.features || hotelsData.features.length === 0) {
      console.error('No hotels found from Geoapify');
      return new Response(
        JSON.stringify({ hotels: [], message: 'No hotels found for this location', source: 'no_results' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawHotels = hotelsData.features.slice(0, 8);

    // Fetch best photos for all hotels in parallel
    const photoPromises = rawHotels.map((feature: any) => {
      const place = feature.properties;
      const coords = feature.geometry?.coordinates || [cityLocation.lng, cityLocation.lat];
      return getBestPhoto(place.place_id || '', place.name || '', city, coords[1], coords[0], apiKey);
    });
    const photos = await Promise.all(photoPromises);

    // Transform results
    const hotels: HotelResult[] = rawHotels.map((feature: any, index: number) => {
      const place = feature.properties;
      const coords = feature.geometry?.coordinates || [cityLocation.lng, cityLocation.lat];

      const hotelLat = coords[1];
      const hotelLng = coords[0];
      const distanceKm = calculateDistance(cityLocation.lat, cityLocation.lng, hotelLat, hotelLng);

      const rating = place.datasource?.raw?.stars || (3 + Math.random() * 2);
      const priceLevel = Math.min(4, Math.floor(rating));
      const basePrice = 1500 + (priceLevel * 1500) + (rating * 200);
      const pricePerNight = Math.round(basePrice + Math.random() * 500);

      const priceLevelLabels = ['Free', 'Budget', 'Moderate', 'Expensive', 'Luxury'];
      const priceLevelLabel = priceLevelLabels[priceLevel] || 'Moderate';

      const amenities: string[] = ['WiFi'];
      if (rating >= 4) amenities.push('Breakfast');
      if (priceLevel >= 3) amenities.push('Pool', 'Spa');
      if (priceLevel >= 2) amenities.push('Parking');
      if (rating >= 4.5) amenities.push('Gym');

      const image = photos[index] || HOTEL_FALLBACK_IMAGES[index % HOTEL_FALLBACK_IMAGES.length];

      return {
        id: `hotel-${place.place_id || index}`,
        name: place.name || `Hotel in ${city}`,
        pricePerNight,
        rating: parseFloat(rating.toFixed(1)),
        distance: `${distanceKm.toFixed(1)} km from center`,
        amenities: amenities.slice(0, 4),
        image,
        address: place.formatted || place.address_line1 || `${city}, India`,
        priceLevel: priceLevelLabel,
      };
    });

    const validHotels = hotels.filter(h => h.name && !h.name.startsWith('Hotel in'));
    const finalHotels = validHotels.length > 0 ? validHotels : hotels;
    finalHotels.sort((a, b) => b.rating - a.rating);

    return new Response(
      JSON.stringify({ hotels: finalHotels, source: 'geoapify' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-hotels function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, hotels: [], message: 'No hotels found for this location' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
