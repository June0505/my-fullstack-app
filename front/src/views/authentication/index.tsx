import React, {ChangeEvent, KeyboardEvent, useRef, useState} from 'react'
import './style.css';
import InputBox from "../../components/InputBox";
import {GoogleAuthRequestDto, SignInRequestDto, SignUpRequestDto} from "../../apis/request/auth";
import {googleAuthRequest, signInRequest, signUpRequest} from "../../apis";
import {SignInResponseDto, SignUpResponseDto} from "../../apis/response/auth";
import {ResponseDto} from "../../apis/response";
import {useCookies} from "react-cookie";
import {MAIN_PATH} from "../../constants";
import {useNavigate} from "react-router-dom";
import {GoogleLogin} from '@react-oauth/google';

// ------------------------------------------------------------------
// component: サインインカードコンポーネント
// ------------------------------------------------------------------
interface SignInCardProps {
    setView: (view: 'sign-in' | 'sign-up') => void;
}

const SignInCard = ({ setView }: SignInCardProps) => {

    // hook: ナビゲート関数
    const navigate = useNavigate();
    // hook: クッキー関数
    const [cookies, setCookies] = useCookies();

    // state: Eメール入力要素の参照状態
    const emailRef = useRef<HTMLInputElement | null>(null);
    // state: パスワード入力要素の参照状態
    const passwordRef = useRef<HTMLInputElement | null>(null);
    // state: Eメール状態
    const [email, setEmail] = useState<string>('');
    // state: パスワード状態
    const [password, setPassword] = useState<string>('');
    // state: パスワードのType状態
    const [passwordType, setPasswordType] = useState<'text' | 'password'>('password');
    // state: パスワードボタンのアイコン状態
    const [passwordButtonIcon, setPasswordButtonIcon] = useState<'eye-light-off-icon' | 'eye-light-on-icon'>('eye-light-off-icon');
    // state: エラー状態
    const [error, setError] = useState<boolean>(false);

    // function: sign in response 処理関数
    const signInResponse = (responseBody: SignInResponseDto | ResponseDto | null) => {
        if (!responseBody) {
            alert('ネットワークの状態を確認してください。');
            return;
        }

        const { code } = responseBody;
        if (code === 'DBE')
            alert('データベースエラーです。');

        if (code === 'SF' || code === 'VF')
            setError(true);

        if (code !== 'SU')
            return;

        const { token, expirationTime } = responseBody as SignInResponseDto;
        const now = new Date().getTime();
        const expires = new Date(now + expirationTime * 1000);

        setCookies('accessToken', token, { expires, path: MAIN_PATH() });
        navigate(MAIN_PATH());
    }

    // event handler: メール変更イベントの処理
    const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        setError(false);
        const { value } = event.target;
        setEmail(value);
    }

    // event handler: パスワード変更イベントの処理
    const onPasswordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        setError(false);
        const { value } = event.target;
        setPassword(value);
    }

    // event handler: ログインボタンクリックイベントの処理
    const onSignInButtonClickHandler = () => {
        const requestBody: SignInRequestDto = { email, password };
        signInRequest(requestBody).then(signInResponse);
    }

    // event handler: 新規登録ボタンクリックイベントの処理
    const onSignUpButtonClickHandler = () => {
        setView('sign-up');
    }

    // event handler: パスワードボタンクリックイベントの処理
    const onPasswordButtonClickHandler = () => {
        if (passwordType === 'text') {
            setPasswordType('password');
            setPasswordButtonIcon('eye-light-off-icon');
        } else {
            setPasswordType('text');
            setPasswordButtonIcon('eye-light-on-icon');
        }
    }

    // event handler: メール入力欄のkeydownイベント処理
    const onEmailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter')
            return;
        if (!passwordRef.current)
            return;
        passwordRef.current.focus();
    }

    // event handler: パスワードのkeydownイベント処理
    const onPasswordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter')
            return;
        onSignInButtonClickHandler();
    }

    // event handler: Google ログイン成功イベントの処理
    const onGoogleLoginSuccess = async (credentialResponse: any) => {
        const { credential } = credentialResponse;

        // @ts-ignore
        const requestBody: GoogleAuthRequestDto = { idToken: credential };
        const response = await googleAuthRequest(requestBody);

        if (!response) {
            alert('ネットワークの状態を確認してください。');
            return;
        }

        const { code } = response;
        if (code === 'DBE') {
            alert('データベースエラーです。');
            return;
        }
        if (code === 'DE') {
            alert('このメールアドレスは既に他の方法で登録されています。');
            return;
        }
        if (code === 'SF') {
            alert('Google認証に失敗しました。もう一度お試しください。');
            return;
        }

        if (code !== 'SU') {
            onGoogleLoginError();
            return;
        }

        const { token, expirationTime } = response as SignInResponseDto;
        const now = new Date().getTime();
        const expires = new Date(now + expirationTime * 1000);

        setCookies('accessToken', token, { expires, path: MAIN_PATH() });
        navigate(MAIN_PATH());
    };

    // event handler: Google ログイン失敗イベントの処理
    const onGoogleLoginError = () => {
        console.error('Google ログインエラー');
        alert('Googleログインに失敗しました。もう一度お試しください。');
    };

    // render: サインインカードコンポーネントのレンダリング
    return (
        <div className='auth-card'>
            <div className='auth-card-box'>
                <div className='auth-card-top'>
                    <div className='auth-card-title-box'>
                        <div className='auth-card-title'>{'ログイン'}</div>
                    </div>
                    <InputBox
                        ref={emailRef}
                        label='メールアドレス'
                        type='text'
                        placeholder='メールアドレス'
                        value={email}
                        onChange={onEmailChangeHandler}
                        error={error}
                        onKeyDown={onEmailKeyDownHandler}
                    />
                    <InputBox
                        ref={passwordRef}
                        label='パスワード'
                        type={passwordType}
                        placeholder='パスワード'
                        value={password}
                        onChange={onPasswordChangeHandler}
                        error={error}
                        icon={passwordButtonIcon}
                        onButtonClick={onPasswordButtonClickHandler}
                        onKeyDown={onPasswordKeyDownHandler}
                    />
                </div>
                <div className='auth-card-bottom'>
                    {error &&
                        <div className='auth-sign-in-error-box'>
                            <div className='auth-sign-in-error-message'>
                                {'メールアドレスまたはパスワードが正しくありません。 \nもう一度ご確認ください。'}
                            </div>
                        </div>
                    }
                    <div className='black-large-full-button' onClick={onSignInButtonClickHandler}>{'ログイン'}</div>

                    <div className='social-login-divider'>
                        <span>または</span>
                    </div>

                    <div className='social-login-box'>
                        <GoogleLogin
                            onSuccess={onGoogleLoginSuccess}
                            onError={onGoogleLoginError}
                            locale="ja_JP"
                            text="continue_with"
                            size="large"
                            theme="filled_blue"
                            width="450px"
                        />
                    </div>

                    <div className='auth-description-box'>
                        <div className='auth-description'>{'初めての方はこちら'}<span
                            className='auth-description-link'
                            onClick={onSignUpButtonClickHandler}>{'新規登録'}</span></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ------------------------------------------------------------------
// component: サインアップカードコンポーネント
// ------------------------------------------------------------------
interface SignUpCardProps {
    setView: (view: 'sign-in' | 'sign-up') => void;
}

const SignUpCard = ({ setView }: SignUpCardProps) => {

    // hook: ナビゲート関数
    const navigate = useNavigate();
    // hook: クッキー関数
    const [cookies, setCookies] = useCookies();

    // ref: Eメール要素への参照
    const emailRef = useRef<HTMLInputElement | null>(null);
    // ref: パスワード要素への参照
    const passwordRef = useRef<HTMLInputElement | null>(null);
    // ref: パスワード要素確認への参照
    const passwordCheckRef = useRef<HTMLInputElement | null>(null);
    // ref: ニックネーム要素への参照
    const nicknameRef = useRef<HTMLInputElement | null>(null);

    // state: Eメールの状態
    const [email, setEmail] = useState<string>('');
    // state: パスワードの状態
    const [password, setPassword] = useState<string>('');
    // state: パスワード確認の状態
    const [passwordCheck, setpasswordCheck] = useState<string>('');
    // state: ニックネームの状態
    const [nickname, setNickname] = useState<string>('');
    // state: パスワードTypeの状態
    const [passwordType, setPasswordType] = useState<'text' | 'password'>('password');
    // state: パスワード確認Typeの状態
    const [passwordCheckType, setpasswordCheckType] = useState<'text' | 'password'>('password');
    // state: Eメールエラーの状態
    const [emailError, setEmailError] = useState<boolean>(false);
    // state: パスワードエラーの状態
    const [passwordError, setPasswordError] = useState<boolean>(false);
    // state: パスワード確認エラーの状態
    const [passwordCheckError, setpasswordCheckError] = useState<boolean>(false);
    // state: ニックネームエラーの状態
    const [nicknameError, setNicknameError] = useState<boolean>(false);
    // state: Eメールエラーメッセージの状態
    const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');
    // state: パスワードエラーメッセージの状態
    const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>('');
    // state: パスワード確認エラーメッセージの状態
    const [passwordCheckErrorMessage, setPasswordCheckErrorMessage] = useState<string>('');
    // state: ニックネームエラーメッセージの状態
    const [nicknameErrorMessage, setNicknameErrorMessage] = useState<string>('');
    // state: パスワードボタンアイコンの状態
    const [passwordButtonIcon, setPasswordButtonIcon] = useState<'eye-light-off-icon' | 'eye-light-on-icon'>('eye-light-off-icon');
    // state: パスワード確認ボタンアイコンの状態
    const [passwordCheckButtonIcon, setPasswordCheckButtonIcon] = useState<'eye-light-off-icon' | 'eye-light-on-icon'>('eye-light-off-icon');

    // function: sign up response 処理関数
    const signUpResponse = (responseBody: SignUpResponseDto | ResponseDto | null) => {
        if (!responseBody) {
            alert('ネットワーク異常です。');
            return;
        }
        const { code } = responseBody;
        if (code === 'DE') {
            setEmailError(true);
            setEmailErrorMessage('重複するメールアドレスです。')
        }
        if (code === 'DN') {
            setNicknameError(true);
            setNicknameErrorMessage('重複するニックネームです。')
        }
        if (code === 'VF')
            alert('必須項目をすべて入力してください。');
        if (code === 'DBE')
            alert('データベースエラーです。');
        if (code !== 'SU')
            return;

        alert('ユーザー登録が成功しました。ログインしてください。');
        setView('sign-in');
    }

    // event handler: Eメールの変更イベントを処理
    const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setEmail(value);
        setEmailError(false);
        setEmailErrorMessage('');
    }

    // event handler: パスワードの変更イベントを処理
    const onPasswordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setPassword(value);
        setPasswordError(false);
        setPasswordErrorMessage('');
    }

    // event handler: パスワード確認の変更イベントを処理
    const onPasswordCheckChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setpasswordCheck(value);
        setpasswordCheckError(false);
        setPasswordCheckErrorMessage('')
    }

    // event handler: ニックネーム変更イベントを処理
    const onNicknameChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setNickname(value);
        setNicknameError(false);
        setNicknameErrorMessage('');
    }

    // event handler: パスワードボタンクリックイベントを処理
    const onPasswordButtonClickHandler = () => {
        if (passwordButtonIcon === 'eye-light-off-icon') {
            setPasswordType('text');
            setPasswordButtonIcon('eye-light-on-icon');
        } else {
            setPasswordType('password');
            setPasswordButtonIcon('eye-light-off-icon');
        }
    }

    // event handler: パスワード確認ボタンクリックイベントを処理
    const onPasswordCheckButtonClickHandler = () => {
        if (passwordCheckButtonIcon === 'eye-light-off-icon') {
            setpasswordCheckType('text');
            setPasswordCheckButtonIcon('eye-light-on-icon');
        } else {
            setpasswordCheckType('password');
            setPasswordCheckButtonIcon('eye-light-off-icon');
        }
    }

    // event handler: サインアップボタンのクリックイベントを処理
    const onSignUpButtonClickHandler = () => {
        let hasError = false;

        // 1. Eメールのバリデーション
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        const isEmailPattern = emailPattern.test(email);
        if (!isEmailPattern) {
            setEmailError(true);
            setEmailErrorMessage('有効なメールアドレスを入力してください。');
            hasError = true;
        }

        // 2. パスワードのバリデーション
        const isPasswordPattern = password.trim().length >= 8;
        if (!isPasswordPattern) {
            setPasswordError(true);
            setPasswordErrorMessage('パスワードは8文字以上で入力してください。');
            hasError = true;
        }

        // 3. パスワード確認のバリデーション
        const isEqualPassword = password === passwordCheck;
        if (!isEqualPassword) {
            setpasswordCheckError(true);
            setPasswordCheckErrorMessage('パスワードが一致しません。');
            hasError = true;
        }

        // 4. ニックネームのバリデーション
        const hasNickname = nickname.trim().length > 0;
        if (!hasNickname) {
            setNicknameError(true);
            setNicknameErrorMessage('ニックネームを入力してください。');
            hasError = true;
        }

        if (hasError)
            return;

        // リクエストボディの作成
        const requestBody: SignUpRequestDto = {
            email,
            password,
            nickname,
        };

        signUpRequest(requestBody).then(signUpResponse)
    }

    // event handler: ログインリンクのクリックイベントを処理
    const onSignInLinkClickHandler = () => {
        setView('sign-in');
    }

    // event handler: Eメールのkeydownイベントを処理
    const onEmailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter')
            return;
        if (!passwordRef.current)
            return;

        passwordRef.current.focus();
    }

    // event handler: パスワードのkeydownイベントを処理
    const onPasswordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter')
            return;
        if (!passwordCheckRef.current)
            return;

        passwordCheckRef.current.focus();
    }

    // event handler: パスワード確認のkeydownイベントを処理
    const onPasswordCheckKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter')
            return;
        if (!nicknameRef.current)
            return;
        nicknameRef.current.focus();
    }

    // event handler: ニックネーム入力のkeydownイベントを処理
    const onNicknameKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter')
            return;

        onSignUpButtonClickHandler(); // ニックネームの次はサインアップボタンへ
    }

    // event handler: Google サインアップ成功イベントの処理
    const onGoogleSignUpSuccess = async (credentialResponse: any) => {
        const { credential } = credentialResponse;

        // @ts-ignore
        const requestBody: GoogleAuthRequestDto = { idToken: credential };
        const response = await googleAuthRequest(requestBody);

        if (!response) {
            alert('ネットワークの状態を確認してください。');
            return;
        }

        const { code } = response;
        if (code === 'DBE') {
            alert('データベースエラーです。');
            return;
        }
        if (code === 'DE') {
            alert('このメールアドレスは既に他の方法で登録されています。');
            return;
        }
        if (code === 'SF') {
            alert('Google認証に失敗しました。もう一度お試しください。');
            return;
        }

        if (code !== 'SU') {
            onGoogleSignUpError();
            return;
        }

        const { token, expirationTime } = response as SignInResponseDto;
        const now = new Date().getTime();
        const expires = new Date(now + expirationTime * 1000);

        setCookies('accessToken', token, { expires, path: MAIN_PATH() });
        navigate(MAIN_PATH());
    };

    // event handler: Google サインアップ失敗イベントの処理
    const onGoogleSignUpError = () => {
        console.error('Google サインアップエラー');
        alert('Googleサインアップに失敗しました。もう一度お試しください。');
    };

    // render: サインアップカードコンポーネントのレンダリング
    return (
        <div className='auth-card'>
            <div className='auth-card-box'>
                <div className='auth-card-top'>
                    <div className='auth-card-title-box'>
                        <div className='auth-card-title'>{'メールアドレスで登録'}</div>
                    </div>

                    <InputBox
                        ref={emailRef}
                        label='メールアドレスを入力'
                        type='text'
                        placeholder='メールアドレス'
                        value={email}
                        onChange={onEmailChangeHandler}
                        error={emailError}
                        message={emailErrorMessage}
                        onKeyDown={onEmailKeyDownHandler}
                    />
                    <InputBox
                        ref={passwordRef}
                        label='パスワードを入力'
                        type={passwordType}
                        placeholder='パスワード'
                        value={password}
                        onChange={onPasswordChangeHandler}
                        error={passwordError}
                        message={passwordErrorMessage}
                        icon={passwordButtonIcon}
                        onButtonClick={onPasswordButtonClickHandler}
                        onKeyDown={onPasswordKeyDownHandler}
                    />
                    <InputBox
                        ref={passwordCheckRef}
                        label='パスワード確認'
                        type={passwordCheckType}
                        placeholder='パスワードをもう一度入力してください。'
                        value={passwordCheck}
                        onChange={onPasswordCheckChangeHandler}
                        error={passwordCheckError}
                        message={passwordCheckErrorMessage}
                        icon={passwordCheckButtonIcon}
                        onButtonClick={onPasswordCheckButtonClickHandler}
                        onKeyDown={onPasswordCheckKeyDownHandler}
                    />

                    <InputBox
                        ref={nicknameRef}
                        label='ニックネームを入力'
                        type='text'
                        placeholder='ニックネーム'
                        value={nickname}
                        onChange={onNicknameChangeHandler}
                        error={nicknameError}
                        message={nicknameErrorMessage}
                        onKeyDown={onNicknameKeyDownHandler}
                    />

                </div>
                <div className='auth-card-bottom'>

                    <div className='black-large-full-button' onClick={onSignUpButtonClickHandler}>{'ユーザー登録'}</div>

                    <div className='social-login-divider'>
                        <span>または</span>
                    </div>

                    <div className='social-login-box'>
                        <GoogleLogin
                            onSuccess={onGoogleSignUpSuccess}
                            onError={onGoogleSignUpError}
                            locale="ja_JP"
                            text="signup_with"
                            size="large"
                            theme="filled_blue"
                            width="450px"
                        />
                    </div>

                    <div className='auth-description-box'>
                        <div className='auth-description'>{'すでにアカウントをお持ちの方は'}<span
                            className='auth-description-link' onClick={onSignInLinkClickHandler}>{'ログイン'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


// component: 認証画面コンポーネント
export default function Authentication() {

    // state: 画面状態
    const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in');

    // hook: ナビゲート関数
    const navigate = useNavigate();

    // event handler: ロゴクリックイベントの処理 (共通)
    const onLogoClickHandler = () => {
        navigate(MAIN_PATH());
    }

    // render: 認証画面コンポーネントのレンダリング
    return (
        <div id='auth-wrapper'>
            <div className='auth-container'>
                <div
                    className='auth-logo-icon'
                    onClick={onLogoClickHandler}
                ></div>
                {/* setViewのみPropsとして渡します */}
                {view === 'sign-in' && (
                    <SignInCard
                        setView={setView}
                    />
                )}
                {view === 'sign-up' && (
                    <SignUpCard
                        setView={setView}
                    />
                )}
            </div>
        </div>
    )
}