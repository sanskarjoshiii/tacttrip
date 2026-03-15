import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WeatherInfo, Attraction, NearbyPlace, Activity, Monument } from '@/types/travel';
import { getCuratedActivities, getCuratedMonuments } from '@/data/destinationData';
import { toast } from 'sonner';

interface RealTimeData {
  weather: WeatherInfo | null;
  attractions: Attraction[];
  food: Attraction[];
  shopping: Attraction[];
  nearbyPlaces: NearbyPlace[];
  activities: Activity[];
  monuments: Monument[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const fallbackWeather: WeatherInfo = {
  condition: 'Pleasant',
  temperature: 26,
  icon: '🌤️',
  advice: 'Ideal weather conditions for all activities. Enjoy your trip!',
};

export const useRealTimeData = (destination: string): RealTimeData => {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [food, setFood] = useState<Attraction[]>([]);
  const [shopping, setShopping] = useState<Attraction[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!destination) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [weatherResult, attractionsResult, foodResult, shoppingResult, nearbyResult] = await Promise.allSettled([
        supabase.functions.invoke('get-weather', {
          body: { city: destination }
        }),
        supabase.functions.invoke('get-places', {
          body: { city: destination, type: 'attraction' }
        }),
        supabase.functions.invoke('get-places', {
          body: { city: destination, type: 'food' }
        }),
        supabase.functions.invoke('get-places', {
          body: { city: destination, type: 'shopping' }
        }),
        supabase.functions.invoke('get-places', {
          body: { city: destination, type: 'nearby' }
        }),
      ]);

      // Process weather
      if (weatherResult.status === 'fulfilled' && weatherResult.value.data && !weatherResult.value.error) {
        setWeather(weatherResult.value.data);
      } else {
        console.error('Weather fetch failed:', weatherResult);
        setWeather(fallbackWeather);
        toast.error('Could not fetch live weather data');
      }

      // Process attractions
      if (attractionsResult.status === 'fulfilled' && attractionsResult.value.data?.places) {
        setAttractions(attractionsResult.value.data.places);
      } else {
        console.error('Attractions fetch failed:', attractionsResult);
      }

      // Process food
      if (foodResult.status === 'fulfilled' && foodResult.value.data?.places) {
        setFood(foodResult.value.data.places);
      } else {
        console.error('Food fetch failed:', foodResult);
      }

      // Process shopping
      if (shoppingResult.status === 'fulfilled' && shoppingResult.value.data?.places) {
        setShopping(shoppingResult.value.data.places);
      } else {
        console.error('Shopping fetch failed:', shoppingResult);
      }

      // Process nearby places
      if (nearbyResult.status === 'fulfilled' && nearbyResult.value.data?.places) {
        setNearbyPlaces(nearbyResult.value.data.places);
      } else {
        console.error('Nearby places fetch failed:', nearbyResult);
      }

      // Curated activities and monuments for the destination
      setActivities(getCuratedActivities(destination));
      setMonuments(getCuratedMonuments(destination));

    } catch (err) {
      console.error('Error fetching real-time data:', err);
      setError('Failed to fetch real-time data');
      setWeather(fallbackWeather);
    } finally {
      setIsLoading(false);
    }
  }, [destination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up auto-refresh every 5 minutes for weather
  useEffect(() => {
    if (!destination) return;

    const intervalId = setInterval(() => {
      supabase.functions.invoke('get-weather', {
        body: { city: destination }
      }).then(({ data, error }) => {
        if (data && !error) {
          setWeather(data);
          console.log('Weather data refreshed');
        }
      });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [destination]);

  return {
    weather,
    attractions,
    food,
    shopping,
    nearbyPlaces,
    activities,
    monuments,
    isLoading,
    error,
    refetch: fetchData,
  };
};
