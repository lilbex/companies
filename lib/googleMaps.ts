// Lazily injects the Google Maps JS SDK (Places library) once per page load.
// Returns a resolved promise immediately if it's already loaded, and the
// same in-flight promise to every caller if a load is already underway --
// so multiple <AddressInput> instances on one page don't inject the script
// twice.
//
// This deliberately uses the classic `callback=` query param rather than
// listening for the <script> tag's `load` event. With Google's newer
// `loading=async` style, `load` fires as soon as the small outer bootstrap
// wrapper downloads -- the actual `places` library code is fetched
// separately, afterwards, so `google.maps.places` often doesn't exist yet
// at that point. `callback` is Google's own signal that everything
// requested via `libraries=` has *actually* finished loading, so there's no
// race to get wrong.
//
// Ported from lilbex-admin/lib/googleMaps.ts (see that file's history for
// why this replaced the naive onload-based loader).
let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).google?.maps?.places) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-sdk');
    if (existing) {
      // Another AddressInput instance already kicked off the load -- poll
      // for readiness instead of injecting a second script tag (which
      // Google Maps doesn't support and will warn about).
      const check = setInterval(() => {
        if ((window as any).google?.maps?.places) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      existing.addEventListener('error', () => {
        clearInterval(check);
        reject(new Error('Failed to load Google Maps'));
      });
      return;
    }

    const callbackName = '__cwGoogleMapsLoaded__';
    (window as any)[callbackName] = () => {
      delete (window as any)[callbackName];
      resolve();
    };

    const script = document.createElement('script');
    script.id = 'google-maps-sdk';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return loadPromise;
}
