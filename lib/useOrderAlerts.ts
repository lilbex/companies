'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

// Public by design — a VAPID public key is meant to ship in client JS (it's
// how the browser's push service verifies notifications came from our
// server; the matching private key never leaves the backend). Generated
// once for this project — see VAPID_PUBLIC_KEY in city-wheel-backend/.env.
const VAPID_PUBLIC_KEY = 'BLzKVDdzK9hZMuL1rtd_03jxYAglD5mTQYcHEmJESeqKr9f4A2ZQIS9DSQRpmUnsd1sN5zM5BiYPleNCkq_vLP8';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type PermissionState = 'unsupported' | 'default' | 'granted' | 'denied';

/**
 * Browser Web Push for new-order alerts (companies portal — merchants).
 * Mirrors how the mobile apps register an Expo push token, just for a
 * browser subscription instead — see lib/api.ts subscribeWebPush() and
 * UsersService.saveWebPushSubscription() on the backend.
 */
export function useOrderAlerts() {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supported =
    typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  const refreshStatus = useCallback(async () => {
    if (!supported) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as PermissionState);
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      const existing = await registration?.pushManager.getSubscription();
      setIsSubscribed(Boolean(existing));
    } catch {
      setIsSubscribed(false);
    }
  }, [supported]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const enable = useCallback(async () => {
    if (!supported) {
      setError('This browser does not support push notifications.');
      return;
    }
    setIsBusy(true);
    setError(null);
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult as PermissionState);
      if (permissionResult !== 'granted') {
        setError('Notifications were not allowed. You can still enable them from the browser’s site settings.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource,
        });
      }

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error('Browser returned an incomplete push subscription');
      }
      await api.subscribeWebPush({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
      setIsSubscribed(true);
    } catch (err: any) {
      setError(err?.message || 'Could not enable order alerts.');
    } finally {
      setIsBusy(false);
    }
  }, [supported]);

  const disable = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await api.unsubscribeWebPush(endpoint).catch(() => null);
      }
      setIsSubscribed(false);
    } catch (err: any) {
      setError(err?.message || 'Could not disable order alerts.');
    } finally {
      setIsBusy(false);
    }
  }, []);

  return { supported, permission, isSubscribed, isBusy, error, enable, disable };
}
