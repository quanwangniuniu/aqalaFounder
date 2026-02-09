import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { Magnetometer } from "expo-sensors";
import * as Location from "expo-location";
import Svg, {
  Circle,
  Line,
  Text as SvgText,
  G,
  Rect,
} from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import WallpaperBackground from "@/components/WallpaperBackground";
import {
  calculateQiblaDirection,
  calculateDistanceToKaaba,
  getCompassDirection,
  formatDistance,
} from "@/lib/qibla/calculations";

const COMPASS_SIZE = 280;
const COMPASS_CENTER = COMPASS_SIZE / 2;
const COMPASS_RADIUS = COMPASS_SIZE / 2 - 20;
const INNER_RADIUS = COMPASS_RADIUS - 16;

/**
 * Normalise shortest-path delta between two angles, handling the 0/360 wrap.
 * Returns a value in (-180, 180].
 */
function angleDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

export default function QiblaScreen() {
  const router = useRouter();

  // Location state
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // Compass state
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [compassAvailable, setCompassAvailable] = useState(true);
  const [hasReceivedHeading, setHasReceivedHeading] = useState(false);

  // Calculated values
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [distanceToKaaba, setDistanceToKaaba] = useState<number | null>(null);
  const [isPointingToQibla, setIsPointingToQibla] = useState(false);

  // RN Animated values (no native Worklets needed)
  const compassAnim = useRef(new Animated.Value(0)).current;
  const qiblaAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Keep track of the "logical" accumulated rotation to avoid jumps
  const compassLogical = useRef(0);
  const qiblaLogical = useRef(0);

  // ------- Location -------
  useEffect(() => {
    let cancelled = false;

    const applyCoords = (lat: number, lng: number) => {
      setLocation({ lat, lng });
      setQiblaDirection(calculateQiblaDirection(lat, lng));
      setDistanceToKaaba(calculateDistanceToKaaba(lat, lng));
      setLoadingLocation(false);
    };

    const fallback = () => applyCoords(-33.8688, 151.2093);

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== "granted") { fallback(); return; }

        // 1) Try last-known position first (instant, may be null)
        const last = await Location.getLastKnownPositionAsync();
        if (cancelled) return;
        if (last) {
          applyCoords(last.coords.latitude, last.coords.longitude);
        }

        // 2) Get a fresh fix with balanced accuracy + timeout
        const fresh = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 2000,
        });
        if (cancelled) return;
        applyCoords(fresh.coords.latitude, fresh.coords.longitude);
      } catch {
        if (!cancelled) fallback();
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ------- Magnetometer (Compass) -------
  useEffect(() => {
    let sub: ReturnType<typeof Magnetometer.addListener> | null = null;

    (async () => {
      const ok = await Magnetometer.isAvailableAsync();
      if (!ok) { setCompassAvailable(false); return; }

      Magnetometer.setUpdateInterval(60);

      sub = Magnetometer.addListener(({ x, y }) => {
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        let heading = (90 - angle + 360) % 360;
        if (Platform.OS === "ios") heading = (360 - heading + 360) % 360;

        setCompassHeading(heading);
        setHasReceivedHeading(true);
      });
    })();

    return () => { sub?.remove(); };
  }, []);

  // ------- Drive Animated values whenever heading / qibla change -------
  useEffect(() => {
    // Compass rotation: negate heading so the rose tracks North
    const targetCompass = compassLogical.current + angleDelta(
      compassLogical.current % 360 < 0
        ? compassLogical.current % 360 + 360
        : compassLogical.current % 360,
      (360 - compassHeading) % 360,
    );
    compassLogical.current = targetCompass;

    Animated.timing(compassAnim, {
      toValue: targetCompass,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    if (qiblaDirection !== null) {
      const desiredQibla = (qiblaDirection - compassHeading + 360) % 360;
      const targetQibla = qiblaLogical.current + angleDelta(
        ((qiblaLogical.current % 360) + 360) % 360,
        desiredQibla,
      );
      qiblaLogical.current = targetQibla;

      Animated.timing(qiblaAnim, {
        toValue: targetQibla,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      const diff = Math.abs(((qiblaDirection - compassHeading + 180) % 360) - 180);
      const pointing = diff < 5;
      setIsPointingToQibla(pointing);

      Animated.timing(pulseAnim, {
        toValue: pointing ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [compassHeading, qiblaDirection]);

  // Interpolated transforms
  const compassRotate = compassAnim.interpolate({
    inputRange: [-360, 0, 360],
    outputRange: ["-360deg", "0deg", "360deg"],
  });

  const qiblaRotate = qiblaAnim.interpolate({
    inputRange: [-360, 0, 360],
    outputRange: ["-360deg", "0deg", "360deg"],
  });

  // ------- Render helpers -------
  const renderCompassRose = () => {
    const ticks = [];
    for (let i = 0; i < 360; i += 10) {
      const isMajor = i % 90 === 0;
      const isMedium = i % 30 === 0;
      const tickLen = isMajor ? 14 : isMedium ? 10 : 6;
      const sw = isMajor ? 2 : 1;
      const color = isMajor
        ? "rgba(212,175,55,0.6)"
        : isMedium
          ? "rgba(255,255,255,0.3)"
          : "rgba(255,255,255,0.12)";

      const outerR = INNER_RADIUS;
      const innerR = outerR - tickLen;
      const rad = (i * Math.PI) / 180;

      ticks.push(
        <Line
          key={i}
          x1={COMPASS_CENTER + outerR * Math.sin(rad)}
          y1={COMPASS_CENTER - outerR * Math.cos(rad)}
          x2={COMPASS_CENTER + innerR * Math.sin(rad)}
          y2={COMPASS_CENTER - innerR * Math.cos(rad)}
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
        />,
      );
    }
    return ticks;
  };

  const renderCardinalLabels = () =>
    [
      { l: "N", d: 0, c: "#ef4444" },
      { l: "E", d: 90, c: "rgba(255,255,255,0.5)" },
      { l: "S", d: 180, c: "rgba(255,255,255,0.5)" },
      { l: "W", d: 270, c: "rgba(255,255,255,0.5)" },
    ].map(({ l, d, c }) => {
      const r = INNER_RADIUS - 24;
      const rad = (d * Math.PI) / 180;
      return (
        <SvgText
          key={l}
          x={COMPASS_CENTER + r * Math.sin(rad)}
          y={COMPASS_CENTER - r * Math.cos(rad)}
          fill={c}
          fontSize={14}
          fontWeight="700"
          textAnchor="middle"
          alignmentBaseline="central"
        >
          {l}
        </SvgText>
      );
    });

  const renderKaabaIcon = () => {
    const sz = 36;
    const x = COMPASS_CENTER - sz / 2;
    const y = 16;
    const gold = isPointingToQibla ? "#D4AF37" : "rgba(212,175,55,0.6)";
    const bandFill = isPointingToQibla ? "#D4AF37" : "rgba(212,175,55,0.7)";

    return (
      <G>
        {/* Stem */}
        <Line
          x1={COMPASS_CENTER} y1={y + sz + 2}
          x2={COMPASS_CENTER} y2={COMPASS_CENTER - 12}
          stroke={isPointingToQibla ? "#D4AF37" : "rgba(212,175,55,0.5)"}
          strokeWidth={3} strokeLinecap="round"
        />
        {/* Kaaba body */}
        <Rect x={x} y={y} width={sz} height={sz} rx={6}
          fill="#1a1a1a" stroke={gold} strokeWidth={2}
        />
        {/* Gold band */}
        <Rect x={x} y={y + sz * 0.33} width={sz} height={8} fill={bandFill} />
        {/* Dots on band */}
        {[0.25, 0.5, 0.75].map((f) => (
          <Circle key={f} cx={x + sz * f} cy={y + sz * 0.33 + 4} r={2}
            fill="rgba(26,26,26,0.4)"
          />
        ))}
        {/* Door */}
        <Rect x={COMPASS_CENTER - 4} y={y + sz - 12} width={8} height={10}
          rx={4} fill="rgba(212,175,55,0.3)" stroke="rgba(212,175,55,0.4)" strokeWidth={1}
        />
      </G>
    );
  };

  // ------- JSX -------
  return (
    <WallpaperBackground edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.6)" />
          <Text style={s.backTxt}>Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Qibla Finder</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Content */}
      <View style={s.content}>
        {loadingLocation ? (
          <View style={s.centered}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={s.loadingTxt}>Getting your location...</Text>
          </View>
        ) : (
          <>
            {/* Compass */}
            <View style={s.compassWrap}>
              {/* Glow */}
              <Animated.View
                style={[
                  s.glow,
                  {
                    opacity: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.15],
                    }),
                    transform: [{
                      scale: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.1],
                      }),
                    }],
                  },
                ]}
              />

              {/* Outer ring */}
              <View style={s.outerRing}>
                {[0, 90, 180, 270].map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  const r = COMPASS_SIZE / 2;
                  return (
                    <View key={deg} style={[s.outerDot, {
                      left: COMPASS_CENTER + r * Math.sin(rad) - 4,
                      top: COMPASS_CENTER - r * Math.cos(rad) - 4,
                    }]} />
                  );
                })}
              </View>

              {/* Fixed top indicator */}
              <View style={s.topInd}>
                <View style={s.topTri} />
              </View>

              {/* Rotating compass face */}
              <Animated.View style={{ transform: [{ rotate: compassRotate }] }}>
                <Svg width={COMPASS_SIZE} height={COMPASS_SIZE}
                  viewBox={`0 0 ${COMPASS_SIZE} ${COMPASS_SIZE}`}
                >
                  <Circle cx={COMPASS_CENTER} cy={COMPASS_CENTER} r={INNER_RADIUS}
                    fill="rgba(3,33,23,0.8)" stroke="rgba(255,255,255,0.1)" strokeWidth={1}
                  />
                  {renderCompassRose()}
                  {renderCardinalLabels()}
                </Svg>
              </Animated.View>

              {/* Rotating Qibla pointer */}
              <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: qiblaRotate }] }]}>
                <Svg width={COMPASS_SIZE} height={COMPASS_SIZE}
                  viewBox={`0 0 ${COMPASS_SIZE} ${COMPASS_SIZE}`}
                >
                  {renderKaabaIcon()}
                </Svg>
              </Animated.View>

              {/* Center dot */}
              <View style={s.centerDot}>
                <View style={s.centerOuter}>
                  <View style={s.centerInner} />
                </View>
              </View>
            </View>

            {/* Info */}
            <View style={s.info}>
              {isPointingToQibla && (
                <View style={s.badge}>
                  <Ionicons name="checkmark-circle" size={16} color="#D4AF37" />
                  <Text style={s.badgeTxt}>Facing Qibla</Text>
                </View>
              )}

              <Text style={s.deg}>
                {qiblaDirection !== null ? `${Math.round(qiblaDirection)}°` : "—"}
                <Text style={s.dir}>
                  {"  "}{qiblaDirection !== null ? getCompassDirection(qiblaDirection) : ""}
                </Text>
              </Text>

              <Text style={s.dist}>
                {distanceToKaaba !== null ? `${formatDistance(distanceToKaaba)} to Kaaba` : ""}
              </Text>
            </View>

            {/* Notices */}
            {!compassAvailable && (
              <View style={s.notice}>
                <Text style={s.noticeTxt}>
                  Compass not available on this device. Use the Qibla angle ({Math.round(qiblaDirection || 0)}°) with a physical compass.
                </Text>
              </View>
            )}
            {compassAvailable && !hasReceivedHeading && (
              <View style={s.notice}>
                <Text style={s.noticeTxt}>
                  Move your device in a figure-8 pattern to calibrate the compass
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerTxt}>
          Point your device towards the golden arrow to face Qibla
        </Text>
      </View>
    </WallpaperBackground>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backTxt: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
  title: { color: "#fff", fontSize: 18, fontWeight: "600" },

  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  centered: { alignItems: "center" },
  loadingTxt: { color: "rgba(255,255,255,0.6)", marginTop: 16, fontSize: 14 },

  compassWrap: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: COMPASS_SIZE / 2,
    backgroundColor: "#D4AF37",
  },
  outerRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 2,
    borderColor: "rgba(212,175,55,0.2)",
  },
  outerDot: {
    position: "absolute", width: 8, height: 8, borderRadius: 4,
    backgroundColor: "rgba(212,175,55,0.4)",
  },
  topInd: { position: "absolute", top: -14, alignSelf: "center", zIndex: 10 },
  topTri: {
    width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 16,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderTopColor: "#D4AF37",
  },
  centerDot: { position: "absolute", alignSelf: "center" },
  centerOuter: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: "rgba(212,175,55,0.4)",
    backgroundColor: "rgba(212,175,55,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  centerInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(212,175,55,0.6)" },

  info: { alignItems: "center", marginBottom: 24 },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: "rgba(212,175,55,0.2)", borderRadius: 20, marginBottom: 12,
  },
  badgeTxt: { color: "#D4AF37", fontSize: 14, fontWeight: "500" },
  deg: { color: "#fff", fontSize: 28, fontWeight: "600", marginBottom: 4 },
  dir: { color: "rgba(255,255,255,0.5)", fontSize: 18, fontWeight: "400" },
  dist: { color: "rgba(255,255,255,0.5)", fontSize: 14 },

  notice: { paddingHorizontal: 32 },
  noticeTxt: { color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center", lineHeight: 18 },

  footer: {
    paddingHorizontal: 16, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)",
  },
  footerTxt: { color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center" },
});
