import type { ListenerCallback, PluginListenerHandle } from './definitions';

/**
 * Base class for JavaScript-only plugin implementations, matching
 * @capacitor/core's WebPlugin. Real @capacitor/* plugins extend this for their
 * `web` fallback; we ship it so those imports resolve.
 */
export interface WebPluginConfig {
  readonly name: string;
  platforms?: string[];
}

export interface ListenerData {
  eventName: string;
  listenerFunc: ListenerCallback;
}

export class WebPlugin {
  protected listeners: Record<string, ListenerCallback[]> = {};
  protected retainedEventArguments: Record<string, any[]> = {};
  protected windowListeners: Record<
    string,
    { registered: boolean; windowEventName: string; pluginEventName: string; handler: (e: any) => void }
  > = {};

  constructor(config?: WebPluginConfig) {
    if (config) {
      // eslint-disable-next-line no-console
      console.warn(
        `Capacitor WebPlugin "${config.name}" config is deprecated and ignored by the Lynx adapter.`,
      );
    }
  }

  addListener(eventName: string, listenerFunc: ListenerCallback): Promise<PluginListenerHandle> {
    const listeners = this.listeners[eventName];
    if (!listeners) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listenerFunc);

    const remove = async (): Promise<void> => this.removeListener(eventName, listenerFunc);
    const p: any = Promise.resolve({ remove });

    this.sendRetainedArgumentsForEvent(eventName);

    return p;
  }

  async removeAllListeners(): Promise<void> {
    this.listeners = {};
  }

  protected notifyListeners(eventName: string, data: any, retainUntilConsumed?: boolean): void {
    const listeners = this.listeners[eventName];
    if (!listeners) {
      if (retainUntilConsumed) {
        let args = this.retainedEventArguments[eventName];
        if (!args) {
          args = [];
        }
        args.push(data);
        this.retainedEventArguments[eventName] = args;
      }
      return;
    }
    listeners.forEach(listener => listener(data));
  }

  protected hasListeners(eventName: string): boolean {
    return !!this.listeners[eventName]?.length;
  }

  protected removeListener(eventName: string, listenerFunc: ListenerCallback): void {
    const listeners = this.listeners[eventName];
    if (!listeners) {
      return;
    }
    const index = listeners.indexOf(listenerFunc);
    this.listeners[eventName].splice(index, 1);
  }

  private sendRetainedArgumentsForEvent(eventName: string): void {
    const args = this.retainedEventArguments[eventName];
    if (!args) {
      return;
    }
    delete this.retainedEventArguments[eventName];
    args.forEach(data => this.notifyListeners(eventName, data));
  }
}
