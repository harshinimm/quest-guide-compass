declare const chrome:
  | {
      runtime: {
        getURL(path: string): string;
        onInstalled: {
          addListener(callback: () => void): void;
        };
      };
      storage: {
        local: {
          get(keys: string[], callback: (result: Record<string, unknown>) => void): void;
          set(items: Record<string, string>, callback?: () => void): void;
        };
      };
      alarms: {
        create(name: string, info: { periodInMinutes?: number; delayInMinutes?: number }): void;
        onAlarm: {
          addListener(callback: (alarm: { name: string }) => void): void;
        };
      };
      notifications: {
        create(
          id: string,
          options: {
            type: "basic";
            iconUrl: string;
            title: string;
            message: string;
            priority?: number;
          }
        ): void;
      };
    }
  | undefined;
