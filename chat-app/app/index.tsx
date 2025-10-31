import { StatusBar, StyleSheet, View } from "react-native";
import React from "react";
import { colors } from "@/constants/theme";
import Animated, { FadeIn } from "react-native-reanimated";

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral900} />

      <Animated.Image
        source={require("../assets/images/splashImage.png")}
        entering={FadeIn.duration(700).springify()}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral900,
  },
  logo: {
    height: "27%",
    aspectRatio: 1,
  },
});
