import React, { useMemo } from 'react';
import './style.css';
import defaultProfileImage from 'assets/images/default-profile-image.png';
import { useNavigate } from 'react-router-dom';
import { BoardListItem } from "../../types/interface";
import { BOARD_DETAIL_PATH, BOARD_PATH } from "../../constants";

// interface: Top 3 List Item コンポーネント Properties
interface Props {
    top3ListItem: BoardListItem;
}

// component: Top 3 List Item コンポーネント
export default function Top3Items({ top3ListItem }: Props) {

    // state: properties
    const { boardNumber, title, content, boardTitleImage } = top3ListItem;
    const { favoriteCount, commentCount, viewCount } = top3ListItem;
    const { writeDatetime, writerNickname, writerProfileImage } = top3ListItem;

    // function: HTMLタグを削除して純粋なテキストを返す関数
    const getHtmlContent = (content: string) => {
        // HTMLタグを削除する正規表現
        return content.replace(/<[^>]*>?/gm, '');
    }

    // function: ナビゲート関数
    const navigate = useNavigate();

    // ⭐️ 画像の有無による背景スタイルと文字色クラスの決定
    const backgroundStyle = useMemo(() => {
        if (boardTitleImage) {
            // 画像がある場合: 画像と暗いオーバーレイを適用
            return {
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${boardTitleImage})`
            };
        }
        // 画像がない場合はCSSのデフォルトの背景色(#e0e0e0)を使用します。
        return {};
    }, [boardTitleImage]);

    // テキストの色を決定するクラス。画像の有無によって 'text-white' または 'text-dark' が適用されます。
    const textColorClass = boardTitleImage ? 'text-white' : 'text-dark';

    // event handler: 掲示物アイテムクリックイベント処理関数
    const onClickHandler = () => {
        navigate(BOARD_PATH() + '/' + BOARD_DETAIL_PATH(boardNumber));
    };

    // render: Top 3 List Item コンポーネントのレンダリング
    return (
        <div
            className={`top-3-list-item ${textColorClass}`}
            style={backgroundStyle}
            onClick={onClickHandler}
        >
            <div className='top-3-list-item-main-box'>
                <div className='top-3-list-item-top'>
                    <div className='top-3-list-item-profile-box'>
                        <div className='top-3-list-item-profile-image' style={{ backgroundImage: `url(${writerProfileImage ? writerProfileImage : defaultProfileImage})` }}></div>
                    </div>
                    <div className='top-3-list-item-write-box'>
                        <div className='top-3-list-item-nickname'>{writerNickname}</div>
                        <div className='top-3-list-item-write-date'>{writeDatetime}</div>
                    </div>
                </div>
                <div className='top-3-list-item-middle'>
                    <div className='top-3-list-item-title'>{title}</div>
                    {/* 変更: contentからHTMLタグを削除して純粋なテキストを表示します。 */}
                    <div className='top-3-list-item-content'>{getHtmlContent(content)}</div>
                </div>
                <div className='top-3-list-bottom'>
                    <div className='top-3-list-item-counts'>
                        {`コメント ${commentCount} ・ いいね ${favoriteCount} ・ 閲覧数 ${viewCount}`}
                    </div>
                </div>
            </div>
        </div>
    )
}
