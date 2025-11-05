package board.controller;

import board.dto.request.auth.GoogleAuthRequestDto;
import board.dto.request.auth.SignInRequestDto;
import board.dto.request.auth.SignUpRequestDto;
import board.dto.response.auth.SignInResponseDto;
import board.dto.response.auth.SignUpResponseDto;
import board.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/sign-up")
    public ResponseEntity<? super SignUpResponseDto> signUp(@RequestBody @Valid SignUpRequestDto requestBody) {
        ResponseEntity<? super SignUpResponseDto> response = authService.signUp(requestBody);

        return response;
    }

    @PostMapping("/sign-in")
    public ResponseEntity<? super SignInResponseDto> signIn(@RequestBody @Valid SignInRequestDto requestBody) {
        ResponseEntity<? super SignInResponseDto> response = authService.signIn(requestBody);

        return response;
    }

    @PostMapping("/google")
    public ResponseEntity<? super SignInResponseDto> googleAuth(@RequestBody @Valid GoogleAuthRequestDto requestBody) {
        ResponseEntity<? super SignInResponseDto> response = authService.googleAuth(requestBody);

        return response;
    }

}
