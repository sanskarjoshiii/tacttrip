import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaceResult {
  id: string;
  name: string;
  description: string;
  type: 'attraction' | 'food' | 'shopping' | 'nearby';
  category?: string;
  image: string;
  rating?: number;
  address?: string;
  distance?: string;
}

// Haversine distance in km
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
    // Direct image URL stored in OSM
    if (raw.image && typeof raw.image === 'string' && raw.image.startsWith('http')) {
      return raw.image;
    }
    // Wikimedia Commons file reference stored in OSM
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

    // Fetch the thumbnail for the closest matching article
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

// Source 3: Wikipedia name search (original fallback)
async function getWikimediaImage(placeName: string, city: string): Promise<string | null> {
  if (!placeName || placeName.trim().length === 0) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(placeName)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
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
      const url2 = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(`${placeName} ${city}`)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
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
  placeName: string,
  city: string,
  lat: number,
  lon: number,
  apiKey: string,
): Promise<string | null> {
  // Run the two fastest sources in parallel
  const [geoapifyResult, coordResult] = await Promise.allSettled([
    getGeoapifyPhoto(placeId, apiKey),
    getWikipediaPhotoByCoords(lat, lon),
  ]);

  const geoapifyPhoto = geoapifyResult.status === 'fulfilled' ? geoapifyResult.value : null;
  const coordPhoto = coordResult.status === 'fulfilled' ? coordResult.value : null;

  if (geoapifyPhoto) return geoapifyPhoto;
  if (coordPhoto) return coordPhoto;

  // Final fallback: Wikipedia name search
  return getWikimediaImage(placeName, city);
}

