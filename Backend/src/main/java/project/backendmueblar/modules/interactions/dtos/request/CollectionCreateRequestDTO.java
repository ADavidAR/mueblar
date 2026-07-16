package project.backendmueblar.modules.interactions.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class CollectionCreateRequestDTO {
    @NotBlank(message = "El titulo es un campo obligatorio. No ha sido recibido")
    private String title;
}
