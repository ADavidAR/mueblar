package project.backendmueblar.modules.catalog.dtos.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class VariationResponseDTO {
    private String sku; //
    private String name; //
    private String model_3d; //
    private String thumbnail; //
    private Integer price; //
    private Boolean top; //
    private Boolean enabled; //
    private Map<String, Object> instance_params; //
    private List<String> imgs; //
    private List<AttributeSummaryResponseDTO> atribs;
}
