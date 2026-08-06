package project.backendmueblar.modules.users.dtos.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter

public class RoleResponseDTO {
    private boolean editable;
    private Long id;
    private String name;
    private List<PermissionResponseDTO> permissions;
}
