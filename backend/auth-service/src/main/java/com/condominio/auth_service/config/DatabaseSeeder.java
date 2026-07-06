package com.condominio.auth_service.config;

import com.condominio.auth_service.model.Role;
import com.condominio.auth_service.model.User;
import com.condominio.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin"))
                    .role(Role.ADMIN)
                    .build();

            User residente = User.builder()
                    .username("residente")
                    .password(passwordEncoder.encode("residente"))
                    .role(Role.RESIDENTE)
                    .build();

            User residente1 = User.builder()
                    .username("residente1")
                    .password(passwordEncoder.encode("residente1"))
                    .role(Role.RESIDENTE)
                    .build();

            userRepository.save(admin);
            userRepository.save(residente);
            userRepository.save(residente1);
            
            System.out.println("Database seeded with default users (admin, residente, residente1)");
        }
    }
}
