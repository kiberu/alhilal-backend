describe.each([
  ["ios", "IOS", "18.0"],
  ["android", "ANDROID", "14"],
])("registerCurrentDevice %s smoke", (platform, expectedPlatform, version) => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("keeps the registration payload provider-agnostic across mobile platforms", async () => {
    const registerDevice = jest.fn().mockResolvedValue({ success: true });
    const setNotificationChannelAsync = jest.fn().mockResolvedValue(undefined);

    jest.doMock("expo-secure-store", () => ({
      getItemAsync: jest.fn().mockResolvedValue("install-1"),
      setItemAsync: jest.fn(),
    }));

    jest.doMock("expo-constants", () => ({
      __esModule: true,
      default: {
        deviceName: platform === "ios" ? "Pilgrim iPhone" : "Pilgrim Android",
        expoConfig: { version: "3.0.0" },
        manifest2: null,
        expoGoConfig: null,
      },
    }));

    jest.doMock("expo-notifications", () => ({
      AndroidImportance: { DEFAULT: "default" },
      setNotificationChannelAsync,
      getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
      requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
      getDevicePushTokenAsync: jest.fn().mockResolvedValue({ type: "native", data: "push-token-1" }),
    }));

    jest.doMock("react-native", () => ({
      Platform: {
        OS: platform,
        Version: version,
      },
    }));

    jest.doMock("@/lib/api/services/support", () => ({
      SupportService: {
        registerDevice,
      },
    }));

    let registerCurrentDevice!: (token: string, preferences?: { push_enabled: boolean }) => Promise<unknown>;
    jest.isolateModules(() => {
      ({ registerCurrentDevice } = require("@/lib/support/device-registration"));
    });

    await registerCurrentDevice("test-token", { push_enabled: true });

    expect(registerDevice).toHaveBeenCalledWith(
      expect.objectContaining({
        installation_id: "install-1",
        platform: expectedPlatform,
        notifications_enabled: true,
        capability_flags: expect.objectContaining({ push: true }),
        preference_state: expect.objectContaining({ push_enabled: true }),
      }),
      "test-token"
    );

    if (platform === "android") {
      expect(setNotificationChannelAsync).toHaveBeenCalledWith(
        "default",
        expect.objectContaining({
          name: "General",
        })
      );
    } else {
      expect(setNotificationChannelAsync).not.toHaveBeenCalled();
    }
  });
});

describe("registerCurrentDevice Expo Go Android", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("avoids requesting a remote push token in Expo Go on Android", async () => {
    const registerDevice = jest.fn().mockResolvedValue({ success: true });
    const getDevicePushTokenAsync = jest.fn();

    jest.doMock("expo-secure-store", () => ({
      getItemAsync: jest.fn().mockResolvedValue("install-1"),
      setItemAsync: jest.fn(),
    }));

    jest.doMock("expo-constants", () => ({
      __esModule: true,
      default: {
        deviceName: "Pilgrim Android",
        expoConfig: { version: "3.0.0" },
        manifest2: null,
        expoGoConfig: { debuggerHost: "127.0.0.1:8081" },
      },
    }));

    jest.doMock("expo-notifications", () => ({
      AndroidImportance: { DEFAULT: "default" },
      setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
      getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
      requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
      getDevicePushTokenAsync,
    }));

    jest.doMock("react-native", () => ({
      Platform: {
        OS: "android",
        Version: "14",
      },
    }));

    jest.doMock("@/lib/api/services/support", () => ({
      SupportService: {
        registerDevice,
      },
    }));

    let registerCurrentDevice!: (token: string, preferences?: { push_enabled: boolean }) => Promise<unknown>;
    jest.isolateModules(() => {
      ({ registerCurrentDevice } = require("@/lib/support/device-registration"));
    });

    await registerCurrentDevice("test-token", { push_enabled: true });

    expect(getDevicePushTokenAsync).not.toHaveBeenCalled();
    expect(registerDevice).toHaveBeenCalledWith(
      expect.objectContaining({
        capability_flags: expect.objectContaining({
          push: false,
          local: true,
        }),
        provider_token_fields: expect.objectContaining({
          warning: expect.stringContaining("development or production build"),
        }),
      }),
      "test-token"
    );
  });
});
