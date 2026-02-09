import { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Platform, Linking } from "react-native";
import { useRouter } from "expo-router";
import { WebView, WebViewNavigation } from "react-native-webview";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { auth } from "@/lib/firebase/config";
import { Ionicons } from "@expo/vector-icons";
import WallpaperBackground from "@/components/WallpaperBackground";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || "https://aqala.io";

export default function TranslateScreen() {
  const { user } = useAuth();
  const { getDarkestColor, getGradientColors } = usePreferences();
  const darkBg = getDarkestColor();
  const gradientColors = getGradientColors();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [pageTitle, setPageTitle] = useState("Listen & Translate");
  const [micError, setMicError] = useState(false);

  // Get the user's Firebase auth token to inject into the WebView
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setAuthToken(token);
        } catch (error) {
          console.error("Failed to get auth token:", error);
          setAuthToken(null);
        }
      }
    };
    getToken();
  }, [user]);

  const injectedJS = `
    (function() {
      var _origLog = console.log;
      var _origError = console.error;
      var _origWarn = console.warn;
      
      function sendToRN(level, args) {
        try {
          var msg = Array.prototype.slice.call(args).map(function(a) {
            if (typeof a === 'object') {
              try { return JSON.stringify(a); } catch(e) { return String(a); }
            }
            return String(a);
          }).join(' ');
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'console',
            level: level,
            message: msg
          }));
        } catch(e) {}
      }
      
      console.log = function() { sendToRN('log', arguments); _origLog.apply(console, arguments); };
      console.error = function() { sendToRN('error', arguments); _origError.apply(console, arguments); };
      console.warn = function() { sendToRN('warn', arguments); _origWarn.apply(console, arguments); };
      
      window.addEventListener('error', function(e) {
        sendToRN('error', ['UNCAUGHT ERROR: ' + e.message + ' at ' + e.filename + ':' + e.lineno]);
      });
      window.addEventListener('unhandledrejection', function(e) {
        sendToRN('error', ['UNHANDLED PROMISE: ' + (e.reason ? (e.reason.message || String(e.reason)) : 'unknown')]);
      });

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        var _origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = function(constraints) {
          sendToRN('log', ['[MIC] getUserMedia called with: ' + JSON.stringify(constraints)]);
          return _origGetUserMedia(constraints).then(function(stream) {
            sendToRN('log', ['[MIC] getUserMedia SUCCESS - tracks: ' + stream.getTracks().map(function(t) { return t.kind + ':' + t.label; }).join(', ')]);
            return stream;
          }).catch(function(err) {
            sendToRN('error', ['[MIC] getUserMedia FAILED: ' + err.name + ': ' + err.message]);
            throw err;
          });
        };
      } else {
        sendToRN('error', ['[MIC] navigator.mediaDevices.getUserMedia NOT AVAILABLE']);
      }

      if (navigator.permissions) {
        navigator.permissions.query({ name: 'microphone' }).then(function(result) {
          sendToRN('log', ['[MIC] Permission state: ' + result.state]);
          result.onchange = function() {
            sendToRN('log', ['[MIC] Permission changed to: ' + result.state]);
          };
        }).catch(function(e) {
          sendToRN('warn', ['[MIC] Permission query failed: ' + e.message]);
        });
      }

      var style = document.createElement('style');
      style.textContent = \`
        header:not(footer),
        nav:not(footer *),
        [class*="bottom-nav"],
        [class*="nav-bar"] {
          display: none !important;
        }
        body {
          padding-top: 0 !important;
          margin-top: 0 !important;
        }
        .fixed.inset-0 {
          top: 0 !important;
        }
        .fixed.inset-0.top-\\\\[68px\\\\] {
          top: 0 !important;
        }
        main, [role="main"] {
          padding-top: 0 !important;
          margin-top: 0 !important;
        }
        footer {
          padding-bottom: 8px !important;
        }

        html, body {
          background: linear-gradient(to bottom, ${gradientColors.join(', ')}) !important;
          background-attachment: fixed !important;
        }
        body > div,
        #__next,
        [data-nextjs-scroll-focus-boundary],
        main,
        [role="main"] {
          background: transparent !important;
          background-color: transparent !important;
        }
        /* Override backgrounds but preserve summary modal (z-50) and its children */
        .fixed.inset-0:not(.z-50),
        .absolute.inset-0:not(.z-50 *) {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
        }
        div[class*="bg-[#0"]:not(.z-50 *),
        div[class*="bg-gradient"]:not(.z-50 *),
        section:not(.z-50 *) {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
        }
        /* Summary modal: solid bg, no blur */
        .fixed.inset-0.z-50 .summary-modal-content > div:last-child {
          background: linear-gradient(180deg, #0a2e1f 0%, #032117 50%, #021912 100%) !important;
        }
        .fixed.inset-0.z-50 .summary-backdrop-in {
          background: rgba(0,0,0,0.85) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
      \`;
      document.head.appendChild(style);

      // Replace "Khutba" with "Session" in summary modal text
      var observer = new MutationObserver(function(mutations) {
        document.querySelectorAll('.fixed.inset-0.z-50 h2, .fixed.inset-0.z-50 input[placeholder]').forEach(function(el) {
          if (el.tagName === 'H2' && el.textContent && el.textContent.indexOf('Khutba') !== -1) {
            el.childNodes.forEach(function(node) {
              if (node.nodeType === 3 && node.textContent.indexOf('Khutba') !== -1) {
                node.textContent = node.textContent.replace(/Khutba/gi, 'Session');
              }
            });
          }
          if (el.tagName === 'INPUT' && el.placeholder && el.placeholder.indexOf('khutba') !== -1) {
            el.placeholder = el.placeholder.replace(/khutba/gi, 'session');
          }
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });

      sendToRN('log', ['[WEBVIEW] Page loaded: ' + window.location.href]);
      sendToRN('log', ['[WEBVIEW] User agent: ' + navigator.userAgent]);

      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
    })();
    true;
  `;

  const cssGradient = `linear-gradient(to bottom, ${gradientColors.join(", ")})`;

  const authInjectionJS = `
    (function() {
      try {
        ${authToken ? `localStorage.setItem('firebase_auth_token', '${authToken}');` : ""}
        var earlyStyle = document.createElement('style');
        earlyStyle.textContent = 'html, body { background: ${cssGradient} !important; background-attachment: fixed !important; }';
        (document.head || document.documentElement).appendChild(earlyStyle);
      } catch(e) {}
    })();
    true;
  `;

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    if (navState.title && navState.title !== pageTitle) {
      setPageTitle(navState.title);
    }
  };

  return (
    <WallpaperBackground edges={["top", "bottom"]}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 border-b border-white/10"
        style={{ backgroundColor: darkBg }}
      >
        <View className="flex-1 flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-[#D4AF37]/20 items-center justify-center">
            <Ionicons name="mic" size={16} color="#D4AF37" />
          </View>
          <Text className="text-white font-semibold text-base" numberOfLines={1}>
            Listen & Translate
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => webViewRef.current?.reload()}
          className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
        >
          <Ionicons name="refresh" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Mic error banner */}
      {micError && (
        <View className="px-4 py-3 bg-red-900/30 border-b border-red-500/30">
          <Text className="text-red-300 text-xs mb-2">
            ⚠️ Microphone access requires HTTPS. The WebView can't access the mic over HTTP.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(`${WEB_URL}/listen`)}
            className="flex-row items-center gap-2 bg-white/10 rounded-lg py-2 px-3 self-start"
          >
            <Ionicons name="open-outline" size={14} color="#D4AF37" />
            <Text className="text-[#D4AF37] text-xs font-medium">Open in Safari (mic works there)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView */}
      <View className="flex-1">
        {loading && (
          <View className="absolute inset-0 z-10 items-center justify-center" style={{ backgroundColor: darkBg }}>
            <View className="items-center gap-4">
              <View className="w-16 h-16 rounded-full bg-[#D4AF37]/20 items-center justify-center">
                <Ionicons name="mic" size={28} color="#D4AF37" />
              </View>
              <Text className="text-white font-semibold text-lg">Loading listener...</Text>
              <ActivityIndicator size="large" color="#D4AF37" />
              <Text className="text-white/40 text-xs">Connecting to Aqala</Text>
            </View>
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{ uri: `${WEB_URL}/listen` }}
          style={{ flex: 1, backgroundColor: darkBg }}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          injectedJavaScriptBeforeContentLoaded={authInjectionJS}
          injectedJavaScript={injectedJS}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          mediaCapturePermissionGrantType="grant"
          onPermissionRequest={(event) => {
            event.nativeEvent?.grant?.();
          }}
          startInLoadingState={false}
          originWhitelist={["*"]}
          allowsBackForwardNavigationGestures={true}
          {...(Platform.OS === "android"
            ? {
                androidLayerType: "hardware",
              }
            : {})}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === "ready") {
                console.log("✅ [WebView] Listen page ready");
              } else if (data.type === "console") {
                const prefix = `🌐 [WebView ${data.level}]`;
                if (data.level === "error") {
                  console.error(prefix, data.message);
                  if (data.message?.includes("getUserMedia NOT AVAILABLE") || 
                      data.message?.includes("getUserMedia FAILED")) {
                    setMicError(true);
                  }
                } else if (data.level === "warn") {
                  console.warn(prefix, data.message);
                } else {
                  console.log(prefix, data.message);
                }
              }
            } catch (e) {
              console.log("🌐 [WebView raw]", event.nativeEvent.data?.substring(0, 200));
            }
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView error:", nativeEvent);
            setLoading(false);
          }}
          renderError={(errorName) => (
            <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: darkBg }}>
              <Ionicons name="cloud-offline" size={48} color="#D4AF37" />
              <Text className="text-white font-semibold text-lg mt-4 mb-2">
                Connection Error
              </Text>
              <Text className="text-white/50 text-sm text-center mb-6">
                Unable to load the listen page. Please check your internet connection.
              </Text>
              <TouchableOpacity
                onPress={() => webViewRef.current?.reload()}
                className="bg-[#D4AF37] rounded-xl py-3 px-6"
              >
                <Text style={{ color: darkBg }} className="font-semibold">Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </WallpaperBackground>
  );
}
