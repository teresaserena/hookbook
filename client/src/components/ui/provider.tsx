"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import React from 'react'

export function Provider(props: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      {props.children}
    </ChakraProvider>
  )
}
