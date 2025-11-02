import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { BackButtonProps } from "@/types";
import { colors, radius, spacingX } from "@/constants/theme";
import { useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";

const BackButton = ({
  style,
  color = colors.white,
  iconSize = 26,
}: BackButtonProps) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={() => router.back()}
    >
      <CaretLeft size={verticalScale(iconSize)} color={color} weight="bold" />
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    // padding: spacingX._10,
    // borderRadius: radius._50,
    // backgroundColor: colors.white,
  },
});
