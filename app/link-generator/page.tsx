'use client'

import { useCallback, useState } from 'react'
import { auth } from '../firebase/firebase'
import {
  Box,
  Container,
  Center,
  FormErrorMessage,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  useToast,
} from '@chakra-ui/react'
import { useAuthState } from 'react-firebase-hooks/auth'

export default function LinkGenerator() {
  const [loading, setLoading] = useState(false)
  const [user, error] = useAuthState(auth)

  const handleCreate = () => {
    setLoading(true)
    // alert("create");
  }
  return (
    <Center h="90vh">
      <Container textAlign="center">
          <Box>
            <Heading mb="10">Welcome, <span style={{color:"#2F855A"}}>{user?.email}</span></Heading>
          </Box>
          <Box>
            <form onSubmit={handleCreate}>
              <Button mb="10" type="submit" isDisabled={loading}>
                  Create
              </Button>
            </form>
          </Box>
      </Container>
    </Center>
  )
}