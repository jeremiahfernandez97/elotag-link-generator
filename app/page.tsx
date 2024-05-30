'use client'

import { useRouter } from 'next/navigation'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from './firebase/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function Home() {
    const router = useRouter()
    const [user] = useAuthState(auth)

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            router.push('/login')
        } else {
            router.push('/link-generator')
        }
    })
}
