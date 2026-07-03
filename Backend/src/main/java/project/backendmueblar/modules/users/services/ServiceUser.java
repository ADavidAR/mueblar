package project.backendmueblar.modules.users.services;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.backendmueblar.modules.users.repositories.RepositoryUser;

@Service
public class ServiceUser {
    @NotBlank(message = "No se envio una URL")
    private String url;
}
