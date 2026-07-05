package project.backendmueblar.modules.catalog.dtos.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import project.backendmueblar.modules.catalog.dtos.response.AttributeSummaryResponseDTO;

import java.util.List;
import java.util.Map;

@Getter
@Setter

public class VariationRequestDTO {
    @NotBlank(message = "El SKU de la Variacion no ha sido recibida. Esto es un campo obligatorio")
    private String sku; //

    @NotBlank(message = "El Nombre de la Variacion no fue recibido. Esto es un campo obligatorio")
    private String name; //

    @NotBlank(message = "La URL del Modelo 3D no fue recibida. Esto es un campo obligatorio")
    private String model_3d; //

    @NotBlank(message = "La URL de la Miniatura principal no ha sido recibida. Esto es un campo obligatorio")
    private String thumbnail; //

    @NotNull(message = "El Precio de la Variacion no ha sido recibido. Esto es un campo obligatorio")
    private Integer price; //

    @NotNull(message = "No se determino si la Variacion se encuentra al Frente o No. Campo obligatorio")
    private Boolean top; //

    @NotNull(message = "No se determino si la Variacion se encuentra habilitada o no. Campo obligatorio")
    private Boolean enabled; //

    @NotEmpty(message = "No se determino ningun parametro de instanciacion. Campo obligatorio")
    private Map<String, Object> instance_params; //

    @NotEmpty(message = "No se determino ninguna URL para Miniatura alguna, esto es un campo obligatorio")
    private List<String> imgs; //

    @Valid
    @NotEmpty(message = "No fue recibido atributo alguno relacionado a la Variacion. Campo obligatorio")
    private List<AttributeSummaryRequestDTO> atribs;
}
