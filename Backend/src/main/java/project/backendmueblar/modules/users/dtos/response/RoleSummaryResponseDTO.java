package project.backendmueblar.modules.users.dtos.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class RoleSummaryResponseDTO {
    private Long id;
    private String name;
    private boolean editable;
}
