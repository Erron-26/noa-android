package com.transportessinbarreras.noa;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.transportessinbarreras.noa.BuildConfig;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Puente JS <-> servicio foreground de rastreo (sobrevive con app cerrada).
        registerPlugin(TrackingPlugin.class);

        // En debug: desactivar caché del WebView para que los cambios web
        // se reflejen sin borrar datos de la app en el teléfono.
        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true);
            getBridge().getWebView().getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        }
    }
}
