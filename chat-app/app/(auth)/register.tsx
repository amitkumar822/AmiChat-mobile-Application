import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import BackButton from "@/components/BackButton";
import Input from "@/components/Input";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";

const RegisterScreen = () => {
  const router = useRouter();

  const nameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const confirmPasswordRef = useRef("");

  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuth();

  const handleSubmit = async () => {
    if (
      nameRef.current === "" ||
      emailRef.current === "" ||
      passwordRef.current === "" ||
      confirmPasswordRef.current === ""
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (passwordRef.current !== confirmPasswordRef.current) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await signUp(emailRef.current, passwordRef.current, nameRef.current);
    } catch (error) {
      console.error("Error signing up:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScreenWrapper showPattern={true}>
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton iconSize={28} />

            <Typo size={17} color={colors.white}>
              Need some help?
            </Typo>
          </View>

          <View style={styles.content}>
            <ScrollView
              contentContainerStyle={styles.form}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ gap: spacingY._10, marginTop: spacingY._15 }}>
                <Typo size={28} fontWeight="600">
                  Getting Started
                </Typo>
                <Typo color={colors.neutral600}>
                  Create an account to get all features
                </Typo>
              </View>

              <Input
                icon={
                  <Icons.User
                    size={verticalScale(20)}
                    color={colors.neutral600}
                  />
                }
                placeholder="Enter your name"
                onChangeText={(value: string) => (nameRef.current = value)}
              />
              <Input
                icon={
                  <Icons.Envelope
                    size={verticalScale(20)}
                    color={colors.neutral600}
                  />
                }
                placeholder="Enter your email"
                onChangeText={(value: string) => (emailRef.current = value)}
              />
              <Input
                icon={
                  <Icons.LockKey
                    size={verticalScale(20)}
                    color={colors.neutral600}
                  />
                }
                secureTextEntry={true}
                placeholder="Enter your password"
                onChangeText={(value: string) => (passwordRef.current = value)}
              />
              <Input
                icon={
                  <Icons.LockKey
                    size={verticalScale(20)}
                    color={colors.neutral600}
                  />
                }
                secureTextEntry={true}
                placeholder="Confirm your password"
                onChangeText={(value: string) =>
                  (confirmPasswordRef.current = value)
                }
              />

              <View style={{ marginTop: spacingY._25, gap: spacingY._15 }}>
                <Button loading={isLoading} onPress={handleSubmit}>
                  <Typo size={20} fontWeight={"bold"}>
                    Sign Up
                  </Typo>
                </Button>

                <View style={styles.footer}>
                  <Typo size={16} color={colors.neutral600}>
                    Already have an account?
                  </Typo>
                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/login")}
                  >
                    <Typo size={16} color={colors.primaryDark}>
                      Login
                    </Typo>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
  },
  form: {
    gap: spacingY._15,
    marginTop: spacingY._20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
});
