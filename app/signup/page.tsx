'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth'
import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '../firebase/firebase'
import { collection, addDoc } from 'firebase/firestore'
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
import { Link } from '@chakra-ui/next-js'

interface SignUpFormData {
    email: string
    password: string
}

const schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().min(6).max(32).required(),
})

export default function SignUp() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const toast = useToast()

    const handleSignUp = (formData: SignUpFormData) => {
        const { email, password } = formData
        signUp(email, password)
    }

    const addToUsersDb = (email: string, uid: string) => {
        addDoc(collection(db, 'users'), {
            email: email,
            uid: uid,
        })
            .then(() => {
                toast({
                    title: 'Success!',
                    description: email + ' signed up successfully',
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                })
            })
            .catch((error) => {
                toast({
                    title: 'Internal Error (2)',
                    description: '' + error,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                })
            })
    }

    const navigateToLinkGenerator = useCallback(() => {
        router.push('/link-generator')
    }, [router])

    const signUp = (email: string, password: string) => {
        setLoading(true)
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                addToUsersDb(email, userCredential.user.uid)

                signInWithEmailAndPassword(auth, email, password)
                    .then(() => {
                        navigateToLinkGenerator()
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
            })
            .catch((error) => {
                if (error.code == 'auth/invalid-email') {
                    toast({
                        title: 'Error!',
                        description: 'This email address is invalid',
                        status: 'error',
                        duration: 9000,
                        isClosable: true,
                    })
                } else if (error.code == 'auth/email-already-in-use') {
                    toast({
                        title: 'Error!',
                        description: 'This email address is already in use',
                        status: 'error',
                        duration: 9000,
                        isClosable: true,
                    })
                } else {
                    toast({
                        title: 'Internal Error',
                        description: '' + error,
                        status: 'error',
                        duration: 9000,
                        isClosable: true,
                    })
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    })

    return (
        <Center h="90vh">
            <Container textAlign="center">
                <Box>
                    <Heading color="#2F855A">Elotag Link Generator</Heading>
                    <Heading mb="10">Create your account</Heading>
                    <form onSubmit={handleSubmit(handleSignUp)}>
                        <FormControl
                            isInvalid={errors.email != undefined}
                            mb="10"
                        >
                            <FormLabel>Email:</FormLabel>
                            <Input {...register('email')} type="text" />
                            <FormErrorMessage>
                                {errors.email?.message}
                            </FormErrorMessage>
                        </FormControl>
                        <FormControl
                            isInvalid={errors.password != undefined}
                            mb="10"
                        >
                            <FormLabel>Password:</FormLabel>
                            <Input {...register('password')} type="password" />
                            <FormErrorMessage>
                                {errors.password?.message}
                            </FormErrorMessage>
                        </FormControl>
                        <Button
                            mb="10"
                            color="#2F855A"
                            type="submit"
                            isDisabled={loading}
                        >
                            Sign up for an account
                        </Button>
                    </form>
                    <Link href="/login">or Log in to your account</Link>
                </Box>
            </Container>
        </Center>
    )
}
