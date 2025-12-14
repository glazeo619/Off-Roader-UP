// App.tsx
import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";

// IMPORTANT: keep splash visible until we decide to hide it
SplashScreen.preventAutoHideAsync().catch(() => {});

function Fallback({ message }: { message: string }) {
  return (
    <View style={styles.fallback}>
      <Text style={styles.title}>Off Roader Up</Text>
      <Text style={styles.msg}>{message}</Text>
    </View>
  );
}

export default function App() {
  const [ready, setReady] = React.useState(false);
  const [fatal, setFatal] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    // HARD FAILSAFE: even if something goes wrong, hide splash after 2.5s
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 2500);

    (async () => {
      try {
        // If you have startup work (fonts, auth init, config), do it here.
        // Keep it minimal for now.
      } catch (e: any) {
        if (!cancelled) setFatal(e?.message || "Startup error");
      } finally {
        if (!cancelled) {
          setReady(true);
          // normal hide path
          SplashScreen.hideAsync().catch(() => {});
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (fatal) return <Fallback message={fatal} />;

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={styles.msg}>Starting…</Text>
      </View>
    );
  }

  // TODO: Replace this with your real navigation/app root
  return (
    <View style={styles.app}>
      <Text style={styles.title}>App Loaded</Text>
      <Text style={styles.msg}>If you see this, the orange splash issue is fixed.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  fallback: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  app: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  msg: { fontSize: 14, opacity: 0.7, textAlign: "center" },
});
