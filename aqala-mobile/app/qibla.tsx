import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import Svg, { Circle, Line, Path, Text as SvgText, G } from "react-native-svg";
import WallpaperBackground from "@/components/WallpaperBackground";
import {
  calculateQiblaDirection,
  calculateDistanceToKaaba,
  getCompassDirection,
  formatDistance,
} from "@/lib/qibla/calculations";

const GOLD = "#D4AF37";
const COMPASS_SIZE = Dimensions.get("window").width * 0.78;
const RADIUS = COMPASS_SIZE / 2;

type LocationCoords = { lat: number; lng: number };

export default function QiblaScreen() {
  const router = useRouter();

  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const [heading, setHeading] = useState(0);
  const [compassAvailable, setCompassAvailable] = useState(true);

  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const smoothHeading = useRef(new Animated.Value(0)).current;
  const prevHeading = useRef(0);

  // ── Location ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (!cancelled) {
            setLocationError("Location permission is required for Qibla direction.");
            setLoadingLocation(false);
          }
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!cancelled) {
          const coords: LocationCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(coords);
          setQiblaAngle(calculateQiblaDirection(coords.lat, coords.lng));
          setDistance(calculateDistanceToKaaba(coords.lat, coords.lng));
          setLoadingLocation(false);
        }
      } catch {
        if (!cancelled) {
          setLocationError("Could not determine your location.");
          setLoadingLocation(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Compass heading via Core Location ──────────────────────
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;

    (async () => {
      try {
        sub = await Location.watchHeadingAsync((data) => {
          // trueHeading is corrected for magnetic declination;
          // falls back to magHeading when unavailable (-1).
          const angle =
            data.trueHeading >= 0 ? data.trueHeading : data.magHeading;

          // Smooth angular transition (avoid jumps across 0°/360°)
          let delta = angle - prevHeading.current;
          if (delta > 180) delta -= 360;
          if (delta < -180) delta += 360;
          const smoothed = prevHeading.current + delta;
          prevHeading.current = smoothed;

          Animated.timing(smoothHeading, {
            toValue: smoothed,
            duration: 120,
            useNativeDriver: true,
          }).start();

          setHeading(angle);
        });
      } catch {
        setCompassAvailable(false);
      }
    })();

    return () => {
      sub?.remove();
    };
  }, []);

  // ── Derived values ────────────────────────────────────────
  const qiblaRelative =
    qiblaAngle !== null ? qiblaAngle - heading : 0;

  const isAligned = (() => {
    if (qiblaAngle === null) return false;
    const diff = Math.abs(((qiblaAngle - heading + 180) % 360) - 180);
    return diff < 5;
  })();

  // Animated rotation for the compass dial (rotates opposite to heading)
  const compassRotation = smoothHeading.interpolate({
    inputRange: [-3600, 3600],
    outputRange: ["3600deg", "-3600deg"],
  });

  // Animated rotation for the qibla needle
  const needleRotation =
    qiblaAngle !== null
      ? Animated.subtract(qiblaAngle, smoothHeading).interpolate({
          inputRange: [-3600, 3600],
          outputRange: ["-3600deg", "3600deg"],
        })
      : "0deg";

  // ── Render ────────────────────────────────────────────────
  return (
    <WallpaperBackground edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Qibla Finder</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.body}>
        {loadingLocation ? (
          <View style={styles.center}>
            <Text style={styles.loadingText}>Getting your location…</Text>
          </View>
        ) : locationError ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{locationError}</Text>
            <TouchableOpacity
              onPress={() => {
                setLoadingLocation(true);
                setLocationError(null);
                Location.requestForegroundPermissionsAsync().then(({ status }) => {
                  if (status === "granted") {
                    Location.getCurrentPositionAsync({
                      accuracy: Location.Accuracy.Balanced,
                    }).then((pos) => {
                      const coords: LocationCoords = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                      };
                      setLocation(coords);
                      setQiblaAngle(calculateQiblaDirection(coords.lat, coords.lng));
                      setDistance(calculateDistanceToKaaba(coords.lat, coords.lng));
                      setLoadingLocation(false);
                    });
                  } else {
                    setLocationError("Location permission is required.");
                    setLoadingLocation(false);
                  }
                });
              }}
              style={styles.retryBtn}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Compass container */}
            <View
              style={[
                styles.compassContainer,
                { width: COMPASS_SIZE, height: COMPASS_SIZE },
              ]}
            >
              {/* Glow when aligned */}
              {isAligned && <View style={styles.glow} />}

              {/* Rotating compass dial */}
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  { transform: [{ rotate: compassRotation }] },
                ]}
              >
                <CompassDial size={COMPASS_SIZE} />
              </Animated.View>

              {/* Qibla needle */}
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  { transform: [{ rotate: needleRotation as any }] },
                ]}
              >
                <QiblaNeedle size={COMPASS_SIZE} aligned={isAligned} />
              </Animated.View>

              {/* Center dot */}
              <View style={styles.centerDot}>
                <View
                  style={[
                    styles.centerDotInner,
                    isAligned && styles.centerDotAligned,
                  ]}
                />
              </View>

              {/* Fixed top indicator */}
              <View style={styles.topIndicator}>
                <View style={styles.triangle} />
              </View>
            </View>

            {/* Info section */}
            <View style={styles.info}>
              {isAligned && (
                <View style={styles.alignedBadge}>
                  <Text style={styles.alignedBadgeText}>✓ Facing Qibla</Text>
                </View>
              )}

              <Text style={styles.degrees}>
                {qiblaAngle !== null ? `${Math.round(qiblaAngle)}°` : "—"}{" "}
                <Text style={styles.direction}>
                  {qiblaAngle !== null ? getCompassDirection(qiblaAngle) : ""}
                </Text>
              </Text>

              {distance !== null && (
                <Text style={styles.distance}>
                  {formatDistance(distance)} to Kaaba
                </Text>
              )}

              {!compassAvailable && (
                <Text style={styles.hint}>
                  Compass not available on this device. Use the angle above with
                  a physical compass.
                </Text>
              )}

              {compassAvailable && heading === 0 && (
                <Text style={styles.hint}>
                  Move your device in a figure-8 to calibrate
                </Text>
              )}
            </View>

            <Text style={styles.footer}>
              Point the golden Kaaba marker towards the top arrow
            </Text>
          </>
        )}
      </View>
    </WallpaperBackground>
  );
}

