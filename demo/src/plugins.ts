// The plugin gallery data model. We import the REAL, unmodified @capacitor/*
// packages. Because lynx.config.ts aliases `@capacitor/core` to
// @lynx-capacitor/core, every one of these routes through the Lynx bridge.
//
// This gallery covers all 37 APIs currently published at
// https://capacitorjs.com/docs/apis. Plugins that ship inside
// @capacitor/core (Http, Cookies) or that need heavy external SDKs
// (Google Maps, Background Runner, Local LLM, Barcode Scanner, InAppBrowser,
// File Transfer, File Viewer, Privacy Screen) are wired via registerPlugin so
// we exercise the adapter across every plugin — including its error path.
import {
  CapacitorHttp,
  CapacitorCookies,
  SystemBars,
  SystemBarsStyle,
} from '@capacitor/core';

import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet';
import { App as CapApp } from '@capacitor/app';
import { AppLauncher } from '@capacitor/app-launcher';
import { BackgroundRunner } from '@capacitor/background-runner';
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { Browser } from '@capacitor/browser';
import { Calendar } from '@capacitor/calendar';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Clipboard } from '@capacitor/clipboard';
import { Contacts } from '@capacitor/contacts';
import { Device } from '@capacitor/device';
import { Dialog } from '@capacitor/dialog';
import { FileTransfer } from '@capacitor/file-transfer';
import { FileViewer } from '@capacitor/file-viewer';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import {
  DefaultWebViewOptions,
  InAppBrowser,
} from '@capacitor/inappbrowser';
import { Keyboard } from '@capacitor/keyboard';
import { LocalLLM } from '@capacitor/local-llm';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Motion } from '@capacitor/motion';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { PrivacyScreen } from '@capacitor/privacy-screen';
import { PushNotifications } from '@capacitor/push-notifications';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { ScreenReader } from '@capacitor/screen-reader';
import { Share } from '@capacitor/share';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { TextZoom } from '@capacitor/text-zoom';
import { Toast } from '@capacitor/toast';
import { CapacitorGoogleMaps as GoogleMaps } from '@capacitor/google-maps/dist/esm/implementation.js';

import { KeepAwake } from '@capacitor-community/keep-awake';
import { SafeArea, SystemBarsStyle as SafeAreaStyle, SystemBarsType as SafeAreaBarType } from '@capacitor-community/safe-area';
import { CapacitorSQLite } from '@capacitor-community/sqlite';

export type PluginCategory =
  | 'Device & App'
  | 'UI & Feedback'
  | 'Media & Files'
  | 'Networking'
  | 'System & Sensors'
  | 'Notifications'
  | 'Community'
  | 'Requires SDK';

export type SupportStatus = 'full' | 'interactive' | 'partial' | 'unsupported';

export interface PluginAction {
  label: string;
  run: () => Promise<unknown>;
  /** Safe to auto-run on mount (read-only, non-modal). */
  smoke?: boolean;
}

export interface PluginEntry {
  name: string;
  pkg: string;
  category: PluginCategory;
  description: string;
  supportStatus: SupportStatus;
  actions: PluginAction[];
}

