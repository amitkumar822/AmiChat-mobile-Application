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
import ScreenWrapper from "@/controllers/ScreenWrapper";
import Typo from "@/controllers/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import BackButton from "@/controllers/BackButton";
import Input from "@/controllers/Input";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import Button from "@/controllers/Button";
import { useAuth } from "@/contexts/authContext";

const LoginScreen = () => {
  const router = useRouter();

  const emailRef = useRef("");
  const passwordRef = useRef("");

  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const handleSubmit = async () => {
    if (emailRef.current === "" || passwordRef.current === "") {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setIsLoading(true);
    try {
      await signIn(emailRef.current, passwordRef.current);
    } catch (error: any) {
        Alert.alert("Error", error?.message);
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
              Forgot your password?
            </Typo>
          </View>

          <View style={styles.content}>
            <ScrollView
              contentContainerStyle={styles.form}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ gap: spacingY._10, marginTop: spacingY._15 }}>
                <Typo size={28} fontWeight="600">
                  Welcome Back
                </Typo>
                <Typo color={colors.neutral600}>
                  We are happy to see you again!
                </Typo>
              </View>

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

              <View style={{ marginTop: spacingY._25, gap: spacingY._15 }}>
                <Button loading={isLoading} onPress={handleSubmit}>
                  <Typo size={20} fontWeight={"bold"}>
                    Login
                  </Typo>
                </Button>

                <View style={styles.footer}>
                  <Typo size={16} color={colors.neutral600}>
                    Don't have an account?
                  </Typo>
                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/register")}
                  >
                    <Typo size={16} color={colors.primaryDark}>
                      Sign Up
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

export default LoginScreen;

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
