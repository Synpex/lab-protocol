package com.mci.integrative_project.directory_server.security;

import java.io.IOException;
import java.util.Collections;
import java.util.Set;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DirectoryApiKeyFilter extends OncePerRequestFilter {
    public static final String TEAM_ATTRIBUTE = "directoryApiKeyTeam";
    private static final Set<String> WRITE_METHODS = Set.of("POST", "PUT", "DELETE", "PATCH");
    private final DirectoryApiKeys apiKeys;

    public DirectoryApiKeyFilter(DirectoryApiKeys apiKeys) {
        this.apiKeys = apiKeys;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        // Protect all writes before MVC binding, without relying on controller path matching.
        if (WRITE_METHODS.contains(request.getMethod())) {
            var headers = Collections.list(request.getHeaders("X-API-Key"));
            String team = headers.size() == 1 ? apiKeys.authenticate(headers.getFirst()) : null;
            if (team == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setHeader("WWW-Authenticate", "ApiKey realm=\"directory-server\"");
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"INVALID_API_KEY\"}");
                return;
            }
            request.setAttribute(TEAM_ATTRIBUTE, team);
        }
        filterChain.doFilter(request, response);
    }
}