export const PLUGINS: PluginEntry[] = [
  // ---------------------------------------------------------------- Device & App
  {
    name: 'Device',
    pkg: '@capacitor/device',
    category: 'Device & App',
    description: 'Device model, OS, battery, language.',
    supportStatus: 'full',
    actions: [
      { label: 'getInfo', run: () => Device.getInfo(), smoke: true },
      { label: 'getId', run: () => Device.getId() },
      { label: 'getBatteryInfo', run: () => Device.getBatteryInfo() },
      { label: 'getLanguageCode', run: () => Device.getLanguageCode() },
      { label: 'getLanguageTag', run: () => Device.getLanguageTag() },
    ],
  },
  {
    name: 'App',
    pkg: '@capacitor/app',
    category: 'Device & App',
    description: 'App metadata and lifecycle state.',
    supportStatus: 'full',
    actions: [
      { label: 'getInfo', run: () => CapApp.getInfo(), smoke: true },
      { label: 'getState', run: () => CapApp.getState() },
      { label: 'getLaunchUrl', run: () => CapApp.getLaunchUrl() as Promise<unknown> },
    ],
  },
  {
    name: 'App Launcher',
    pkg: '@capacitor/app-launcher',
    category: 'Device & App',
    description: 'Open other apps by URL scheme.',
    supportStatus: 'full',
    actions: [
      { label: 'canOpenUrl (mailto)', run: () => AppLauncher.canOpenUrl({ url: 'mailto:hi@example.com' }), smoke: true },
      { label: 'openUrl (https)', run: () => AppLauncher.openUrl({ url: 'https://lynxjs.org' }) },
    ],
  },
  {
    name: 'Contacts',
    pkg: '@capacitor/contacts',
    category: 'Device & App',
    description: 'Create, search, and remove device contacts.',
    supportStatus: 'full',
    actions: [
      {
        label: 'create + find + delete',
        run: async () => {
          const token = String(Date.now());
          const saved = await Contacts.save({
            contact: {
              name: {
                givenName: 'Lynx Capacitor',
                familyName: token,
              },
            },
          });
          if (!saved.id) {
            throw new Error('Contacts.save did not return an id');
          }

          try {
            const result = await Contacts.find({
              fields: ['id'],
              filter: saved.id,
              multiple: true,
              desiredFields: ['id', 'displayName', 'name'],
            });
            const match = result.contacts.find(contact => contact.id === saved.id);
            if (!match) {
              throw new Error(`Contacts.find did not return saved contact ${saved.id}`);
            }
            return {
              id: saved.id,
              displayName: match.displayName,
              verified: 'save/find/remove',
            };
          } finally {
            await Contacts.remove({ id: saved.id });
          }
        },
        smoke: true,
      },
      {
        label: 'find all',
        run: () => Contacts.find({ fields: ['displayName'], multiple: true }),
      },
    ],
  },
  {
    name: 'Preferences',
    pkg: '@capacitor/preferences',
    category: 'Device & App',
    description: 'Simple key/value persistence.',
    supportStatus: 'full',
    actions: [
      { label: 'set', run: () => Preferences.set({ key: 'demo', value: `set @ ${Date.now()}` }) },
      { label: 'get', run: () => Preferences.get({ key: 'demo' }) },
      {
        label: 'keys',
        run: async () => {
          await Preferences.set({ key: 'demo', value: `set @ ${Date.now()}` });
          return Preferences.keys();
        },
        smoke: true,
      },
      { label: 'remove', run: () => Preferences.remove({ key: 'demo' }) },
    ],
  },

  // ---------------------------------------------------------------- UI & Feedback
  {
    name: 'Dialog',
    pkg: '@capacitor/dialog',
    category: 'UI & Feedback',
    description: 'Native alert / confirm / prompt.',
    supportStatus: 'interactive',
    actions: [
      { label: 'alert', run: () => Dialog.alert({ title: 'Lynx + Capacitor', message: 'Native alert via the bridge!' }) },
      { label: 'confirm', run: () => Dialog.confirm({ title: 'Confirm', message: 'Does the bridge work?' }) },
      { label: 'prompt', run: () => Dialog.prompt({ title: 'Prompt', message: 'Type something:' }) },
    ],
  },
  {
    name: 'Action Sheet',
    pkg: '@capacitor/action-sheet',
    category: 'UI & Feedback',
    description: 'Native bottom action sheet.',
    supportStatus: 'interactive',
    actions: [
      {
        label: 'showActions',
        run: () =>
          ActionSheet.showActions({
            title: 'Choose an option',
            options: [
              { title: 'Favorite' },
              { title: 'Share' },
              { title: 'Delete', style: ActionSheetButtonStyle.Destructive },
            ],
          }),
      },
    ],
  },
  {
    name: 'Toast',
    pkg: '@capacitor/toast',
    category: 'UI & Feedback',
    description: 'Transient status messages.',
    supportStatus: 'full',
    actions: [
      { label: 'show (short)', run: () => Toast.show({ text: 'Hello from Capacitor on Lynx 🎉' }), smoke: true },
      { label: 'show (long)', run: () => Toast.show({ text: 'A longer toast message', duration: 'long' }) },
    ],
  },
  {
    name: 'Haptics',
    pkg: '@capacitor/haptics',
    category: 'UI & Feedback',
    description: 'Vibration and tactile feedback.',
    supportStatus: 'full',
    actions: [
      { label: 'impact (heavy)', run: () => Haptics.impact({ style: ImpactStyle.Heavy }) },
      {
        label: 'impact (light)',
        run: async () => {
          await Haptics.impact({ style: ImpactStyle.Light });
          return { fired: 'impact', style: 'LIGHT' };
        },
        smoke: true,
      },
      { label: 'notification', run: () => Haptics.notification({ type: NotificationType.Success }) },
      { label: 'vibrate', run: () => Haptics.vibrate() },
    ],
  },
  {
    name: 'Share',
    pkg: '@capacitor/share',
    category: 'UI & Feedback',
    description: 'Native share sheet.',
    supportStatus: 'interactive',
    actions: [
      { label: 'canShare', run: () => Share.canShare(), smoke: true },
      {
        label: 'share',
        run: () =>
          Share.share({ title: 'Lynx + Capacitor', text: 'Capacitor plugins on Lynx!', url: 'https://lynxjs.org' }),
      },
    ],
  },

  // ---------------------------------------------------------------- Media & Files
  {
    name: 'Clipboard',
    pkg: '@capacitor/clipboard',
    category: 'Media & Files',
    description: 'Read and write the system clipboard.',
    supportStatus: 'full',
    actions: [
      { label: 'write', run: () => Clipboard.write({ string: `Lynx + Capacitor @ ${new Date().toISOString()}` }) },
      {
        label: 'write + read',
        run: async () => {
          await Clipboard.write({ string: 'Lynx + Capacitor' });
          return Clipboard.read();
        },
        smoke: true,
      },
    ],
  },
  {
    name: 'Filesystem',
    pkg: '@capacitor/filesystem',
    category: 'Media & Files',
    description: 'Read/write files in the app sandbox.',
    supportStatus: 'full',
    actions: [
      {
        label: 'write + read',
        run: async () => {
          await Filesystem.writeFile({
            path: 'lynx-cap-demo.txt',
            data: `written @ ${new Date().toISOString()}`,
            directory: Directory.Cache,
            encoding: Encoding.UTF8,
          });
          return Filesystem.readFile({
            path: 'lynx-cap-demo.txt',
            directory: Directory.Cache,
            encoding: Encoding.UTF8,
          });
        },
        smoke: true,
      },
      { label: 'readdir DOCUMENTS', run: () => Filesystem.readdir({ path: '', directory: Directory.Documents }) },
      {
        label: 'stat',
        run: () => Filesystem.stat({ path: 'lynx-cap-demo.txt', directory: Directory.Documents }),
      },
      { label: 'mkdir', run: () => Filesystem.mkdir({ path: 'demo-dir', directory: Directory.Documents, recursive: true }) },
    ],
  },
  {
    name: 'Camera',
    pkg: '@capacitor/camera',
    category: 'Media & Files',
    description: 'Take or pick photos (library on Sim).',
    supportStatus: 'interactive',
    actions: [
      { label: 'checkPermissions', run: () => Camera.checkPermissions(), smoke: true },
      { label: 'requestPermissions', run: () => Camera.requestPermissions() },
      {
        label: 'getPhoto (camera)',
        run: () => Camera.getPhoto({ resultType: CameraResultType.Base64, source: CameraSource.Camera, quality: 80 }),
      },
      { label: 'pickImages', run: () => Camera.pickImages({ quality: 80 }) },
    ],
  },
  {
    name: 'File Transfer',
    pkg: '@capacitor/file-transfer',
    category: 'Media & Files',
    description: 'Download/upload files over HTTP.',
    supportStatus: 'full',
    actions: [
      {
        label: 'downloadFile',
        run: async () => {
          const { uri } = await Filesystem.getUri({
            path: 'download.md',
            directory: Directory.Cache,
          });
          return FileTransfer.downloadFile({
            url: 'https://example.com',
            path: uri,
          });
        },
        smoke: true,
      },
    ],
  },
  {
    name: 'File Viewer',
    pkg: '@capacitor/file-viewer',
    category: 'Media & Files',
    description: 'Preview documents with the platform viewer.',
    supportStatus: 'interactive',
    actions: [
      {
        label: 'previewFromLocalPath',
        run: async () => {
          await Filesystem.writeFile({
            path: 'preview.txt',
            data: 'Previewed via QuickLook through the Capacitor→Lynx bridge.',
            directory: Directory.Cache,
            encoding: Encoding.UTF8,
          });
          const { uri } = await Filesystem.getUri({ path: 'preview.txt', directory: Directory.Cache });
          return FileViewer.openDocumentFromLocalPath({ path: uri });
        },
      },
    ],
  },

  // ---------------------------------------------------------------- Networking
  {
    name: 'Network',
    pkg: '@capacitor/network',
    category: 'Networking',
    description: 'Connectivity status and changes.',
    supportStatus: 'full',
    actions: [{ label: 'getStatus', run: () => Network.getStatus(), smoke: true }],
  },
  {
    name: 'HTTP',
    pkg: '@capacitor/core (CapacitorHttp)',
    category: 'Networking',
    description: 'Native HTTP client (bypasses CORS).',
    supportStatus: 'full',
    actions: [
      {
        label: 'GET json',
        run: () => (CapacitorHttp as any).get({ url: 'https://example.com', params: { from: 'lynx' } }),
        smoke: true,
      },
      {
        label: 'POST json',
        run: () =>
          (CapacitorHttp as any).post({
            url: 'https://httpbin.org/post',
            headers: { 'Content-Type': 'application/json' },
            data: { hello: 'capacitor-on-lynx' },
          }),
      },
    ],
  },
  {
    name: 'Cookies',
    pkg: '@capacitor/core (CapacitorCookies)',
    category: 'Networking',
    description: 'Native cookie jar access.',
    supportStatus: 'full',
    actions: [
      {
        label: 'set + get',
        run: async () => {
          await (CapacitorCookies as any).setCookie({ url: 'https://lynxjs.org', key: 'demo', value: 'bridge' });
          return (CapacitorCookies as any).getCookies({ url: 'https://lynxjs.org' });
        },
        smoke: true,
      },
      { label: 'clearAllCookies', run: () => (CapacitorCookies as any).clearAllCookies() },
    ],
  },
  {
    name: 'Browser',
    pkg: '@capacitor/browser',
    category: 'Networking',
    description: 'In-app browser (Custom Tabs / SFSafariViewController).',
    supportStatus: 'interactive',
    actions: [
      { label: 'open', run: () => Browser.open({ url: 'https://lynxjs.org' }) },
      { label: 'close', run: () => Browser.close() },
    ],
  },
  {
    name: 'InAppBrowser',
    pkg: '@capacitor/inappbrowser',
    category: 'Networking',
    description: 'Advanced in-app / system browser.',
    supportStatus: 'interactive',
    actions: [
      {
        label: 'openInWebView',
        run: () =>
          InAppBrowser.openInWebView({
            url: 'https://capacitorjs.com',
            options: DefaultWebViewOptions,
          }),
      },
      { label: 'close', run: () => InAppBrowser.close() },
    ],
  },

  // ---------------------------------------------------------------- System & Sensors
  {
    name: 'Geolocation',
    pkg: '@capacitor/geolocation',
    category: 'System & Sensors',
    description: 'GPS position and permissions.',
    supportStatus: 'full',
    actions: [
      { label: 'checkPermissions', run: () => Geolocation.checkPermissions(), smoke: true },
      { label: 'requestPermissions', run: () => Geolocation.requestPermissions() },
      { label: 'getCurrentPosition', run: () => Geolocation.getCurrentPosition({ enableHighAccuracy: true }) },
    ],
  },
  {
    name: 'Motion',
    pkg: '@capacitor/motion',
    category: 'System & Sensors',
    description: 'Accelerometer & orientation events.',
    supportStatus: 'interactive',
    actions: [
      {
        label: 'listen accel (3s)',
        run: () =>
          new Promise(resolve => {
            let count = 0;
            const handle = Motion.addListener('accel', () => {
              count += 1;
            });
            setTimeout(async () => {
              (await handle).remove();
            resolve({ note: 'Sensor event count during the 3 second sample', eventsReceived: count });
            }, 3000);
          }),
      },
    ],
  },
  {
    name: 'Status Bar',
    pkg: '@capacitor/status-bar',
    category: 'System & Sensors',
    description: 'Status bar style & visibility.',
    supportStatus: 'full',
    actions: [
      { label: 'getInfo', run: () => StatusBar.getInfo(), smoke: true },
      { label: 'setStyle (Dark)', run: () => StatusBar.setStyle({ style: Style.Dark }) },
      { label: 'hide', run: () => StatusBar.hide() },
      { label: 'show', run: () => StatusBar.show() },
    ],
  },
  {
    name: 'System Bars',
    pkg: '@capacitor/system-bars',
    category: 'System & Sensors',
    description: 'Unified system bar styling.',
    supportStatus: 'full',
    actions: [
      {
        label: 'setStyle (Default)',
        run: () => (SystemBars as any).setStyle({ style: SystemBarsStyle.Default }),
        smoke: true,
      },
      {
        label: 'setStyle (Dark)',
        run: () => (SystemBars as any).setStyle({ style: SystemBarsStyle.Dark }),
      },
    ],
  },
  {
    name: 'Screen Orientation',
    pkg: '@capacitor/screen-orientation',
    category: 'System & Sensors',
    description: 'Read/lock device orientation.',
    supportStatus: 'full',
    actions: [
      { label: 'orientation', run: () => ScreenOrientation.orientation(), smoke: true },
      { label: 'lock (portrait)', run: () => ScreenOrientation.lock({ orientation: 'portrait' }) },
      { label: 'unlock', run: () => ScreenOrientation.unlock() },
    ],
  },
  {
    name: 'Screen Reader',
    pkg: '@capacitor/screen-reader',
    category: 'System & Sensors',
    description: 'VoiceOver state & speech.',
    supportStatus: 'full',
    actions: [
      { label: 'isEnabled', run: () => ScreenReader.isEnabled(), smoke: true },
      { label: 'speak', run: () => ScreenReader.speak({ value: 'Capacitor running on Lynx' }) },
    ],
  },
  {
    name: 'Text Zoom',
    pkg: '@capacitor/text-zoom',
    category: 'System & Sensors',
    description: 'Content text scaling.',
    supportStatus: 'full',
    actions: [
      { label: 'getPreferred', run: () => TextZoom.getPreferred(), smoke: true },
      { label: 'get', run: () => TextZoom.get() },
      { label: 'set (1.5x)', run: () => TextZoom.set({ value: 1.5 }) },
    ],
  },
  {
    name: 'Keyboard',
    pkg: '@capacitor/keyboard',
    category: 'System & Sensors',
    description: 'Software keyboard control & events.',
    supportStatus: 'partial',
    actions: [
      { label: 'getResizeMode', run: () => Keyboard.getResizeMode() },
      { label: 'setStyle (DARK)', run: () => Keyboard.setStyle({ style: 'DARK' as any }) },
      { label: 'hide', run: () => Keyboard.hide() },
    ],
  },
  {
    name: 'Splash Screen',
    pkg: '@capacitor/splash-screen',
    category: 'System & Sensors',
    description: 'Show/hide the launch splash.',
    supportStatus: 'full',
    actions: [
      { label: 'hide', run: () => SplashScreen.hide(), smoke: true },
      { label: 'show', run: () => SplashScreen.show() },
    ],
  },
  {
    name: 'Privacy Screen',
    pkg: '@capacitor/privacy-screen',
    category: 'System & Sensors',
    description: 'Obscure app in the app switcher.',
    supportStatus: 'full',
    actions: [
      { label: 'isEnabled', run: () => PrivacyScreen.isEnabled(), smoke: true },
      { label: 'enable', run: () => PrivacyScreen.enable() },
      { label: 'disable', run: () => PrivacyScreen.disable() },
    ],
  },

  // ---------------------------------------------------------------- Notifications
  {
    name: 'Calendar',
    pkg: '@capacitor/calendar',
    category: 'Notifications',
    description: 'Create, search, and remove calendar events.',
    supportStatus: 'full',
    actions: [
      {
        label: 'create + find + delete',
        run: async () => {
          const token = String(Date.now());
          const calendarName = `Lynx Capacitor ${token}`;
          const title = `Lynx Capacitor verification ${token}`;
          const startDate = Date.now() + 60_000;
          const endDate = startDate + 30 * 60_000;
          let eventId: string | undefined;
          let calendarCreated = false;
          let verification: { id: string; title: string; verified: string } | undefined;

          try {
            const calendar = await Calendar.createCalendar({
              name: calendarName,
              color: '#1685FB',
            });
            calendarCreated = true;
            const created = await Calendar.createEvent({
              title,
              notes: 'Created by the Lynx Capacitor Android smoke matrix.',
              startDate,
              endDate,
              calendarId: calendar.id,
            });
            eventId = created.id;
            if (!eventId) {
              throw new Error('Calendar.createEvent did not return an id');
            }

            const result = await Calendar.findEvents({
              title,
              startDate: startDate - 60_000,
              endDate: endDate + 60_000,
              calendarName,
            });
            const match = result.events.find(event => event.id === eventId);
            if (!match) {
              throw new Error(`Calendar.findEvents did not return created event ${eventId}`);
            }
            verification = {
              id: eventId,
              title: match.title ?? title,
              verified: 'create/find/delete',
            };
          } finally {
            try {
              if (eventId) {
                await Calendar.deleteEvent({ id: eventId });
              }
            } finally {
              if (calendarCreated) {
                await Calendar.deleteCalendar({ name: calendarName });
              }
            }
          }

          return verification;
        },
        smoke: true,
      },
      { label: 'checkPermissions', run: () => Calendar.checkPermissions() },
      { label: 'listCalendars', run: () => Calendar.listCalendars() },
    ],
  },
  {
    name: 'Local Notifications',
    pkg: '@capacitor/local-notifications',
    category: 'Notifications',
    description: 'Schedule on-device notifications.',
    supportStatus: 'full',
    actions: [
      { label: 'checkPermissions', run: () => LocalNotifications.checkPermissions(), smoke: true },
      { label: 'requestPermissions', run: () => LocalNotifications.requestPermissions() },
      {
        label: 'schedule (2s)',
        run: () =>
          LocalNotifications.schedule({
            notifications: [
              {
                id: Math.floor(Math.random() * 100000),
                title: 'Lynx + Capacitor',
                body: 'Scheduled via the bridge 🎉',
                schedule: { at: new Date(Date.now() + 2000) },
              },
            ],
          }),
      },
      { label: 'getPending', run: () => LocalNotifications.getPending() },
    ],
  },
  {
    name: 'Push Notifications',
    pkg: '@capacitor/push-notifications',
    category: 'Notifications',
    description: 'Remote push (APNs unavailable on Sim).',
    supportStatus: 'partial',
    actions: [
      { label: 'checkPermissions', run: () => PushNotifications.checkPermissions(), smoke: true },
      { label: 'requestPermissions', run: () => PushNotifications.requestPermissions() },
      { label: 'register', run: () => PushNotifications.register() },
    ],
  },

  // ---------------------------------------------------------------- Requires SDK
  {
    name: 'Barcode Scanner',
    pkg: '@capacitor/barcode-scanner',
    category: 'Requires SDK',
    description: 'Camera barcode scan (needs hardware).',
    supportStatus: 'partial',
    actions: [
      {
        label: 'scanBarcode',
        run: () =>
          CapacitorBarcodeScanner.scanBarcode({
            hint: 17 as any,
          }),
      },
    ],
  },
  {
    name: 'Google Maps',
    pkg: '@capacitor/google-maps',
    category: 'Requires SDK',
    description: 'Needs Google Maps SDK + API key.',
    supportStatus: 'partial',
    actions: [
      {
        label: 'destroy (dispatch test)',
        run: () => GoogleMaps.destroy({ id: 'demo' }),
      },
      {
        label: 'create',
        run: () =>
          GoogleMaps.create({
            id: 'demo',
            apiKey: '',
            config: {
              center: { lat: 0, lng: 0 },
              zoom: 1,
            },
          }),
      },
    ],
  },
  {
    name: 'Background Runner',
    pkg: '@capacitor/background-runner',
    category: 'Requires SDK',
    description: 'Needs a registered JS runner.',
    supportStatus: 'partial',
    actions: [
      { label: 'checkPermissions', run: () => BackgroundRunner.checkPermissions() },
      { label: 'dispatchEvent', run: () => BackgroundRunner.dispatchEvent({ label: 'demo', event: 'test', details: {} }) },
    ],
  },
  {
    name: 'Local LLM 🧪',
    pkg: '@capacitor/local-llm',
    category: 'Requires SDK',
    description: 'Experimental on-device LLM.',
    supportStatus: 'partial',
    actions: [
      { label: 'systemAvailability', run: () => LocalLLM.systemAvailability(), smoke: true },
      { label: 'warmup', run: () => LocalLLM.warmup({ sessionId: 'demo' }) },
    ],
  },

  // ---------------------------------------------------------------- Community
  {
    name: 'Keep Awake',
    pkg: '@capacitor-community/keep-awake',
    category: 'Community',
    description: 'Prevent the screen from dimming.',
    supportStatus: 'full',
    actions: [
      { label: 'isSupported', run: () => KeepAwake.isSupported(), smoke: true },
      { label: 'isKeptAwake', run: () => KeepAwake.isKeptAwake(), smoke: true },
      { label: 'keepAwake', run: () => KeepAwake.keepAwake() },
      { label: 'allowSleep', run: () => KeepAwake.allowSleep() },
    ],
  },
  {
    name: 'Safe Area',
    pkg: '@capacitor-community/safe-area',
    category: 'Community',
    description: 'Style and toggle system bars visibility.',
    supportStatus: 'full',
    actions: [
      {
        label: 'setStyle (Light)',
        run: () => SafeArea.setSystemBarsStyle({ style: SafeAreaStyle.Light }),
        smoke: true,
      },
      {
        label: 'setStyle (Dark)',
        run: () => SafeArea.setSystemBarsStyle({ style: SafeAreaStyle.Dark }),
      },
      {
        label: 'hide StatusBar',
        run: () => SafeArea.hideSystemBars({ type: SafeAreaBarType.StatusBar }),
      },
      {
        label: 'show StatusBar',
        run: () => SafeArea.showSystemBars({ type: SafeAreaBarType.StatusBar }),
      },
    ],
  },
  {
    name: 'SQLite',
    pkg: '@capacitor-community/sqlite',
    category: 'Community',
    description: 'Native SQLite database operations.',
    supportStatus: 'full',
    actions: [
      {
        label: 'echo',
        run: () => CapacitorSQLite.echo({ value: 'lynx-capacitor' }),
        smoke: true,
      },
      {
        label: 'create + query',
        run: async () => {
          await CapacitorSQLite.createConnection({
            database: 'demo',
            version: 1,
            encrypted: false,
            mode: 'no-encryption',
          });
          await CapacitorSQLite.open({ database: 'demo' });
          await CapacitorSQLite.execute({
            database: 'demo',
            statements: 'CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT); INSERT OR REPLACE INTO test VALUES (1, "lynx-capacitor");',
          });
          const result = await CapacitorSQLite.query({
            database: 'demo',
            statement: 'SELECT * FROM test',
            values: [],
          });
          await CapacitorSQLite.close({ database: 'demo' });
          return result;
        },
      },
      {
        label: 'isAvailable',
        run: () => (CapacitorSQLite as any).isAvailable(),
      },
    ],
  },
];

