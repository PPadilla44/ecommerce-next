import Cookies from "js-cookie";
import React, { createContext, useReducer } from "react";
import { ProductType, ShippingAdressType } from "../types";

export type CartItem = ProductType & { quantity: number };


export type CartType = {
    cartItems: CartItem[];
    shippingAddress: ShippingAdressType;
}

export type UserClientInfo = {
    token: string;
    _id: string;
    email: string;
    isAdmin: boolean;
    name: string;
}

export type StateProps = {
    darkMode: boolean;
    cart: CartType;
    userInfo: UserClientInfo | null
}
const initialState: StateProps = {
    darkMode: Cookies.get('darkMode') === 'ON' ? true : false,
    cart: {
        cartItems: Cookies.get('cartItems') ? JSON.parse(Cookies.get('cartItems') as string) : [],
        shippingAddress: Cookies.get('shippingAddress') ? JSON.parse(Cookies.get('shippingAddress') as string) : {},
    },
    userInfo: Cookies.get('userInfo') ? JSON.parse(Cookies.get('userInfo') as string) : null,
};

export const Store = createContext<{ state: StateProps, dispatch?: React.Dispatch<Action> }>({ state: initialState });

export declare type StoreActionKind =
    'DARK_MODE_ON'
    | 'DARK_MODE_OFF'
    | 'CART_ADD_ITEM'
    | 'CART_REMOVE_ITEM'
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    | 'SAVE_SHIPPING_ADDRESS'
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
        case 'CART_REMOVE_ITEM': {
            const cartItems = state.cart.cartItems.filter(item => item._id !== action.payload._id);
            Cookies.set('cartItems', JSON.stringify(cartItems))
            return { ...state, cart: { ...state.cart, cartItems } }
        }
        case 'SAVE_SHIPPING_ADDRESS':
            return { ...state, cart: { ...state.cart, shippingAddress: action.payload } }
        case 'USER_LOGIN':
            return { ...state, userInfo: action.payload }
        case 'USER_LOGOUT':
            return { ...state, userInfo: null, cart: { cartItems: [], shippingAddress: {} } }
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