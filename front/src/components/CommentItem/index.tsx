import React from 'react';
import './style.css';
import { CommentListItem } from "../../types/interface";
import defaultProfileImage from 'assets/images/default-profile-image.png';
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// dayjs: timezone plugin
dayjs.extend(utc);
dayjs.extend(timezone);

// interface: Comment List Item コンポーネント Properties
interface Props {
    commentListItem: CommentListItem;
}
// component: Comment List Item コンポーネント
export default function CommentItem({ commentListItem }: Props) {

    // state: properties
    const { nickname, profileImage, writeDatetime, content } = commentListItem;

    // function: 投稿日からの経過時間関数
    const getElapsedTime = () => {
        const now = dayjs();
        const writeTime = dayjs(writeDatetime).tz('Asia/Tokyo');

        const gap = now.diff(writeTime, 'second');
        if (gap < 60) return `${gap}秒前`;
        if (gap < 3600) return `${Math.floor(gap / 60)}分前`;
        if (gap < 86400) return `${Math.floor(gap / 3600)}時間前`;
        return `${Math.floor(gap / 86400)}日前`;
    }

    // render: Comment List Item コンポーネントのレンダリング
    return (
        <div className='comment-list-item'>
            <div className='comment-list-item-top'>
                <div className='comment-list-item-profile-box'>
                    <div className='comment-list-item-profile-image' style={{ backgroundImage: `url(${profileImage ? profileImage : defaultProfileImage})` }}></div>
                </div>
                <div className='comment-list-item-nickname'>{nickname}</div>
                <div className='comment-list-item-divider'>{'\|'}</div>
                <div className='comment-list-item-time'>{getElapsedTime()}</div>
            </div>
            <div className='comment-list-item-main'>
                <div className='comment-list-item-content'>{content}</div>
            </div>
        </div>
    )
}
