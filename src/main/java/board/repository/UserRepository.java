package board.repository;

import board.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {

    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);

    UserEntity findByEmail(String email);

    String email(String email);
}
