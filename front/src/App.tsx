import './App.css';
import {Route, Routes} from "react-router-dom";
import {CookiesProvider, useCookies} from 'react-cookie';
import Main from "./views/main";
import Authentication from "./views/authentication";
import Search from "./views/search";
import UserPage from "./views/user";
import BoardDetail from "./views/board/detail";
import BoardWrite from "./views/board/write";
import BoardUpdate from "./views/board/update";
import Container from "./layouts/container";
import {
    AUTH_PATH,
    BOARD_DETAIL_PATH,
    BOARD_PATH,
    BOARD_UPDATE_PATH,
    BOARD_WRITE_PATH,
    MAIN_PATH,
    SEARCH_PATH,
    USER_PATH
} from "./constants";
import {useEffect, useState} from "react";
import {useLoginUserStore} from "./stores";
import {getSignInUserRequest} from "./apis";
import {GetSignInUserResponseDto} from "./apis/response/user";
import {ResponseDto} from "./apis/response";
import {User} from "./types/interface";

// component: Applicationコンポーネント
function App() {

    // state: ログインユーザーのグローバル状態
    const { setLoginUser, resetLoginUser } = useLoginUserStore();

    // state: cookieの状態
    const [cookie, setCookie] = useCookies();

    // function: サインインユーザー取得レスポンス処理関数
    const getSignInUserResponse = (responseBody: GetSignInUserResponseDto | ResponseDto | null) => {
        if (!responseBody)
            return;

        const { code } = responseBody;
        if (code === 'AF' || code === 'NU' || code === 'DBE') {
            resetLoginUser();
            return;
        }

        const loginUser: User = { ...(responseBody as GetSignInUserResponseDto) };
        setLoginUser(loginUser);
    }

    // effect: accessToken クッキー値が変更されるたびに実行される関数
    useEffect(() => {
        if (!cookie.accessToken) {
            resetLoginUser();
            return;
        }
        getSignInUserRequest(cookie.accessToken).then(getSignInUserResponse);
    }, [cookie.accessToken])

    return (
        <CookiesProvider>
            <Routes>
                <Route element={<Container/>}>
                    <Route path={MAIN_PATH()} element={<Main/>}/>
                    <Route path={AUTH_PATH()} element={<Authentication/>}/>
                    <Route path={SEARCH_PATH(':searchWord')} element={<Search/>}/>
                    <Route path={USER_PATH(':userEmail')} element={<UserPage/>}/>
                    <Route path={BOARD_PATH()}>
                        <Route path={BOARD_WRITE_PATH()} element={<BoardWrite/>}/>
                        <Route path={BOARD_DETAIL_PATH(':boardNumber')} element={<BoardDetail/>}/>
                        <Route path={BOARD_UPDATE_PATH(':boardNumber')} element={<BoardUpdate/>}/>
                    </Route>
                    <Route path='*' element={<h1>404 Not Found</h1>} />
                </Route>
            </Routes>
        </CookiesProvider>
    );
}

export default App;