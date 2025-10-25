import { colors, spacingX, spacingY } from "@/constants/theme";
import ScreenWrapper from "@/controllers/ScreenWrapper";
import Typo from "@/controllers/Typo";
import { verticalScale } from "@/utils/styling";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "@/controllers/Button";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";

const Welcome = () => {
  const router = useRouter();
  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <View style={styles.container}>
        <View style={{ alignItems: "center" }}>
          <Typo size={43} fontWeight="900" color={colors.white}>
            AmiChat
          </Typo>
        </View>

        <Animated.Image
          entering={FadeIn.damping(700).springify()}
          source={require("../../assets/images/welcome.png")}
          style={styles.welcomeImage}
          resizeMode="contain"
        />

        <View>
          <Typo size={33} fontWeight="800" color={colors.white}>
            Stay Connected
          </Typo>
          <Typo size={24} fontWeight="600" color={colors.white}>
            With Your Friends
          </Typo>
          <Typo size={24} fontWeight="600" color={colors.white}>
            And Family
          </Typo>
        </View>

        <Button style={{ backgroundColor: colors.white }} onPress={() => router.push("/(auth)/register")}>
          <Typo size={23} fontWeight={"bold"}>
            Get Started
          </Typo>
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    paddingHorizontal: spacingX._20,
    marginVertical: spacingY._10,
  },
  background: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
  welcomeImage: {
    height: verticalScale(300),
    aspectRatio: 1,
    alignSelf: "center",
  },
});
