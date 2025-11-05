package board.filter;

import board.provider.JwtProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String requestUri = request.getRequestURI();
        System.out.println("Request Path = " + requestUri);

        // ⭐️ 추가된 코드: /api/v1/file 요청에 대해서는 필터링 로직을 아예 건너뛰고 다음 체인으로 넘깁니다.
        if (requestUri.startsWith("/api/v1/file")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = parseBearerToken(request);

            if (token == null) {
                filterChain.doFilter(request, response);
                return;
            }

            String email = jwtProvider.validate(token);

            if (email == null) {
                filterChain.doFilter(request, response);
                return;
            }

            AbstractAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(
                    email,
                    null,
                    AuthorityUtils.NO_AUTHORITIES
                );

            authenticationToken.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request)
            );

            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authenticationToken);

            SecurityContextHolder.setContext(securityContext);
        } catch (Exception exception) {
            exception.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private String parseBearerToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");

        boolean hasAuthorization = StringUtils.hasText(authorization);
        if (!hasAuthorization)
            return null;

        boolean isBearer = authorization.startsWith("Bearer ");
        if (!isBearer)
            return null;

        String token = authorization.substring(7);

        return token;
    }

    /**
     * shouldNotFilter는 사용하지 않고, doFilterInternal 내에서 명시적으로 제외 처리합니다.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // doFilterInternal에서 처리하므로 여기서 특별히 제외할 경로는 없음.
        // 하지만 기존 코드를 유지하여 /auth, /search 경로에 대한 필터링 제외도 보장합니다.
        String path = request.getRequestURI();
        return path.startsWith("/api/v1/auth") ||
            path.startsWith("/api/v1/search");
    }

}
