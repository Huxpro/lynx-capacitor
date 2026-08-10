package com.getcapacitor;

/** Result and event sink used by a Capacitor bridge hosted outside a WebView. */
public interface HeadlessResultListener {
    void onResult(String callbackId, String resultJson);

    default void onEvent(String eventName, String target, String dataJson) {}
}
