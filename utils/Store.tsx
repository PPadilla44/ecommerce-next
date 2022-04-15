import Cookies from "js-cookie";
import React, { createContext, useReducer } from "react";
import { ProductType } from "../types";


export type CartType = {
    cartItems: (ProductType & { quantity: number })[]
}

export type StateProps = {
    darkMode: boolean;
    cart: CartType
}
const initialState: StateProps = {
    darkMode: Cookies.get('darkMode') === 'ON' ? true : false,
    cart: {
        cartItems: Cookies.get('cartItems') ? JSON.parse(Cookies.get('cartItems') as string) : []
    }
};

export const Store = createContext<{ state: StateProps, dispatch?: React.Dispatch<Action> }>({ state: initialState });

export declare type StoreActionKind =
    'DARK_MODE_ON'
    | 'DARK_MODE_OFF'
    | 'CART_ADD_ITEM'
    ;

export interface Action {
    type: StoreActionKind;
    payload?: any;
}

function reducer(state: StateProps, action: Action): StateProps {
    switch (action.type) {
        case 'DARK_MODE_ON':
            return { ...state, darkMode: true }
        case 'DARK_MODE_OFF':
            return { ...state, darkMode: false }
        case 'CART_ADD_ITEM': {
            const newItem = action.payload;
            const existItem = state.cart.cartItems.find(item => item._id === newItem._id);
            const cartItems = existItem
                ?
                state.cart.cartItems.map((item) => item.name === existItem.name ? newItem : item)
                :
                [...state.cart.cartItems, newItem];
            Cookies.set('cartItems', JSON.stringify(cartItems))
            return { ...state, cart: { ...state.cart, cartItems } }
        }
        default:
            return state
    }
}

type Props = {
    children: React.ReactNode;
};

export const StoreProvider = ({ children }: Props) => {

    const [state, dispatch] = useReducer(reducer, initialState);

    const value = { state, dispatch };

    return (
        <Store.Provider value={value} >
            {children}
        </Store.Provider>
    )
}