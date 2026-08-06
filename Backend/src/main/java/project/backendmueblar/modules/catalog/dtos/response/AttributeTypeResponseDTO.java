package project.backendmueblar.modules.catalog.dtos.response;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class AttributeTypeResponseDTO {
    private String id;
    private String description;
}
