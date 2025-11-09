import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors } from '@/constants/theme'
import { useLocalSearchParams } from 'expo-router'

const Conversation = () => {
  const data = useLocalSearchParams();
  return (
    <ScreenWrapper>
      <Typo color={colors.white}>Conversation {JSON.stringify(data, null, 2)}</Typo>
    </ScreenWrapper>
  )
}

export default Conversation

const styles = StyleSheet.create({})