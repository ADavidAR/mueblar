package project.backendmueblar.modules.users.dtos.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class UserSummaryResponseDTO {
    private String apellido;
    private String email;
    private Long id;
    private String nombre;
    private boolean enabled;
    
    private RoleSummaryResponseDTO role;
}
