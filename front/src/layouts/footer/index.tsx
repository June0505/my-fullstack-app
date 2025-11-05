import React from 'react'
import './style.css';

// component: Footer layout コンポーネント
export default function Footer() {

    // render: Footer layout コンポーネントのレンダリング
    return (
        <div id='footer'>
            <div className='footer-container'>
                <div className='footer-top'>
                    <div className='footer-logo-box'>
                        <div className='icon-box'>
                            <div className='icon logo-light-icon'></div>
                        </div>
                        <div className='footer-logo-text'>Open Blog</div>
                    </div>
                    <div className='footer-link-box'>
                        <div className='footer-email-link'>shin13292@gmail.com</div>
                        <div className=''></div>
                    </div>
                </div>
                <div className='footer-bottom'>
                    <div className='footer-copyright'>{'Copyright © June, All Rights Reserved.'}</div>
                </div>
            </div>
        </div>
    )
}