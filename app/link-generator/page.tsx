'use client'

import React, { useCallback, useState } from 'react'
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
} from '@chakra-ui/react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { collection, addDoc } from 'firebase/firestore'
import ConfirmationModal from '../components/confirmation-modal'
import { useDisclosure } from '@chakra-ui/react'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { CopyIcon, CheckIcon } from '@chakra-ui/icons'

export default function LinkGenerator() {
    const [loading, setLoading] = useState(false)
    const [generatedUID, setGeneratedUID] = useState('')
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

    const handleCreate = (e: any) => {
        e.preventDefault()
        setLoading(true)
        addDoc(collection(db, 'ids'), {
            business: business,
            isActive: false,
            createdTime: Date.now(),
            createdBy: user?.email
        })
            .then((ref) => {
                setGeneratedUID(ref.id)
                setValue(ref.id)
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

    return (
        <>
            <Center h="90vh">
                <Container textAlign="center">
                    <Box>
                        <Heading mb="3">
                            Welcome,{' '}
                            <span style={{ color: '#2F855A' }}>
                                {user?.email}
                            </span>
                        </Heading>
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
                    <form onSubmit={handleCreate}>
                        <Box>
                        </Box>
                        <Box>
                            <Flex mb={3}>
                                <Box
                                    style={{ whiteSpace: 'nowrap', margin: 'auto' }}
                                >
                                    Business:
                                </Box>
                                <Input required
                                    mx={2}
                                    onChange={handleBusiness}
                                    placeholder="Enter business name"
                                ></Input>
                                <Button type="submit" isDisabled={loading}>
                                    Create
                                </Button>
                            </Flex>
                        </Box>
                        <Box>
                            <Flex>
                                <Box
                                    style={{ whiteSpace: 'nowrap', margin: 'auto' }}
                                >
                                    Generated UID:
                                </Box>
                                <Input
                                    mx={2}
                                    isDisabled={true}
                                    value={value}
                                ></Input>
                                <Button onClick={onCopy}>
                                    {hasCopied ? <CheckIcon /> : <CopyIcon />}
                                </Button>
                            </Flex>
                        </Box>
                    </form>
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
