import React from 'react'
import Header from '../Header';
import Footer from '../footer';
import {Outlet, useLocation} from "react-router-dom";
import {AUTH_PATH} from "../../constants";

// component: Layout コンポーネント
export default function Container() {

    // state: 現在のページパスネーム状態
    const { pathname } = useLocation();

    // 認証ページかどうかを確認
    const isAuthPage = pathname === AUTH_PATH();

    // render: Layout コンポーネントのレンダリング
    return (
        <>
            {!isAuthPage && <Header />}
            <Outlet />
            {!isAuthPage && <Footer />}
        </>
    )
}