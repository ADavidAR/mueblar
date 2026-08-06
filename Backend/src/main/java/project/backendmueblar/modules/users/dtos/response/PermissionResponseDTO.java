package project.backendmueblar.modules.users.dtos.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class PermissionResponseDTO {
    private boolean access;
    private boolean create;
    private boolean delete;
    private boolean modify;
    private String description;
    private String endpoint;
    private Long id;
}
