'use client'

import { useCallback, useState } from 'react'
import { auth, db } from '../firebase/firebase'
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
import { collection, addDoc } from 'firebase/firestore'

export default function LinkGenerator() {
  const [loading, setLoading] = useState(false)
  const [generatedUID, setGeneratedUID] = useState("")
  const [user, error] = useAuthState(auth)
  const toast = useToast()

  const handleCreate = (e: any) => {
    e.preventDefault()
    setLoading(true)
    addDoc(collection(db, 'ids'), {
      isActive: false
    })
      .then((ref) => {
        setGeneratedUID(ref.id)
        toast({
            title: 'Success!',
            description: 'Link generated successfully',
            status: 'success',
            duration: 9000,
            isClosable: true,
        })
      })
      .catch((error) => {
        toast({
            title: 'Internal Error',
            description: '' + error,
            status: 'error',
            duration: 9000,
            isClosable: true,
        })
      }).finally(() => {
        setLoading(false)
      })
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
          <Box>
            Generated UID: {generatedUID}
          </Box>
      </Container>
    </Center>
  )
}