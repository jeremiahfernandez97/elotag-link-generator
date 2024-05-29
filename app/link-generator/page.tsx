'use client'

import React, { useCallback, useState } from 'react'
import { auth, db } from '../firebase/firebase'
import {
  Box,
  Container,
  Center,
  Button,
  Heading,
  useToast,
} from '@chakra-ui/react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { collection, addDoc } from 'firebase/firestore'
import ConfirmationModal from '../components/confirmation-modal'
import { useDisclosure } from '@chakra-ui/react'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'

export default function LinkGenerator() {
  const [loading, setLoading] = useState(false)
  const [generatedUID, setGeneratedUID] = useState("")
  const [user, error] = useAuthState(auth)
  const toast = useToast()
  const router = useRouter();
  const [signoutMessage, setSignoutMessage] = useState('Are you sure you want to sign out of ' + user?.email + '?')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef()

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

  const handleSignOut = useCallback(async () => {
    try {
        await auth.signOut()
        toast({
            title: 'Success!',
            description: 'Signed out',
            status: 'success',
            duration: 9000,
            isClosable: true,
        })
    } catch (e) {
      toast({
          title: 'Internal Error',
          description: e + "",
          status: 'error',
          duration: 9000,
          isClosable: true,
      })
    }
  }, [toast, auth])

  onAuthStateChanged(auth, (user) => {
    if (!user) {
        router.push('/login')
    }
  })

  return (
    <>
      <Center h="90vh">
        <Container textAlign="center">
            <Box>
              <Heading mb="3">Welcome, <span style={{color:"#2F855A"}}>{user?.email}</span></Heading>
            </Box>
                  <Button
                      mb="10"
                      variant="link"
                      onClick={() => {
                          onOpen()
                      }}
                  >
                      Sign out
                  </Button>
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

      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        cancelRef={cancelRef}
        onConfirm={() => handleSignOut()}
        action="Sign out"
        message={signoutMessage}
      />
    </>
  )
}