export const CATEGORY_ORDER: PluginCategory[] = [
  'Device & App',
  'UI & Feedback',
  'Media & Files',
  'Networking',
  'System & Sensors',
  'Notifications',
  'Community',
  'Requires SDK',
];

export async function runSmokeMatrix(): Promise<
  Array<{
    plugin: string;
    action: string;
    status: 'passed' | 'failed';
    value?: unknown;
    error?: string;
    code?: string;
  }>
> {
  const tests = PLUGINS.flatMap(entry =>
    entry.actions.filter(action => action.smoke).map(action => ({ entry, action })),
  );

  return Promise.all(
    tests.map(async ({ entry, action }) => {
      try {
        const value = await Promise.race([
          action.run(),
          new Promise<never>((_, reject) => {
            setTimeout(
              () => reject(new Error('Timed out after 8 seconds')),
              8000,
            );
          }),
        ]);
        return {
          plugin: entry.name,
          action: action.label,
          status: 'passed' as const,
          value,
        };
      } catch (error) {
        const nativeError = error as { message?: unknown; code?: unknown };
        return {
          plugin: entry.name,
          action: action.label,
          status: 'failed' as const,
          error: String(nativeError?.message ?? error),
          code:
            nativeError?.code === undefined ? undefined : String(nativeError.code),
        };
      }
    }),
  );
}
