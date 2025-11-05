import React, {ChangeEvent, useEffect, useRef, useState} from 'react'
import './style.css';
import defaultProfileImage from 'assets/images/default-profile-image.png';
import {useNavigate, useParams} from "react-router-dom";
import {BoardListItem} from "../../types/interface";
import BoardItem from "../../components/BoardItem";
import {BOARD_PATH, BOARD_WRITE_PATH, MAIN_PATH, USER_PATH} from "../../constants";
import {useLoginUserStore} from "../../stores";
import {
    fileUploadRequest,
    getUserBoardListRequest,
    getUserRequest,
    patchNicknameRequest,
    patchProfileImageRequest
} from "../../apis";
import {GetUserResponseDto, PatchNicknameResponseDto, PatchProfileImageResponseDto} from "../../apis/response/user";
import {ResponseDto} from "../../apis/response";
import {PatchNicknameRequestDto, PatchProfileImageRequestDto} from "../../apis/request/user";
import {useCookies} from "react-cookie";
import {usePagination} from "../../hooks";
import {GetUserBoardListResponseDto} from "../../apis/response/board";
import Pagination from "../../components/pagination";

// component: ユーザー画面コンポーネント
export default function User() {

    // state: ユーザーメールのパス変数ステート
    const { userEmail } = useParams();
    // state: ログインユーザーのステート
    const { loginUser } = useLoginUserStore();
    // state: Cookieのステート
    const [cookie] = useCookies();
    // state: マイページであるかどうかのステート
    const [isMyPage, setIsMyPage] = useState(true);

    // function: ナビゲート関数
    const navigate = useNavigate();

    // component: ユーザー画面上部コンポーネント
    const UserTop = () => {

        // state: 画像ファイル入力要素の参照ステート
        const imageInputRef = useRef<HTMLInputElement | null>(null);
        // state: ニックネーム変更モードの有無ステート
        const [isChangeNickname, setIsChangeNickname] = useState(false);
        // state: ニックネームステート (表示用)
        const [nickname, setNickname] = useState('');
        // state: 変更後のニックネームステート (入力中)
        const [changeNickname, setChangeNickname] = useState('');
        // state: プロフィール画像URLのステート
        const [profileImage, setProfileImage] = useState<string | null>(null);

        // function: ユーザー情報取得 (getUser) レスポンス処理関数
        const getUserResponse = (responseBody: GetUserResponseDto | ResponseDto | null) => {
            if (!responseBody) return;

            const { code } = responseBody;
            if (code === 'NU')
                alert('存在しないユーザーです。');

            if (code === 'DBE')
                alert('データベースエラーが発生しました。');

            if (code !== 'SU') {
                navigate(MAIN_PATH());
                return;
            }

            const { email, nickname, profileImage } = responseBody as GetUserResponseDto;
            setNickname(nickname);
            setProfileImage(profileImage);

            const isMyPage = email === loginUser?.email;
            setIsMyPage(isMyPage);
        }

        // function: プロフィール画像変更 (patchProfileImage) レスポンス処理関数
        const patchProfileImageResponse = (responseBody: PatchProfileImageResponseDto | ResponseDto | null) => {
            if (!responseBody) return;

            const { code } = responseBody;
            if (code === 'AF')
                alert('認証に失敗しました。');

            if (code === 'NU')
                alert('存在しないユーザーです。');

            if (code === 'DBE')
                alert('データベースエラーが発生しました。');

            if (code !== 'SU')
                return;

            if (!userEmail) return;
            getUserRequest(userEmail).then(getUserResponse);
        }

        // function: ファイルアップロード (fileUpload) レスポンス処理関数
        const fileUploadResponse = (profileImage: string | null) => {
            if (!profileImage) return;
            if (!cookie.accessToken) return;

            const requestBody: PatchProfileImageRequestDto = { profileImage }
            patchProfileImageRequest(requestBody, cookie.accessToken).then(patchProfileImageResponse);
        }

        // function: ニックネーム変更 (patchNickname) レスポンス処理関数
        const patchNicknameResponse = (responseBody: PatchNicknameResponseDto | ResponseDto | null) => {
            if (!responseBody) return;

            const { code } = responseBody;
            if (code === 'VF')
                alert('ニックネームは必須です。');

            if (code === 'AF')
                alert('認証に失敗しました。');

            if (code === 'DN')
                alert('重複するニックネームです。');

            if (code === 'NU')
                alert('存在しないユーザーです。');

            if (code === 'DBE')
                alert('データベースエラーが発生しました。');

            if (code !== 'SU')
                return;

            if (!userEmail) return;
            getUserRequest(userEmail).then(getUserResponse);
            setIsChangeNickname(false);
        }

        // event handler: プロフィールボックスクリックイベント処理
        const onClickProfileBoxClickHandler = () => {
            if (!isMyPage) return;
            if (!imageInputRef.current) return;

            imageInputRef.current.click();
        }

        // event handler: ニックネーム修正ボタンクリックイベント処理
        const onClickEditNicknameButtonHandler = () => {
            if (!isChangeNickname) {
                setChangeNickname(nickname);
                setIsChangeNickname(!isChangeNickname);

                return;
            } else {
                if (!cookie.accessToken) return;
                const requestBody: PatchNicknameRequestDto = { nickname: changeNickname };
                patchNicknameRequest(requestBody, cookie.accessToken).then(patchNicknameResponse);
            }
        }

        // event handler: プロフィール画像変更イベント処理
        const onChangeProfileImageHandler = (event: ChangeEvent<HTMLInputElement>) => {
            if (!event.target.files || !event.target.files.length) return;

            const file = event.target.files[0];
            const data = new FormData();
            data.append('file', file);

            // ️FIX: fileUploadRequestに認証トークンを渡す
            const accessToken = cookie.accessToken;
            if (!accessToken) {
                alert('認証情報がありません。再度ログインしてください。');
                return;
            }

            fileUploadRequest(data, accessToken).then(fileUploadResponse);
        }

        // event handler: ニックネーム変更イベント処理
        const onChangeNicknameHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const { value } = event.target;
            setChangeNickname(value);
        }

        // effect: ユーザーメールのパス変数変更時に実行する関数
        useEffect(() => {
            if (!userEmail) return;

            getUserRequest(userEmail).then(getUserResponse);
        }, [userEmail])

        // render: ユーザー画面上部コンポーネントのレンダリング
        return (
            <div id='user-top-wrapper'>
                <div className='user-top-container'>
                    {isMyPage ?
                        <div className='user-top-profile-image-box editable' onClick={onClickProfileBoxClickHandler}>
                            { profileImage !== null ?
                                <div className='user-top-profile-image' style={{ backgroundImage: `url(${profileImage})` }}></div> :
                                <div className='icon-box-large'>
                                    <div className='icon image-box-white-icon'></div>
                                </div>
                            }
                            <div className="profile-edit-overlay">
                                <div className='icon-box'>
                                    <div className='icon edit-icon-white'></div>
                                </div>
                            </div>
                            <input ref={imageInputRef} type='file' accept='image/*' style={{ display: 'none' }} onChange={onChangeProfileImageHandler} />
                        </div> :
                        <div className='user-top-profile-image-box' style={{ backgroundImage: `url(${profileImage ? profileImage : defaultProfileImage})` }}></div>
                    }
                    <div className='user-top-info-box'>
                        <div className='user-top-info-nickname-box'>
                            {isMyPage ?
                                <>
                                    {isChangeNickname ?
                                        <input type='text' className='user-top-info-nickname-input' size={changeNickname.length + 2} value={changeNickname} onChange={onChangeNicknameHandler}/> :
                                        <div className='user-top-info-nickname'>{nickname}</div>
                                    }
                                    <div className='icon-button' onClick={onClickEditNicknameButtonHandler}>
                                        <div className='icon edit-icon'></div>
                                    </div>
                                </> :
                                <div className='user-top-info-nickname'>{nickname}</div>
                            }
                        </div>
                        <div className='user-top-info-email'>{userEmail}</div>
                    </div>
                </div>
            </div>
        );

    };

    // component: ユーザー画面下部コンポーネント
    const UserBottom = () => {

        // state: ページネーション関連ステート
        const {
            currentPage,
            setCurrentPage,
            currentSection,
            setCurrentSection,
            viewList,
            viewPageList,
            totalSection,
            setTotalList
        } = usePagination<BoardListItem>(5);

        // state: 掲示物の総数ステート
        const [boardCount, setBoardCount] = useState(2);

        // function: ユーザーの掲示物リスト取得 (getUserBoardList) レスポンス処理関数
        const getUserBoardListResponse = (responseBody: GetUserBoardListResponseDto | ResponseDto | null) => {
            if (!responseBody) return;

            const { code } = responseBody;
            if (code === 'NU') {
                alert('存在しないユーザーです。');
                navigate(MAIN_PATH());
                return;
            }

            if (code === 'DBE')
                alert('データベースエラーが発生しました。')

            if (code !== 'SU')
                return;

            const { userBoardList } = responseBody as GetUserBoardListResponseDto;
            setTotalList(userBoardList);
            setBoardCount(userBoardList.length);
        }

        // event handler: サイドカードクリックイベント処理
        const onClickSideCardClickHandler = () => {
            if (isMyPage) {
                navigate(BOARD_PATH() + '/' + BOARD_WRITE_PATH());
            } else if (loginUser) {
                navigate(USER_PATH(loginUser.email));
            }
        }

        // effect: userEmail path variableが変更されるたびに実行される関数
        useEffect(() => {
            if (!userEmail) return;
            getUserBoardListRequest(userEmail).then(getUserBoardListResponse);
        }, [userEmail]);

        // render: ユーザー画面下部コンポーネントのレンダリング
        return (
            <div id='user-bottom-wrapper'>
                <div className='user-bottom-container'>
                    <div className='user-bottom-title'>{isMyPage ? '自分の投稿 ' : '投稿 '}<span className='emphasis'>{boardCount}</span></div>
                    <div className='user-bottom-contents-box'>
                        {/* 投稿リスト */}
                        {boardCount === 0 ?
                            <div className='user-bottom-contents-nothing'>{'投稿がありません。'}</div> :
                            <div className='user-bottom-contents'>
                                {viewList.map((boardListItem) => <BoardItem boardListItem={boardListItem} key={boardListItem.boardNumber} />)}
                            </div>
                        }
                        <div className='user-bottom-side-box'>
                            <div className='user-bottom-side-card' onClick={onClickSideCardClickHandler}>
                                <div className='user-bottom-side-container'>
                                    {isMyPage ?
                                        <>
                                            <div className='icon-box'>
                                                <div className='icon edit-icon'></div>
                                            </div>
                                            <div className='user-bottom-side-text'>{'投稿する'}</div>
                                        </> :
                                        <>
                                            <div className='user-bottom-side-text'>{'マイページへ'}</div>
                                            <div className='icon-box'>
                                                <div className='icon arrow-right-icon'></div>
                                            </div>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ページネーション */}
                    <div className='user-bottom-pagination-box'>
                        {boardCount !== 0 &&
                            <Pagination
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                currentSection={currentSection}
                                setCurrentSection={setCurrentSection}
                                viewPageList={viewPageList}
                                totalSection={totalSection}
                            />
                        }
                    </div>
                </div>
            </div>
        );

    };

    // render: ユーザー画面コンポーネントのレンダリング
    return (
        <>
            <UserTop />
            <UserBottom />
        </>
    )
}
