import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'

const Conversation = () => {
  return (
    <ScreenWrapper>
      <Typo size={24} fontWeight="bold">Conversation</Typo>
    </ScreenWrapper>
  )
}

export default Conversation

const styles = StyleSheet.create({})