// Generic fallback images by place type
const PLACEHOLDER_IMAGES: Record<string, string[]> = {
  attraction: [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400',
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400',
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
  ],
  food: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400',
  ],
  shopping: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400',
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400',
    'https://images.unsplash.com/photo-1583922606661-0822ed0bd916?w=400',
    'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400',
  ],
  nearby: [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
    'https://images.unsplash.com/photo-1519922639192-e73293ca430e?w=400',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
  ],
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, type } = await req.json();

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

    console.log(`Fetching places for city: ${city}, type: ${type}`);

    // Step 1: Geocode the city
    const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city + ', India')}&format=json&apiKey=${apiKey}`;
    const geoResponse = await fetch(geocodeUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      console.error('Failed to geocode city');
      return new Response(
        JSON.stringify({ places: [], message: 'No places found for this location', source: 'geocode_error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cityLocation = {
      lat: geoData.results[0].lat,
      lng: geoData.results[0].lon,
    };

    // ── NEARBY PLACES (50 km radius) ───────────────────────────────────────────
    if (type === 'nearby') {
      const nearbyUrl = `https://api.geoapify.com/v2/places?categories=tourism.sights,tourism.attraction&filter=circle:${cityLocation.lng},${cityLocation.lat},50000&limit=15&apiKey=${apiKey}`;
      const nearbyResponse = await fetch(nearbyUrl);
      const nearbyData = await nearbyResponse.json();
      console.log(`Nearby places found: ${nearbyData.features?.length || 0}`);

      if (!nearbyData.features || nearbyData.features.length === 0) {
        return new Response(
          JSON.stringify({ places: [], message: 'No nearby places found', source: 'no_results' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const rawNearby = nearbyData.features.slice(0, 8);

      // Fetch photos in parallel for all nearby places
      const photoPromises = rawNearby.map((feature: any) => {
        const place = feature.properties;
        const lat = feature.geometry?.coordinates?.[1] ?? cityLocation.lat;
        const lon = feature.geometry?.coordinates?.[0] ?? cityLocation.lng;
        return getBestPhoto(place.place_id || '', place.name || '', city, lat, lon, apiKey);
      });
      const photos = await Promise.all(photoPromises);

      const nearbyPlaces: PlaceResult[] = rawNearby.map((feature: any, index: number) => {
        const place = feature.properties;
        const placeLat = feature.geometry?.coordinates?.[1] ?? cityLocation.lat;
        const placeLng = feature.geometry?.coordinates?.[0] ?? cityLocation.lng;
        const distKm = haversineDistance(cityLocation.lat, cityLocation.lng, placeLat, placeLng);
        const distStr = distKm < 1
          ? `${Math.round(distKm * 1000)} m away`
          : `${distKm.toFixed(1)} km away`;

        const image =
          photos[index] ||
          PLACEHOLDER_IMAGES.nearby[index % PLACEHOLDER_IMAGES.nearby.length];

        return {
          id: `nearby-${place.place_id || index}`,
          name: place.name || `Tourist spot near ${city}`,
          description: place.formatted || place.address_line1 || `A notable tourist attraction near ${city}`,
          type: 'nearby' as const,
          image,
          rating: place.datasource?.raw?.rating || (3.5 + Math.random() * 1.5),
          address: place.formatted || place.address_line1,
          distance: distStr,
        };
      });

      const validNearby = nearbyPlaces.filter(p => p.name && !p.name.startsWith('Tourist spot near'));
      const finalNearby = validNearby.length >= 3 ? validNearby : nearbyPlaces;

      return new Response(
        JSON.stringify({ places: finalNearby, source: 'geoapify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── ATTRACTIONS / FOOD / SHOPPING (10 km radius) ────────────────────────────
    let categories = 'tourism.sights,tourism.attraction';
    let ourType: 'attraction' | 'food' | 'shopping' = 'attraction';

    if (type === 'food') {
      categories = 'catering.restaurant,catering.cafe';
      ourType = 'food';
    } else if (type === 'shopping') {
      categories = 'commercial.shopping_mall,commercial.marketplace';
      ourType = 'shopping';
    }

    const placesUrl = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${cityLocation.lng},${cityLocation.lat},10000&limit=10&apiKey=${apiKey}`;
    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();
    console.log(`Places search found ${placesData.features?.length || 0} places`);

    if (!placesData.features || placesData.features.length === 0) {
      console.error('No places found from Geoapify');
      return new Response(
        JSON.stringify({ places: [], message: 'No places found for this location', source: 'no_results' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawPlaces = placesData.features.slice(0, 6);

    // Fetch best photos in parallel for all places
    const photoPromises = rawPlaces.map((feature: any) => {
      const place = feature.properties;
      const lat = feature.geometry?.coordinates?.[1] ?? cityLocation.lat;
      const lon = feature.geometry?.coordinates?.[0] ?? cityLocation.lng;
      return getBestPhoto(place.place_id || '', place.name || '', city, lat, lon, apiKey);
    });
    const photos = await Promise.all(photoPromises);

    // Transform results
    const places: PlaceResult[] = rawPlaces.map((feature: any, index: number) => {
      const place = feature.properties;

      let category: string | undefined;
      if (ourType === 'food') {
        const cats = place.categories || [];
        if (cats.some((c: string) => c.includes('cafe'))) category = 'Café';
        else if (cats.some((c: string) => c.includes('bar'))) category = 'Bar';
        else if (cats.some((c: string) => c.includes('bakery'))) category = 'Bakery';
        else category = 'Restaurant';
      }

      const image =
        photos[index] ||
        PLACEHOLDER_IMAGES[ourType][index % PLACEHOLDER_IMAGES[ourType].length];

      return {
        id: `${ourType}-${place.place_id || index}`,
        name: place.name || `${ourType.charAt(0).toUpperCase() + ourType.slice(1)} in ${city}`,
        description: place.formatted || place.address_line1 || `Popular ${ourType} in ${city}`,
        type: ourType,
        category,
        image,
        rating: place.datasource?.raw?.rating || (3.5 + Math.random() * 1.5),
        address: place.formatted || place.address_line1,
      };
    });

    const validPlaces = places.filter(p => p.name && !p.name.includes(' in '));
    const finalPlaces = validPlaces.length > 0 ? validPlaces : places;

    return new Response(
      JSON.stringify({ places: finalPlaces, source: 'geoapify' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-places function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, places: [], message: 'No places found for this location' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
