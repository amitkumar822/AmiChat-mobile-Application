import { StyleSheet } from "react-native";
import React from "react";
import ScreenWrapper from "@/controllers/ScreenWrapper";
import Typo from "@/controllers/Typo";
import { colors } from "@/constants/theme";
import Button from "@/controllers/Button";
import { useAuth } from "@/contexts/authContext";

const Home = () => {
  const { signOut } = useAuth();
  const handleSignOut = async () => {
    await signOut();
  };
  return (
    <ScreenWrapper>
      <Typo size={24} fontWeight="bold" color={colors.white}>
        Home
      </Typo>

      <Button onPress={handleSignOut}>
        <Typo size={24} fontWeight="bold" color={colors.white}>
          Sign Out
        </Typo>
      </Button>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({});