// ── Compass Dial SVG ──────────────────────────────────────────
function CompassDial({ size }: { size: number }) {
  const r = size / 2;
  const tickOuter = r - 4;
  const cardinals = [
    { label: "N", deg: 0, color: "#ef4444" },
    { label: "E", deg: 90, color: "rgba(255,255,255,0.5)" },
    { label: "S", deg: 180, color: "rgba(255,255,255,0.5)" },
    { label: "W", deg: 270, color: "rgba(255,255,255,0.5)" },
  ];

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Outer ring */}
      <Circle
        cx={r}
        cy={r}
        r={r - 2}
        stroke={GOLD}
        strokeOpacity={0.2}
        strokeWidth={1.5}
        fill="none"
      />

      {/* Tick marks */}
      {Array.from({ length: 72 }).map((_, i) => {
        const deg = i * 5;
        const rad = (deg * Math.PI) / 180;
        const isMajor = deg % 90 === 0;
        const isMedium = deg % 30 === 0;
        const len = isMajor ? 16 : isMedium ? 10 : 5;
        const sw = isMajor ? 2 : 1;
        const opacity = isMajor ? 0.6 : isMedium ? 0.35 : 0.15;

        const x1 = r + (tickOuter - len) * Math.sin(rad);
        const y1 = r - (tickOuter - len) * Math.cos(rad);
        const x2 = r + tickOuter * Math.sin(rad);
        const y2 = r - tickOuter * Math.cos(rad);

        return (
          <Line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isMajor ? GOLD : "white"}
            strokeWidth={sw}
            strokeOpacity={opacity}
          />
        );
      })}

      {/* Cardinal labels */}
      {cardinals.map(({ label, deg, color }) => {
        const rad = (deg * Math.PI) / 180;
        const labelR = r - 30;
        const x = r + labelR * Math.sin(rad);
        const y = r - labelR * Math.cos(rad);

        return (
          <SvgText
            key={label}
            x={x}
            y={y}
            fill={color}
            fontSize={14}
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="central"
          >
            {label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

// ── Qibla Needle SVG ──────────────────────────────────────────
function QiblaNeedle({ size, aligned }: { size: number; aligned: boolean }) {
  const r = size / 2;
  const kaabaSize = 22;
  const kaabaY = 18;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Stem line from center to kaaba */}
      <Line
        x1={r}
        y1={r}
        x2={r}
        y2={kaabaY + kaabaSize + 4}
        stroke={GOLD}
        strokeWidth={2}
        strokeOpacity={aligned ? 0.9 : 0.5}
        strokeLinecap="round"
      />

      {/* Kaaba icon */}
      <G>
        {/* Black cube */}
        <Path
          d={`M${r - kaabaSize / 2} ${kaabaY} h${kaabaSize} v${kaabaSize} h${-kaabaSize} Z`}
          fill="#1a1a1a"
          stroke={GOLD}
          strokeWidth={aligned ? 2.5 : 1.5}
          strokeOpacity={aligned ? 1 : 0.7}
          rx={3}
        />
        {/* Gold band */}
        <Path
          d={`M${r - kaabaSize / 2} ${kaabaY + kaabaSize * 0.33} h${kaabaSize} v${5} h${-kaabaSize} Z`}
          fill={GOLD}
          fillOpacity={aligned ? 1 : 0.7}
        />
        {/* Door */}
        <Path
          d={`M${r - 2.5} ${kaabaY + kaabaSize - 7} h5 v7 h-5 Z`}
          fill={GOLD}
          fillOpacity={0.3}
          stroke={GOLD}
          strokeWidth={0.5}
          strokeOpacity={0.5}
        />
      </G>
    </Svg>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backBtn: { width: 60 },
  backText: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
  title: { color: "#fff", fontSize: 17, fontWeight: "600" },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  center: { alignItems: "center" },
  loadingText: { color: "rgba(255,255,255,0.5)", fontSize: 14 },
  errorText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontSize: 14 },

  compassContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 9999,
    backgroundColor: "rgba(212,175,55,0.08)",
  },
  centerDot: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(212,175,55,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  centerDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(212,175,55,0.5)",
  },
  centerDotAligned: {
    backgroundColor: GOLD,
  },
  topIndicator: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: GOLD,
  },

  info: { alignItems: "center", marginBottom: 12 },
  alignedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212,175,55,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  alignedBadgeText: { color: GOLD, fontSize: 13, fontWeight: "600" },
  degrees: { color: "#fff", fontSize: 26, fontWeight: "600" },
  direction: { color: "rgba(255,255,255,0.5)", fontSize: 18 },
  distance: { color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 2 },
  hint: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 260,
  },
  footer: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    textAlign: "center",
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
  },
});
