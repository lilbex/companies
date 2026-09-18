'use client';

// Google Places autocomplete for entering a real-world address and getting
// back the lat/lng CityWheels actually needs (used for a merchant's
// restaurant address today -- see app/dashboard/profile -- but written
// generically so any other address field in this portal can reuse it).
// Ported from lilbex-admin/components/AddressInput.tsx, which replaced this
// portal's old click-a-pin-on-the-map location picker (components/
// LocationPicker.tsx) for the same reason: merchants found tapping a map to
// place a pin fiddly and imprecise compared to just typing their address.
//
// "What if the address isn't in the suggestion list?" -- handleBlur()
// below covers that: if the merchant types an address and clicks/tabs away
// without ever picking a suggestion, it forward-geocodes whatever they
// typed directly (Google's Geocoder, not just the autocomplete predictions)
// and uses that result. So a real address that Places doesn't suggest (a
// new building, an address typed slightly differently than Google's
// canonical form, etc.) still resolves to coordinates instead of silently
// blocking the merchant from saving. It only comes up empty if the typed
// text doesn't geocode to anywhere at all, in which case nothing is set and
// the field's required-field validation catches it same as leaving it blank.

import { useEffect, useRef, useState, useId } from 'react';
import { loadGoogleMaps } from '@/lib/googleMaps';

export type AddressValue = { addressLine1: string; latitude: number; longitude: number };

type Prediction = { placeId: string; description: string };

export default function AddressInput({
  label,
  icon,
  placeholder,
  value,
  onChange,
  error,
}: {
  label?: string;
  icon?: string;
  placeholder?: string;
  value: AddressValue | null;
  onChange: (value: AddressValue | null) => void;
  /** External validation error (e.g. from formik) shown below the field. */
  error?: string;
}) {
  const inputId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [mapsError, setMapsError] = useState('');
  const [predictionsError, setPredictionsError] = useState('');
  const [text, setText] = useState(value?.addressLine1 || '');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [resolving, setResolving] = useState(false);
  const autocompleteServiceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const sessionTokenRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;

  useEffect(() => {
    if (!apiKey) {
      setMapsError("Address search isn't configured -- NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY is missing.");
      return;
    }
    loadGoogleMaps(apiKey)
      .then(() => {
        const google = (window as any).google;
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        geocoderRef.current = new google.maps.Geocoder();
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
        setGoogleReady(true);
      })
      .catch(() => setMapsError('Could not load Google Maps -- check the API key and try again.'));

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [apiKey]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowPredictions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Some Google Cloud projects only have "Places API (New)" enabled rather
  // than the classic "Places API" that AutocompleteService needs -- that
  // combination fails silently (a non-OK status, no thrown error). Try the
  // classic service first and fall back to the current Places API.
  const fetchPredictionsCurrentPlacesApi = async (query: string) => {
    try {
      const google = (window as any).google;
      const { AutocompleteSuggestion } = await google.maps.importLibrary('places');
      const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query,
        includedRegionCodes: ['ng'],
        sessionToken: sessionTokenRef.current,
      });
      const next = (suggestions || [])
        .filter((s: any) => s.placePrediction)
        .map((s: any) => ({ placeId: s.placePrediction.placeId, description: s.placePrediction.text.toString() }));
      setPredictions(next);
      setShowPredictions(next.length > 0);
      setPredictionsError(next.length === 0 ? 'No address search results. Check that Places API is enabled for this key.' : '');
    } catch {
      setPredictions([]);
      setPredictionsError('Address search failed. Check that Places API is enabled for this key.');
    }
  };

  const fetchPredictions = (query: string) => {
    if (!googleReady || query.trim().length < 3) {
      setPredictions([]);
      return;
    }
    setPredictionsError('');
    autocompleteServiceRef.current.getPlacePredictions(
      { input: query, componentRestrictions: { country: 'ng' }, sessionToken: sessionTokenRef.current },
      (results: any[] | null, status: string) => {
        if (status === 'OK' && results?.length) {
          setPredictions(results.map((r) => ({ placeId: r.place_id, description: r.description })));
          setShowPredictions(true);
          return;
        }
        if (status === 'ZERO_RESULTS') {
          setPredictions([]);
          return;
        }
        fetchPredictionsCurrentPlacesApi(query);
      },
    );
  };

  const handleTextChange = (next: string) => {
    setText(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(next), 250);
  };

  const startNewSession = () => {
    sessionTokenRef.current = new (window as any).google.maps.places.AutocompleteSessionToken();
  };

  const resolveByPlaceId = (placeId: string, description: string) => {
    if (!geocoderRef.current) return;
    setResolving(true);
    geocoderRef.current.geocode({ placeId }, (results: any[] | null, status: string) => {
      setResolving(false);
      if (status !== 'OK' || !results?.[0]?.geometry?.location) return;
      const loc = results[0].geometry.location;
      const addressLine1 = results[0].formatted_address || description;
      setText(addressLine1);
      onChange({ addressLine1, latitude: loc.lat(), longitude: loc.lng() });
      startNewSession();
    });
  };

  const selectPrediction = (p: Prediction) => {
    setPredictions([]);
    setShowPredictions(false);
    resolveByPlaceId(p.placeId, p.description);
  };

  // Covers "the address they typed isn't in the suggestion list": if they
  // leave the field without ever picking a prediction, forward-geocode
  // whatever text is there instead of leaving the field unresolved.
  const handleBlur = () => {
    setTimeout(() => {
      setShowPredictions(false);
      const alreadyResolved = value?.addressLine1 === text && !!value?.latitude;
      if (alreadyResolved || text.trim().length < 5 || !geocoderRef.current) return;
      setResolving(true);
      geocoderRef.current.geocode(
        { address: text, componentRestrictions: { country: 'NG' } },
        (results: any[] | null, status: string) => {
          setResolving(false);
          if (status !== 'OK' || !results?.[0]?.geometry?.location) return;
          const loc = results[0].geometry.location;
          const addressLine1 = results[0].formatted_address || text;
          setText(addressLine1);
          onChange({ addressLine1, latitude: loc.lat(), longitude: loc.lng() });
        },
      );
    }, 150);
  };

  // Once a value is picked, show the compact "chip" view instead of the
  // search input.
  if (value) {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {icon} {label}
          </label>
        )}
        <div className="mt-1 flex items-start justify-between bg-gray-50 rounded-md p-3 border border-gray-200">
          <span className="text-sm text-gray-800">{value.addressLine1}</span>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setText('');
            }}
            className="text-xs text-gray-400 hover:text-gray-600 shrink-0 ml-2"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {icon} {label}
        </label>
      )}
      <input
        id={inputId}
        type="text"
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        onFocus={() => predictions.length > 0 && setShowPredictions(true)}
        onBlur={handleBlur}
        placeholder={placeholder || "Start typing your restaurant's address..."}
        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
        autoComplete="off"
      />

      {showPredictions && predictions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-auto divide-y divide-gray-100 border border-gray-100 rounded-md bg-white shadow-lg">
          {predictions.map((p) => (
            <li key={p.placeId}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectPrediction(p)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
              >
                {p.description}
              </button>
            </li>
          ))}
        </ul>
      )}

      {resolving && <p className="mt-1 text-xs text-gray-400">Locating…</p>}
      {(mapsError || predictionsError) && <p className="mt-1 text-xs text-amber-600">{mapsError || predictionsError}</p>}
      {error && !mapsError && !predictionsError && <div className="text-red-600 text-sm mt-1">{error}</div>}
    </div>
  );
}
