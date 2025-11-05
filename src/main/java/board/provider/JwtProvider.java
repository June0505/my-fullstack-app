package board.provider;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Component
public class JwtProvider {

    private final Key key;

    public JwtProvider(@Value("${secret-key}") String secretKey) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String create(String email) {
        Date expiredDate = Date.from(Instant.now().plus(1, ChronoUnit.HOURS));

        return Jwts.builder()
            .setSubject(email)
            .setIssuedAt(new Date())
            .setExpiration(expiredDate)
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    public String validate(String jwt) {
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(jwt)
                .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
