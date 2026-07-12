package project.backendmueblar.modules.catalog.dtos.response;

import lombok.Getter;
import lombok.Setter;
import project.backendmueblar.modules.catalog.dtos.AttribTypeSummaryForCreatingDTO;
import project.backendmueblar.modules.catalog.dtos.VariationSummaryDTO;

@Getter
@Setter
public class AttributeResponseDTO {
    private String id;
    private String value;
    private VariationSummaryDTO variation;
    private AttribTypeSummaryForCreatingDTO atribType;
}
