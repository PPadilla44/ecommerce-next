import Cookies from "js-cookie";
import React, { createContext, useReducer } from "react";

export type StateProps = {
    darkMode: boolean;
}
const initialState: StateProps = {
    darkMode: Cookies.get('darkMode') === 'ON' ? true : false
};

export const Store = createContext<{ state: StateProps, dispatch?: React.Dispatch<Action> }>({ state: initialState });

export declare type StoreActionKind = 
'DARK_MODE_ON'
| 'DARK_MODE_OFF'
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