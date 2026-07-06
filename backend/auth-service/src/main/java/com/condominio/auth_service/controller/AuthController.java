package com.condominio.auth_service.controller;

import com.condominio.auth_service.dto.AuthRequest;
import com.condominio.auth_service.dto.AuthResponse;
import com.condominio.auth_service.dto.RegisterRequest;
import com.condominio.auth_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.condominio.auth_service.dto.UserDto;
import com.condominio.auth_service.dto.ChangePasswordRequest;
import com.condominio.auth_service.dto.ChangeRoleRequest;
import java.util.List;
import java.security.Principal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(
            @RequestBody AuthRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @RequestBody ChangePasswordRequest request,
            Principal principal
    ) {
        service.changePassword(principal.getName(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/users/{id}/password")
    public ResponseEntity<Void> adminChangePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request
    ) {
        service.adminChangePassword(id, request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/users/{id}/role")
    public ResponseEntity<Void> adminChangeRole(
            @PathVariable Long id,
            @RequestBody ChangeRoleRequest request
    ) {
        service.adminChangeRole(id, request.getNewRole());
        return ResponseEntity.ok().build();
    }
}
