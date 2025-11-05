package board.service.implement;

import board.dto.request.user.PatchNicknameRequestDto;
import board.dto.request.user.PatchProfileImageRequestDto;
import board.dto.response.ResponseDto;
import board.dto.response.user.GetSignInUserResponseDto;
import board.dto.response.user.GetUserResponseDto;
import board.dto.response.user.PatchNicknameResponseDto;
import board.dto.response.user.PatchProfileImageResponseDto;
import board.entity.UserEntity;
import board.repository.UserRepository;
import board.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public ResponseEntity<? super GetUserResponseDto> getUser(String email) {
        UserEntity userEntity;

        try {

            userEntity = userRepository.findByEmail(email);
            if (userEntity == null)
                return GetUserResponseDto.notExistUser();

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetUserResponseDto.success(userEntity);
    }

    @Override
    public ResponseEntity<? super GetSignInUserResponseDto> getSignInUser(String email) {
        UserEntity userEntity = null;

        try {
            userEntity = userRepository.findByEmail(email);
            if (userEntity == null)
                return GetSignInUserResponseDto.notExistUser();

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetSignInUserResponseDto.success(userEntity);
    }

    @Override
    public ResponseEntity<? super PatchNicknameResponseDto> patchNickname(PatchNicknameRequestDto dto, String email) {
        try {
            UserEntity userEntity = userRepository.findByEmail(email);
            if (userEntity == null)
                return PatchNicknameResponseDto.notExistUser();

            String newNickname = dto.getNickname();
            if (!newNickname.equals(userEntity.getNickname())) {
                boolean existedNickname = userRepository.existsByNickname(newNickname);
                if (existedNickname)
                    return PatchNicknameResponseDto.duplicatedNickname();
            }

            userEntity.setNickname(newNickname);
            userRepository.save(userEntity);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }
        return PatchNicknameResponseDto.success();
    }

    @Override
    public ResponseEntity<? super PatchProfileImageResponseDto> patchProfileImage(PatchProfileImageRequestDto dto, String email) {

        try {

            UserEntity userEntity = userRepository.findByEmail(email);
            if (userEntity == null)
                return PatchProfileImageResponseDto.notExistUser();

            String profileImage = dto.getProfileImage();
            userEntity.setProfileImage(profileImage);
            userRepository.save(userEntity);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.databaseError();
        }

        return PatchProfileImageResponseDto.success();
    }

}
