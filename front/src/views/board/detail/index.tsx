import React, {ChangeEvent, useEffect, useRef, useState} from 'react'
import './style.css';
import FavoriteItem from "../../../components/FavoriteItem";
import {Board, CommentListItem, FavoriteListItem} from "../../../types/interface";
import CommentItem from "../../../components/CommentItem";
import Pagination from "../../../components/pagination";
import defaultProfileImage from 'assets/images/default-profile-image.png';
import {useLoginUserStore} from "../../../stores";
import {useNavigate, useParams} from "react-router-dom";
import {BOARD_PATH, BOARD_UPDATE_PATH, MAIN_PATH, USER_PATH} from "../../../constants";
import {
    deleteBoardRequest,
    getBoardRequest,
    getCommentListRequest,
    getFavoriteListRequest,
    increaseViewCountRequest,
    postCommentRequest,
    putFavoriteRequest
} from "../../../apis";
import GetBoardResponseDto from "../../../apis/response/board/get-board.response.dto";
import {ResponseDto} from "../../../apis/response";
import {
    DeleteBoardResponseDto,
    GetCommentListResponseDto,
    GetFavoriteListResponseDto,
    IncreaseViewCountResponseDto,
    PostCommentResponseDto,
    PutFavoriteResponseDto
} from "../../../apis/response/board";
import 'react-quill/dist/quill.snow.css'; // ✨ Quill 스타일 적용을 위해 필요합니다.

import dayjs from "dayjs";
import {useCookies} from "react-cookie";
import {PostCommentRequestDto} from "../../../apis/request/board";
import {usePagination} from "../../../hooks";

