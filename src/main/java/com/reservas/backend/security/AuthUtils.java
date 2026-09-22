package com.reservas.backend.security;

import com.reservas.backend.common.exceptions.ForbiddenException;
import com.reservas.backend.common.exceptions.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.UUID;

public final class AuthUtils {

    private AuthUtils() {}

    public static UUID currentUserId(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof UUID userId)) {
            throw new UnauthorizedException("No autenticado");
        }
        return userId;
    }

    public static boolean hasRole(Authentication auth, String role) {
        if (auth == null) return false;
        String target = "ROLE_" + role;
        for (GrantedAuthority authority : auth.getAuthorities()) {
            if (target.equals(authority.getAuthority())) return true;
        }
        return false;
    }

    public static void requireRole(Authentication auth, String role, String errorMessage) {
        if (!hasRole(auth, role)) {
            throw new ForbiddenException(errorMessage);
        }
    }

    public static void requireSelf(Authentication auth, UUID resourceOwnerId, String errorMessage) {
        if (!currentUserId(auth).equals(resourceOwnerId)) {
            throw new ForbiddenException(errorMessage);
        }
    }
}
