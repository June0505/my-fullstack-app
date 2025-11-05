package board.entity;

import board.dto.request.auth.SignUpRequestDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "user")
@Table(name = "user")
public class UserEntity {

    @Id
    private String email;

    private String password;

    private String nickname;
    private String profileImage;

    @Column(nullable = false)
    private String loginType;

    public UserEntity(SignUpRequestDto dto) {
        this.email = dto.getEmail();
        this.password = dto.getPassword();
        this.nickname = dto.getNickname();
        this.loginType = "STANDARD";
    }

    public UserEntity(String email, String nickname, String profileImage) {
        this.email = email;
        this.password = null;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.loginType = "GOOGLE";
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

}
