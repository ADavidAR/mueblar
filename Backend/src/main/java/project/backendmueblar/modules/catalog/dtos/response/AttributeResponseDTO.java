package project.backendmueblar.modules.catalog.dtos.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;
import project.backendmueblar.modules.catalog.dtos.AttribTypeSummaryForCreatingDTO;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)

public class AttributeResponseDTO {
    private String id;
    private String value;
    private VariationSummaryDTO variation;
    private AttribTypeSummaryForCreatingDTO atribType;
}
