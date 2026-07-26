package project.backendmueblar.modules.users.dtos.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileSummaryResponseDTO {
    private String lastName;
    private String firstName;
    private String email;
}
