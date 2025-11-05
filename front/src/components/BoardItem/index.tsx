import React from 'react';
import './style.css';
import { BoardListItem } from "../../types/interface";
import { useNavigate } from 'react-router-dom';
import defaultProfileImage from 'assets/images/default-profile-image.png'
import {BOARD_DETAIL_PATH, BOARD_PATH} from "../../constants";

// interface: Board Item コンポーネント Properties
interface Props {
    boardListItem: BoardListItem
}

// component: Board Item コンポーネント
export default function BoardItem({ boardListItem }: Props) {

    // state: properties
    const { boardNumber, title, content, boardTitleImage } = boardListItem;
    const { favoriteCount, commentCount, viewCount } = boardListItem;
    const { writeDatetime, writerNickname, writerProfileImage } = boardListItem;

    // function: HTMLタグを削除して純粋なテキストを返す関数
    const getHtmlContent = (content: string) => {
        // HTMLタグを削除する正規表現
        return content.replace(/<[^>]*>?/gm, '');
    }

    // function: ナビゲート関数
    const navigate = useNavigate();

    // event handler: 掲示物アイテムクリックイベント処理関数
    const onClickHandler = () => {
        navigate(BOARD_PATH() + '/' + BOARD_DETAIL_PATH(boardNumber));
    };

    // render: Board List Item コンポーネントのレンダリング
    return (
        <div className='board-list-item' onClick={onClickHandler}>
            <div className='board-list-item-main-box'>
                <div className='board-list-item-top'>
                    <div className='board-list-item-profile-box'>
                        <div className='board-list-item-profile-image' style={{ backgroundImage: `url(${writerProfileImage ? writerProfileImage : defaultProfileImage})` }}></div>
                    </div>
                    <div className='board-list-item-write-box'>
                        <div className='board-list-item-nickname'>{writerNickname}</div>
                        <div className='board-list-item-write-date'>{writeDatetime}</div>
                    </div>
                </div>
                <div className='board-list-item-middle'>
                    <div className='board-list-item-title'>{title}</div>
                    <div className='board-list-item-content'>{getHtmlContent(content)}</div>
                </div>
                <div className='board-list-item-bottom'>
                    <div className='board-list-item-counts'>
                        {`コメント ${commentCount} ・ いいね ${favoriteCount} ・ 閲覧数 ${viewCount}`}
                    </div>
                </div>
            </div>
            {boardTitleImage !== null && (
                <div className='board-list-item-image-box'>
                    <div className='board-list-item-image' style={{backgroundImage: `url(${boardTitleImage})`}}></div>
                </div>
            )}
        </div>
    );
}
