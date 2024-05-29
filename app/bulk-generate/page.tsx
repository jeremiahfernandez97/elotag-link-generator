'use client'

import React, { useCallback, useState } from 'react'
import { auth, db, firebaseConfig } from '../firebase/firebase'
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Flex,
    Input,
    Box,
    Container,
    Center,
    Button,
    Heading,
    useToast,
    useClipboard,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from '@chakra-ui/react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { collection, addDoc, writeBatch, doc, query, where, getDocs } from 'firebase/firestore'
import ConfirmationModal from '../components/confirmation-modal'
import { useDisclosure } from '@chakra-ui/react'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { CopyIcon, CheckIcon } from '@chakra-ui/icons'

type Link = {
    isActive: boolean;
    batchTimestamp: number;
}

type UID = {
    uid: string;
}

export default function LinkGenerator() {
    const firebase = require("firebase/compat/app");
    require("firebase/compat/firestore");
    const [loading, setLoading] = useState(false)
    const [queriedIds, setQueriedIds] = useState<UID[]>([])
    const [user, error] = useAuthState(auth)
    const toast = useToast()
    const router = useRouter()
    const [signoutMessage, setSignoutMessage] = useState(
        'Are you sure you want to sign out of ' + user?.email + '?'
    )
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()
    const { onCopy, value, setValue, hasCopied } = useClipboard('')
    const [bulkQuantity, setBulkQuantity] = useState(1);

    // for batch add
    firebase.initializeApp(firebaseConfig);
    const db_fs = firebase.firestore();

    const handleGenerate = (e: any) => {
        e.preventDefault()
        setLoading(true)

        const idsRef = db_fs.collection("ids");

        const idsArray: Array<Link> = [];

        const batchTimestamp = Date.now();

        for (let i = 0; i < bulkQuantity; i++) {
            idsArray.push( {
                isActive: false,
                batchTimestamp: batchTimestamp
            })
        }

        const batch = firebase.firestore().batch();

        idsArray.forEach((item: Link) => {
            const docRef = idsRef.doc()
            batch.set(docRef, item)
        });

        batch
        .commit()
        .then(() => {

            const getQueriedIds = async () => {
                const q = query(
                    collection(db, 'ids'),
                    where('batchTimestamp', '==',  batchTimestamp)
                )
                const querySnapshot = await getDocs(q)
                let queryResultIds: UID[] = []
                querySnapshot.forEach((doc) => {
                    queryResultIds.push({
                        uid: doc.id
                    })
                })
                setQueriedIds(queryResultIds)
            }
            getQueriedIds()
            
            toast({
                title: 'Success!',
                description: 'Batch ' + batchTimestamp + ' with ' + bulkQuantity + ' links generated',
                status: 'success',
                duration: 9000,
                isClosable: true,
            })
        })
        .catch((error: any) => {
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
            console.log(queriedIds);
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

    const handleBulkChange = (valueString: string) => setBulkQuantity(parseFloat(valueString))

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
                    <Box>
                        <form onSubmit={handleGenerate}>
                            <Flex>
                                <Box>
                                    <NumberInput value={bulkQuantity} onChange={handleBulkChange} min={1} max={100}>
                                    <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </Box>
                                <Button mb="10" type="submit" isDisabled={loading}>
                                    Generate
                                </Button>
                            </Flex>
                        </form>
                    </Box>
                    <Box>
                        <Table variant="simple">
                        <Tbody>
                        </Tbody>
                        </Table>
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
