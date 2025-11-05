package board.dto.response.user;

import board.common.ResponseCode;
import board.common.ResponseMessage;
import board.dto.response.ResponseDto;
import board.entity.UserEntity;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Getter
public class GetUserResponseDto extends ResponseDto {

    private String email;
    private String nickname;
    private String profileImage;

    private GetUserResponseDto(UserEntity userEntity) {
        super(ResponseCode.SUCCESS, ResponseMessage.SUCCESS);
        email = userEntity.getEmail();
        nickname = userEntity.getNickname();
        profileImage = userEntity.getProfileImage();
    }

    public static ResponseEntity<GetUserResponseDto> success(UserEntity userEntity) {
        GetUserResponseDto result = new GetUserResponseDto(userEntity);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    public static ResponseEntity<ResponseDto> notExistUser() {
        ResponseDto result = new ResponseDto(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }

}
