// app/index.jsx  ← esta é a rota inicial do Expo Router
import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.78)).current;

  useEffect(() => {
    // Aparece com spring suave
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
    // Vai para login depois de 2.6s
    const timer = setTimeout(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start(() => {
      router.replace("/login" as any);
    });
  }, 2600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />

      <Animated.View
        style={[styles.imageWrap, { opacity, transform: [{ scale }] }]}
      >
        <Image
          source={require("../assets/images/demeter.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8d7da",
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrap: {
    width: width * 0.68,
    height: width * 0.68,
    borderRadius: (width * 0.68) / 2,
    overflow: "hidden",
    backgroundColor: "#f8d7da",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});