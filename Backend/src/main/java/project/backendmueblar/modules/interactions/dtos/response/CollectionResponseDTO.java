package project.backendmueblar.modules.interactions.dtos.response;

import lombok.Getter;
import lombok.Setter;
import project.backendmueblar.modules.catalog.dtos.ProductSummaryDTO;

import java.util.List;
@Setter
@Getter
public class CollectionResponseDTO {
    private Long id;
    private List<ProductSummaryDTO> products;
    private String title;
}