// component: 掲示物詳細画面コンポーネント
export default function BoardDetail() {

    // state: 掲示物番号のpath variable状態
    const { boardNumber } = useParams();
    // state: ログインユーザー状態
    const { loginUser } = useLoginUserStore();
    // state: cookie状態
    const [cookie] = useCookies();

    // function: navigate関数
    const navigate = useNavigate();

    // function: 閲覧数増加のresponse処理関数
    const increaseViewCountResponse = (responseBody: IncreaseViewCountResponseDto | ResponseDto | null) => {
        if (!responseBody)
            return;

        const { code } = responseBody;
        if (code === 'NB')
            console.error('存在しない掲示物です。');
        if (code === 'DBE')
            console.error('データベースエラーが発生しました。');
    }

    // component: 掲示物詳細の上部コンポーネント
    const BoardDetailTop = () => {

        // state: 投稿者であるかどうかの状態
        const [isWriter, setIsWriter] = useState<boolean>(false);
        // state: 掲示物情報状態
        const [board, setBoard] = useState<Board | null>(null);
        // state: moreボタンの表示状態
        const [showMore, setShowMore] = useState<boolean>(false);

        // function: 投稿日時のフォーマット変更関数
        const getWriteDatetimeFormat = () => {
            if (!board) return '';
            const date = dayjs(board.writeDatetime);
            return date.format('YYYY-MM-DD');
        }

        // function: get board response処理関数
        const getBoardResponse = (responseBody: GetBoardResponseDto | ResponseDto | null)=> {
            if (!responseBody) return;
            const { code } = responseBody;

            if (code === 'NB')
                console.error('存在しない掲示物です。');

            if (code === 'DBE')
                console.error('データベースエラーが発生しました。');

            if (code !== 'SU') {
                navigate(MAIN_PATH());
                return;
            }

            const board: Board = { ...responseBody as GetBoardResponseDto }
            setBoard(board);

            if (!loginUser) {
                setIsWriter(false);
                return;
            }

            const isWriter = loginUser.email === board.writerEmail;
            setIsWriter(isWriter);
        }

        // function: delete board response処理関数
        const deleteBoardResponse = (responseBody: DeleteBoardResponseDto| ResponseDto | null) => {
            if (!responseBody) return;
            const { code } = responseBody;

            if (code === 'VF')
                console.error('不正なアクセスです。');

            if (code === 'NU')
                console.error('存在しないユーザーです。');

            if (code === 'NB')
                console.error('存在しない掲示物です。');

            if (code === 'AF')
                console.error('認証に失敗しました。');

            if (code === 'NP')
                console.error('権限がありません。');

            if (code === 'DBE')
                console.error('データベースエラーが発生しました。');

            if (code !== 'SU')
                return;

            navigate(MAIN_PATH());
        }

        // event handler: ニックネームボタンクリックイベント
        const onClickNicknameButton = () => {
            if (!board) return;
            navigate(USER_PATH(board.writerEmail));
        }

        // event handler: moreボタンクリックイベント
        const onClickMoreButton = () => {
            setShowMore(!showMore);
        }

        // event handler: 編集ボタンクリックイベント
        const onClickUpdateButton = () => {
            if (!board || !loginUser) return;
            if (loginUser.email !== board.writerEmail) return;
            navigate(BOARD_PATH() + '/' + BOARD_UPDATE_PATH(board.boardNumber));
        }

        // event handler: 削除ボタンクリックイベント
        const onClickDeleteButton = () => {
            if (!boardNumber || !board || !loginUser || !cookie.accessToken) return;
            if (loginUser.email !== board.writerEmail) return;

            deleteBoardRequest(boardNumber, cookie.accessToken).then(deleteBoardResponse);
        }

        // effect: 掲示物番号が変わるたびに掲示物を取得
        useEffect(() => {
            if (!boardNumber) {
                navigate(MAIN_PATH());
                return;
            }
            getBoardRequest(boardNumber).then(getBoardResponse);
        }, [boardNumber]);

        // render: 掲示物詳細の上部コンポーネントをレンダリング
        if (!board) return <></>
        return (
            <div id='board-detail-top'>
                <div className='board-detail-top-header'>
                    <div className='board-detail-title'>{board.title}</div>
                    <div className='board-detail-top-sub-box'>
                        <div className='board-detail-write-info-box'>
                            <div className='board-detail-writer-profile-image' style={{ backgroundImage: `url(${board.writerProfileImage ? board.writerProfileImage : defaultProfileImage})`}}></div>
                            <div className='board-detail-writer-nickname' onClick={onClickNicknameButton}>{board.writerNickname}</div>
                            <div className='board-detail-info-divider'>{'\|'}</div>
                            <div className='board-detail-write-date'>{getWriteDatetimeFormat()}</div>
                        </div>
                        {isWriter && (
                            <div className='icon-button' onClick={onClickMoreButton}>
                                <div className='icon more-icon'></div>
                            </div>
                        )}
                        {showMore && (
                            <div className='board-detail-more-box'>
                                <div className='board-detail-update-button' onClick={onClickUpdateButton}>{'編集'}</div>
                                <div className='divider'></div>
                                <div className='board-detail-delete-button' onClick={onClickDeleteButton}>{'削除'}</div>
                            </div>
                        )}
                    </div>
                </div>
                <div className='divider'></div>
                <div className='board-detail-top-main'>
                    {/* 💡 수정: ql-editor 클래스를 추가하여 Quill 스타일(폰트, 정렬 등)을 적용합니다. */}
                    <div
                        className='board-detail-main-text ql-editor'
                        dangerouslySetInnerHTML={{ __html: board.content }}
                    ></div>
                </div>
            </div>
        );
    }

    // component: 掲示物詳細の下部コンポーネント
    const BoardDetailBottom = () => {

        // state: コメントtextarea参照状態
        const commentRef = useRef<HTMLTextAreaElement | null>(null);

        // state: ページネーション関連の状態
        const {
            currentPage,
            setCurrentPage,
            currentSection,
            setCurrentSection,
            viewList,
            viewPageList,
            totalSection,
            setTotalList
        } = usePagination<CommentListItem>(5);

        // state: いいねリスト状態
        const [favoriteList, setFavoriteList] = useState<FavoriteListItem[]>([]);
        // state: いいね状態
        const [isFavorite, setIsFavorite] = useState<boolean>(false);
        // state: いいねリスト表示状態
        const [showFavorite, setShowFavorite] = useState<boolean>(false);
        // state: 全コメント数の状態
        const [totalCommentCount, setTotalCommentCount] = useState<number>(0);
        // state: コメント入力状態
        const [comment, setComment] = useState<string>('');
        // state: コメントリスト表示状態
        const [showComment, setShowComment] = useState<boolean>(false);

        // function: get favorite list response処理関数
        const getFavoriteListResponse = (responseBody: GetFavoriteListResponseDto | ResponseDto | null) => {
            if (!responseBody) return;

            const { code } = responseBody;
            if (code === 'NB')
                console.error('存在しない掲示物です。');

            if (code === 'DBE')
                console.error('データベースエラーが発生しました。');

            if (code !== 'SU')
                return;

            const { favoriteList } = responseBody as GetFavoriteListResponseDto;
            setFavoriteList(favoriteList);

            if (!loginUser) {
                setIsFavorite(false);
                return;
            }
            const isFavorite = favoriteList.findIndex(favorite => favorite.email === loginUser.email) !== -1;
            setIsFavorite(isFavorite);
        }

        // function: get comment list response処理関数
        const getCommentListResponse = (responseBody: GetCommentListResponseDto | ResponseDto | null) => {
            if (!responseBody) return;

            const { code } = responseBody;
            if (code === 'NB')
                console.error('存在しない掲示物です。');

            if (code === 'DBE')
                console.error('データベースエラーが発生しました。');

            if (code !== 'SU')
                return;

            const { commentList } = responseBody as GetCommentListResponseDto;
            setTotalList(commentList);
            setTotalCommentCount(commentList.length);
        }

        // function: put favorite response処理関数
        const putFavoriteResponse = (responseBody: PutFavoriteResponseDto | ResponseDto | null) => {
            if (!responseBody) return;

            const { code } = responseBody;
            if (code === 'VF')
                console.error('不正なアクセスです。');

            if (code === 'NU')
                console.error('存在しないユーザーです。');

            if (code === 'NB')
                console.error('存在しない掲示物です。');

            if (code === 'AF')
                console.error('認証に失敗しました。');

            if (code === 'DBE')
                console.error('データベースエラーが発生しました。');

            if (code !== 'SU')
                return;

            if (!boardNumber)
                return;

            getFavoriteListRequest(boardNumber).then(getFavoriteListResponse);
        }

        // function: post comment response処理関数
        const postCommentResponse = (responseBody: PostCommentResponseDto | ResponseDto | null) => {
            if (!responseBody) return;

            const { code } = responseBody;
            if (code === 'VF')
                console.error('不正なアクセスです。');

            if (code === 'NU')
                console.error('存在しないユーザーです。');

            if (code === 'NB')
                console.error('存在しない掲示物です。');

            if (code === 'AF')
                console.error('認証に失敗しました。');

            if (code === 'DBE')
                console.error('データベースエラーが発生しました。');

            if (code !== 'SU')
                return;

            setComment('');

            if (!boardNumber)
                return;
            getCommentListRequest(boardNumber).then(getCommentListResponse);
        }

        // event handler: いいねクリックイベント
        const onClickFavoriteButton = () => {
            if (!boardNumber || !loginUser || !cookie.accessToken)
                return;

            putFavoriteRequest(boardNumber, cookie.accessToken).then(putFavoriteResponse)
        }

        // event handler: いいねリスト表示ボタンクリックイベント
        const onClickShowFavoriteButton = () => {
            setShowFavorite(!showFavorite);
        }

        // event handler: コメントリスト表示ボタンクリックイベント
        const onClickShowCommentButton = () => {
            setShowComment(!showComment);
        }

        // event handler: コメント送信ボタンクリックイベント
        const onClickCommentSubmitButton = () => {
            if (!comment || !boardNumber || !loginUser || !cookie.accessToken)
                return;

            const requestBody: PostCommentRequestDto = {content: comment};
            postCommentRequest(boardNumber, requestBody, cookie.accessToken).then(postCommentResponse)
        }

        // event handler: コメント変更イベント
        const onChangeCommentHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
            setComment(event.target.value);

            if (!commentRef.current)
                return;

            commentRef.current.style.height = 'auto';
            commentRef.current.style.height = `${commentRef.current.scrollHeight}px`;
        }

        // effect: 掲示物番号が変わるたびにいいねとコメントリストを取得
        useEffect(() => {
            if (!boardNumber) return;
            getFavoriteListRequest(boardNumber).then(getFavoriteListResponse);
            getCommentListRequest(boardNumber).then(getCommentListResponse)
        }, [boardNumber]);

        // render: 掲示物詳細の下部コンポーネントをレンダリング
        return (
            <div id='board-detail-bottom'>
                <div className='board-detail-bottom-button-box'>
                    <div className='board-detail-bottom-button-group'>
                        <div className='icon-button' onClick={onClickFavoriteButton}>
                            {isFavorite ?
                                <div className='icon favorite-fill-icon'></div> :
                                <div className='icon favorite-light-icon'></div>
                            }
                        </div>
                        <div className='board-detail-bottom-button-text'>{`いいね ${favoriteList.length}`}</div>
                        <div className='icon-button' onClick={onClickShowFavoriteButton}>
                            {showFavorite ?
                                <div className='icon up-light-icon'></div> :
                                <div className='icon down-light-icon'></div>
                            }
                        </div>
                    </div>
                    <div className='board-detail-bottom-button-group'>
                        <div className='icon-button'>
                            <div className='icon comment-icon'></div>
                        </div>
                        <div className='board-detail-bottom-button-text'>{`コメント ${totalCommentCount}`}</div>
                        <div className='icon-button' onClick={onClickShowCommentButton}>
                            {showComment ?
                                <div className='icon up-light-icon'></div> :
                                <div className='icon down-light-icon'></div>
                            }
                        </div>
                    </div>
                </div>
                {showFavorite && (
                    <div className='board-detail-bottom-favorite-box'>
                        <div className='board-detail-bottom-favorite-container'>
                            <div className='board-detail-bottom-favorite-title'>{`いいね `}<span className='emphasis'>{favoriteList.length}</span></div>
                            <div className='board-detail-bottom-favorite-contents'>
                                {favoriteList.map((item, index) => <FavoriteItem key={index} favoriteListItem={item} />)}
                            </div>
                        </div>
                    </div>
                )}
                {showComment && (
                    <div className='board-detail-bottom-comment-box'>
                        <div className='board-detail-bottom-comment-container'>
                            <div className='board-detail-bottom-comment-title'>{`コメント `}<span className='emphasis'>{totalCommentCount}</span></div>
                            <div className='board-detail-bottom-comment-list-container'>
                                {viewList.map((item, index) => <CommentItem key={index} commentListItem={item} />)}
                            </div>
                        </div>
                        <div className='divider'></div>
                        <div className='board-detail-bottom-comment-pagination-box'>
                            <Pagination
                                currentPage={currentPage}
                                currentSection={currentSection}
                                setCurrentPage={setCurrentPage}
                                setCurrentSection={setCurrentSection}
                                viewPageList={viewPageList}
                                totalSection={totalSection}
                            />
                        </div>
                        {loginUser !== null &&
                            <div className='board-detail-bottom-comment-input-box'>
                                <div className='board-detail-bottom-comment-input-container'>
                                    <textarea ref={commentRef} className='board-detail-bottom-comment-textarea' placeholder='コメントを入力' value={comment} onChange={onChangeCommentHandler}/>
                                    <div className='board-detail-bottom-comment-button-box'>
                                        <div className={comment === '' ? 'disable-button' : 'black-button'} onClick={onClickCommentSubmitButton}>{'送信する'}</div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                )}
            </div>
        );
    }

    // effect: 掲示物番号が変わるたびに閲覧数を増加
    let effectFlag = true;
    useEffect(() => {
        if (!boardNumber)
            return;

        if (effectFlag) {
            effectFlag = false;
            increaseViewCountRequest(boardNumber).then(increaseViewCountResponse);
        }

    }, [boardNumber]);

    // render: 掲示物詳細画面コンポーネントのレンダリング
    return (
        <div id='board-detail-wrapper'>
            <div className='board-detail-container'>
                <BoardDetailTop />
                <BoardDetailBottom />
            </div>
        </div>
    )
}