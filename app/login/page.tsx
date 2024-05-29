'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useCallback, useState } from 'react'
import { auth } from '../firebase/firebase'
import { useRouter } from 'next/navigation'
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

interface SignInFormData {
    email: string
    password: string
}

const schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().min(6).max(32).required(),
})

export default function Login() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const toast = useToast()

    const handleSignIn = (formData: SignInFormData) => {
        const { email, password } = formData
        signIn(email, password)
    }

    const navigateToLinkGenerator = useCallback(() => {
        router.push('/todo')
    }, [router])

    const signIn = (email: string, password: string) => {
        setLoading(true)
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
              navigateToLinkGenerator()
                toast({
                    title: 'Success!',
                    description: 'Signed in',
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                })
            })
            .catch((error: any) => {
              if (error.code == 'auth/invalid-credential') {
                toast({
                    title: 'Error!',
                    description: 'The email and/or password is invalid',
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
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
    })

    return (
      <Center h="90vh">
        <Container textAlign="center">
            <Box>
              <Heading mb="10">Log in to your<br/>Link Generator account</Heading>
              <form onSubmit={handleSubmit(handleSignIn)}>
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
                  <Button mb="10" type="submit" isDisabled={loading}>
                      Sign In
                  </Button>
              </form>
              <Link href="/signup">or Sign up for an account</Link>
            </Box>
        </Container>
      </Center>
    )
}
