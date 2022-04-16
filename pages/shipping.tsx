import { useRouter } from 'next/router'
import React, { useContext } from 'react'
import { Store } from '../utils/Store';

const Shipping = () => {

    const router = useRouter();
    const { state: { userInfo } } = useContext(Store);
    if (!userInfo) {
        router.push('/login?redirect=/shipping')
    }

    return (
        <div>shipping</div>
    )
}

export default Shipping