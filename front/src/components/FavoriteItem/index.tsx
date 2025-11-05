import React from 'react';
import './style.css';
import { FavoriteListItem } from "../../types/interface";
import defaultProfileImage from 'assets/images/default-profile-image.png';

// interface: Favorite List Item コンポーネント Properties
interface Props {
    favoriteListItem: FavoriteListItem;
}

// component: Favorite List Item コンポーネント
export default function FavoriteItem({ favoriteListItem }: Props) {

    // state: properties
    const { nickname, profileImage } = favoriteListItem;

    // render: Favorite List Item コンポーネントのレンダリング
    return (
        <div className='favorite-list-item'>
            <div className='favorite-list-item-profile-box'>
                <div className='favorite-list-item-profile-image' style={{ backgroundImage: `url(${profileImage ? profileImage : defaultProfileImage})`}}></div>
            </div>
            <div className='favorite-list-item-hickname'>{nickname}</div>
        </div>
    )
}