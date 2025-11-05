package board.service;

import board.dto.request.auth.GoogleAuthRequestDto;
import board.dto.request.auth.SignInRequestDto;
import board.dto.request.auth.SignUpRequestDto;
import board.dto.response.auth.SignInResponseDto;
import board.dto.response.auth.SignUpResponseDto;
import org.springframework.http.ResponseEntity;

public interface AuthService {

    ResponseEntity<? super SignUpResponseDto> signUp(SignUpRequestDto dto);
    ResponseEntity<? super SignInResponseDto> signIn(SignInRequestDto dto);
    ResponseEntity<? super SignInResponseDto> googleAuth(GoogleAuthRequestDto dto);

}
