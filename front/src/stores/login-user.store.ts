import {User} from "../types/interface";
import {create} from "zustand/react";

interface LoginUserStore {
    loginUser: User | null;
    setLoginUser: (loginUser: User | null) => void;
    resetLoginUser: () => void;
}

const useLoginUserStore = create<LoginUserStore>(set => ({
        loginUser: null,
        setLoginUser: (loginUser) => set(state => ({...state, loginUser})),
        resetLoginUser: () => set(state => ({...state, loginUser: null}))
    })
);

export default useLoginUserStore;