package board.service;

import board.dto.request.user.PatchNicknameRequestDto;
import board.dto.request.user.PatchProfileImageRequestDto;
import board.dto.response.user.GetSignInUserResponseDto;
import board.dto.response.user.GetUserResponseDto;
import board.dto.response.user.PatchNicknameResponseDto;
import board.dto.response.user.PatchProfileImageResponseDto;
import org.springframework.http.ResponseEntity;

public interface UserService {
    ResponseEntity<? super GetUserResponseDto> getUser(String email);
    ResponseEntity<? super GetSignInUserResponseDto> getSignInUser(String email);
    ResponseEntity<? super PatchNicknameResponseDto> patchNickname(PatchNicknameRequestDto dto, String email);
    ResponseEntity<? super PatchProfileImageResponseDto> patchProfileImage(PatchProfileImageRequestDto dto, String email);
}
