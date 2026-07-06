package com.condominio.auth_service.service;

import com.condominio.auth_service.dto.AuthRequest;
import com.condominio.auth_service.dto.AuthResponse;
import com.condominio.auth_service.dto.RegisterRequest;
import com.condominio.auth_service.dto.ChangePasswordRequest;
import com.condominio.auth_service.dto.ChangeRoleRequest;
import com.condominio.auth_service.model.Role;
import com.condominio.auth_service.model.User;
import com.condominio.auth_service.repository.UserRepository;
import com.condominio.auth_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import com.condominio.auth_service.dto.UserDto;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        var user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.valueOf(request.getRole()))
                .build();
        repository.save(user);
        var jwtToken = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user = repository.findByUsername(request.getUsername())
                .orElseThrow();
        var jwtToken = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    public List<UserDto> getAllUsers() {
        return repository.findAll().stream()
                .map(user -> UserDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .role(user.getRole().name())
                        .build())
                .collect(Collectors.toList());
    }

    public void changePassword(String username, String newPassword) {
        var user = repository.findByUsername(username).orElseThrow();
        user.setPassword(passwordEncoder.encode(newPassword));
        repository.save(user);
    }

    public void adminChangePassword(Long userId, String newPassword) {
        var user = repository.findById(userId).orElseThrow();
        user.setPassword(passwordEncoder.encode(newPassword));
        repository.save(user);
    }

    public void adminChangeRole(Long userId, String newRole) {
        var user = repository.findById(userId).orElseThrow();
        user.setRole(Role.valueOf(newRole));
        repository.save(user);
    }
}
