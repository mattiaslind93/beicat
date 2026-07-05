import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

/**
 * Begär platsbehörighet och ger en engångsposition.
 * `denied` = användaren nekade → UI faller tillbaka till Örebro resecentrum.
 */
export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!mounted) return;
      if (status !== 'granted') {
        setDenied(true);
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (mounted) {
          setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        }
      } catch {
        if (mounted) setDenied(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { location, denied };
}
