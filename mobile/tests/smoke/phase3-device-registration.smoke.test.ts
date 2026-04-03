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
      },
    }));

    jest.doMock("expo-notifications", () => ({
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
        preference_state: expect.objectContaining({ push_enabled: true }),
      }),
      "test-token"
    );
  });
});
