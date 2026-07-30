declare module '@capacitor/google-maps/dist/esm/implementation.js' {
  export interface CapacitorGoogleMapsPlugin {
    create(options: {
      id: string;
      apiKey: string;
      config: Record<string, unknown>;
      forceCreate?: boolean;
    }): Promise<void>;
    destroy(options: { id: string }): Promise<void>;
  }

  export const CapacitorGoogleMaps: CapacitorGoogleMapsPlugin;
}
