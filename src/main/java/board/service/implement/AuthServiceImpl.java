package board.service.implement;

import board.dto.request.auth.GoogleAuthRequestDto;
import board.dto.request.auth.SignInRequestDto;
import board.dto.request.auth.SignUpRequestDto;
import board.dto.response.ResponseDto;
import board.dto.response.auth.SignInResponseDto;
import board.dto.response.auth.SignUpResponseDto;
import board.entity.UserEntity;
import board.provider.JwtProvider;
import board.repository.UserRepository;
import board.service.AuthService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${google.client-id}")
    private String googleClientId;

    @Override
    public ResponseEntity<? super SignUpResponseDto> signUp(SignUpRequestDto dto) {

        try {
            String email = dto.getEmail();
            boolean existedEmail = userRepository.existsByEmail(email);
            if (existedEmail)
                return SignUpResponseDto.duplicateEmail();

            String nickname = dto.getNickname();
            boolean existedNickname = userRepository.existsByNickname(nickname);
            if (existedNickname)
                return SignUpResponseDto.duplicateNickname();

            String password = dto.getPassword();
            String encodedPassword = passwordEncoder.encode(password);
            dto.setPassword(encodedPassword);

            UserEntity userEntity = new UserEntity(dto);
            userRepository.save(userEntity);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return SignUpResponseDto.success();
    }

    @Override
    public ResponseEntity<? super SignInResponseDto> signIn(SignInRequestDto dto) {

        String token;

        try {
            String email = dto.getEmail();
            UserEntity userEntity = userRepository.findByEmail(email);
            if (userEntity == null)
                return SignInResponseDto.signInFail();

            String password = dto.getPassword();
            String encodedPassword = userEntity.getPassword();
            boolean isMatched = passwordEncoder.matches(password, encodedPassword);
            if (!isMatched)
                return SignInResponseDto.signInFail();

            token = jwtProvider.create(email);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return SignInResponseDto.success(token);
    }


    @Override
    public ResponseEntity<? super SignInResponseDto> googleAuth(GoogleAuthRequestDto dto) {
        String token;

        try {
            // 1. Google ID Token 검증 및 Payload 추출
            GoogleIdToken.Payload payload = verifyGoogleIdToken(dto.getIdToken());

            if (payload == null) {
                // 검증 실패 시 401 Unauthorized 또는 Sign In Fail 응답
                return SignInResponseDto.signInFail();
            }

            String email = payload.getEmail();
            String name = (String) payload.get("name"); // Google에서 제공하는 이름

            // 2. DB에서 사용자 존재 여부 확인
            UserEntity userEntity = userRepository.findByEmail(email);

            if (userEntity == null) {
                // 3. (새로운 사용자) Google 회원가입 처리

                // 닉네임 설정 (기본 이름 + 중복 방지 로직)
                String nickname = (name != null) ? name : "GoogleUser";
                String baseNickname = nickname;
                int count = 0;
                while (userRepository.existsByNickname(nickname)) {
                    count++;
                    nickname = baseNickname + count;
                }

                // UserEntity 생성 및 저장
                // agreedPersonal은 소셜 로그인 시 기본값으로 true 설정 가정
                UserEntity newUser = new UserEntity(email, nickname, (String) payload.get("picture"));
                userRepository.save(newUser);
                userEntity = newUser;

            } else if (!userEntity.getLoginType().equals("GOOGLE")) {
                return SignInResponseDto.duplicateEmail();
            }

            // 5. 자체 JWT 토큰 생성 및 반환
            token = jwtProvider.create(email);

        } catch (GeneralSecurityException | IOException e) {
            // Google ID Token 검증 중 보안/IO 에러 발생
            e.printStackTrace();
            return SignInResponseDto.signInFail();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return SignInResponseDto.success(token);
    }

    private GoogleIdToken.Payload verifyGoogleIdToken(String idToken) throws GeneralSecurityException, IOException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
            .setAudience(Collections.singletonList(googleClientId)) // 환경변수에서 가져온 CLIENT_ID 사용
            .build();

        GoogleIdToken googleIdToken = verifier.verify(idToken);

        return (googleIdToken != null) ? googleIdToken.getPayload() : null;
    }

}
