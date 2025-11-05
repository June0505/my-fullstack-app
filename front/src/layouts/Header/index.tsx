import React, {ChangeEvent, KeyboardEvent, useEffect, useRef, useState} from 'react'
import './style.css';
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {
    AUTH_PATH,
    BOARD_DETAIL_PATH,
    BOARD_PATH,
    BOARD_UPDATE_PATH,
    BOARD_WRITE_PATH,
    MAIN_PATH,
    SEARCH_PATH,
    USER_PATH
} from "../../constants";
import {useCookies} from "react-cookie";
import {useBoardStore, useLoginUserStore} from "../../stores";
import {PostBoardResponseDto} from "../../apis/response/board";
import {ResponseDto} from "../../apis/response";

// component: Header Layout コンポーネント
export default function Header() {

    // state: ログインユーザー状態
    const { loginUser, setLoginUser, resetLoginUser } = useLoginUserStore();

    // state: pathの状態
    const { pathname } = useLocation();

    // state: cookieの状態
    const [cookie, setCookie] = useCookies();

    // state: ログインの状態
    const [isLogin, setLogin] = useState<Boolean>(false);

    const isAuthPage = pathname.startsWith(AUTH_PATH());
    const isMainPage = pathname === MAIN_PATH();
    const isSearchPage = pathname.startsWith(SEARCH_PATH(''));
    const isBoardDetailPage = pathname.startsWith(BOARD_PATH() + '/' + BOARD_DETAIL_PATH(''));
    const isBoardWritePage = pathname.startsWith(BOARD_PATH() + '/' + BOARD_WRITE_PATH());
    const isBoardUpdatePage = pathname.startsWith(BOARD_PATH() + '/' + BOARD_UPDATE_PATH(''));
    const isUserPage = pathname.startsWith(USER_PATH(''));

    // function: ナビゲート関数
    const navigate = useNavigate();

    // event handler: ロゴクリックイベント処理関数
    const onClickLogoHandler = () => {
        navigate(MAIN_PATH());
    };

    const SearchButton = () => {

        const searchButtonRef = useRef<HTMLDivElement | null>(null);
        const [word, setWord] = useState<string>('');
        const { searchWord } = useParams();

        const onSearchWordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setWord(value);
        };

        const onSearchWordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== 'Enter') return;
            if (!searchButtonRef.current) return;
            if (!word.trim()) return;

            searchButtonRef.current.click();
        };

        const onClickSearchIconHandler = () => {
            if (!word.trim()) return;

            navigate(SEARCH_PATH(word.trim()));
        };

        useEffect(() => {
            if (searchWord) setWord(searchWord);
        }, [searchWord]);

        return (
            <div className='header-search-input-box'>
                <input
                    className='header-search-input'
                    type='text'
                    placeholder='検索'
                    value={word}
                    onChange={onSearchWordChangeHandler}
                    onKeyDown={onSearchWordKeyDownHandler}
                />
                <div ref={searchButtonRef} className='icon-button' onClick={onClickSearchIconHandler}>
                    <div className='icon search-light-icon'></div>
                </div>
            </div>
        );
    };

    // component: マイページボタンコンポーネント
    const MyPageButton = () => {

        // state: ユーザーメールのpath変数の状態
        const { userEmail } = useParams();

        // event handler: マイページボタンクリックイベント処理関数
        const onClickMyPageButtonHandler = () => {
            if (!loginUser) return;
            const { email } = loginUser;
            navigate(USER_PATH(email));
        }

        // event handler: ログアウトボタンクリックイベント処理関数
        const onClickSignOutButtonHandler = () => {
            resetLoginUser();
            setCookie('accessToken', '', { path: MAIN_PATH(), expires: new Date(0) });
            navigate(MAIN_PATH());
        }

        // event handler: ログインボタンクリックイベント処理関数
        const onClickSignInButtonHandler = () => {
            navigate(AUTH_PATH());
        }

        if (isLogin && userEmail === loginUser?.email)
            // render: ログアウトボタンコンポーネントのレンダリング
            return <div className='black-button' onClick={onClickSignOutButtonHandler}>{'ログアウト'}</div>

        if (isLogin)
            // render: マイページボタンコンポーネントのレンダリング
            return <div className='black-button' onClick={onClickMyPageButtonHandler}>{'マイページ'}</div>

            // render: ログインボタンコンポーネントのレンダリング
            return <div className='black-button' onClick={onClickSignInButtonHandler}>{'ログイン'}</div>
    }

    // component: アップロードボタンコンポーネント
    const UploadButton = () => {

        // state: 投稿番号path変数の状態
        const { boardNumber } = useParams();

        // state: 投稿物の状態
        const { title, content, boardImageFileList, resetBoard } = useBoardStore();

        // function: post board response 処理関数
        const postBoardResponse = (responseBody: PostBoardResponseDto | ResponseDto | null) => {
            if (!responseBody) return;
            const { code } = responseBody;

            if (code === 'AF' || code === 'NU')
                navigate(AUTH_PATH());

            if (code === 'VF')
                alert('タイトルと内容は必須です。');

            if (code === 'DBE')
                alert('データベースエラーです。');

            if (code !== 'SU')
                return;

            resetBoard();
            if (!loginUser) return;
            const { email } = loginUser;
            navigate(USER_PATH(email));
        }

        // function: patch board response 処理関数
        const patchBoardResponse = (responseBody: ResponseDto | null) => {
            if (!responseBody) return;
            const { code } = responseBody;

            if (code === 'AF' || code === 'NU' || code === 'NB' || code === 'NP')
                navigate(AUTH_PATH());

            if (code === 'VF')
                alert('タイトルと内容は必須です。');

            if (code === 'DBE')
                alert('データベースエラーです。');

            if (code !== 'SU')
                return;

            if (!boardNumber)
                return;

            navigate(BOARD_PATH() + '/' + BOARD_DETAIL_PATH(boardNumber));
        }

    }

    // effect: パスが変更されるたびに実行される関数
    useEffect(() => {}, [pathname]);

    // effect: ログインユーザーの状態が変更されるたびに実行される関数
    useEffect(() => {
        setLogin(loginUser !== null);
    }, [loginUser]);

    // render: Header Layout コンポーネントのレンダリング
    return (
        <div id='header'>
            <div className='header-container'>
                <div className='header-left-box' onClick={onClickLogoHandler}>
                    <div className='icon-box'>
                        <div className='icon logo-dark-icon'></div>
                    </div>
                    <div className='header-logo'>{'Open Blog'}</div>
                </div>
                <div className='header-right-box'>
                    {(isAuthPage || isMainPage || isSearchPage || isBoardDetailPage) && <SearchButton />}
                    {(isMainPage || isSearchPage || isBoardDetailPage || isUserPage) && <MyPageButton />}
                </div>
            </div>
        </div>
    )
}