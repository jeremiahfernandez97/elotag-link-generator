'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { auth, db } from '../firebase/firebase'
import {
  Flex,
  Input,
  Box,
  Container,
  Center,
  Button,
  Heading,
  useToast,
  useClipboard,
  Spinner,
  Divider,
  Text,
} from '@chakra-ui/react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { collection, addDoc } from 'firebase/firestore'
import ConfirmationModal from '../components/confirmation-modal'
import { useDisclosure } from '@chakra-ui/react'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { CopyIcon, CheckIcon } from '@chakra-ui/icons'
import QRCode from 'qrcode'

export default function LinkGenerator() {
  const [loading, setLoading] = useState(false)
  //   const [generatedUID, setGeneratedUID] = useState('')
  const [business, setBusiness] = useState('')
  const [user, error] = useAuthState(auth)
  const toast = useToast()
  const router = useRouter()
  const [signoutMessage, setSignoutMessage] = useState(
    'Are you sure you want to sign out of ' + user?.email + '?'
  )
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef()
  const { onCopy, value, setValue, hasCopied } = useClipboard('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = (e: any) => {
    e.preventDefault()
    setLoading(true)
    addDoc(collection(db, 'ids'), {
      business: business,
      isActive: false,
      createdTime: Date.now(),
      createdBy: user?.email,
    })
      .then((ref) => {
        // setGeneratedUID(ref.id)
        setValue(`https://kblink.ph/${ref.id}`)
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
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleBusiness = (e: React.FormEvent<HTMLInputElement>) => {
    setBusiness(e.currentTarget.value)
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
        description: e + '',
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }
  }, [toast])

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.push('/login')
    }
  })

  const generateQRCode = useCallback(async () => {
    try {
      const url = await QRCode.toDataURL(value)
      setImageUrl(url)
    } catch (err) {
      console.error(err)
    }
  }, [value])

  useEffect(() => {
    if (value) {
      setIsLoading(true)
      generateQRCode().finally(() => {
        setIsLoading(false)
      })
    }
  }, [value, generateQRCode])

  return (
    <>
      <Center h="90vh">
        <Container>
          <Box mb={4} textAlign="center">
            <Heading>Welcome, Admin </Heading>
            <p>
              <span style={{ color: '#2F855A', fontSize: '1rem' }}>
                {user?.email}
              </span>
            </p>
          </Box>
          <Flex direction="column" alignItems="center">
            <Button
              mb="10"
              variant="link"
              onClick={() => {
                onOpen()
              }}
            >
              Sign out
            </Button>
          </Flex>

          <form onSubmit={handleCreate}>
            <Box></Box>
            <Box>
              <Flex mb={3} gap={2}>
                <Input
                  required
                  onChange={handleBusiness}
                  placeholder="Enter business name"
                ></Input>
                <Button
                  type="submit"
                  isDisabled={loading}
                  colorScheme="blue"
                  px={6}
                >
                  Generate Link
                </Button>
              </Flex>
            </Box>
            {value && (
              <>
                <Divider my={6} />
                <Text fontSize="medium" mb={2}>
                  Generated Link:
                </Text>
                <Box>
                  <Flex gap={2}>
                    {/* <Box
                  style={{ whiteSpace: 'nowrap', margin: 'auto' }}
                  textColor="GrayText"
                >
                  Generated UID:
                </Box> */}
                    <Input isDisabled={true} value={value}></Input>
                    <Button onClick={onCopy}>
                      {hasCopied ? <CheckIcon /> : <CopyIcon />}
                    </Button>
                  </Flex>
                </Box>
              </>
            )}
          </form>
          {isLoading ? (
            <Flex justifyContent="center">
              <Spinner my={4} />
            </Flex>
          ) : (
            <Flex
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
              gap={4}
              my={4}
            >
              {imageUrl && (
                <>
                  <div>
                    <img
                      src={imageUrl}
                      alt="QR code"
                      style={{ height: '200px' }}
                    />
                  </div>
                  <Flex direction="column" alignItems="center">
                    <Box flex={1}>
                      <Button
                        className="w-full"
                        as="a"
                        download={`${value}.png`}
                        href={imageUrl}
                        colorScheme="blackAlpha"
                      >
                        Download QR Code
                      </Button>
                    </Box>
                  </Flex>
                </>
              )}
            </Flex>
          )}
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
