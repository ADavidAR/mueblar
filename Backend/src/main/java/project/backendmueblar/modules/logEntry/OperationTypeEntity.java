package project.backendmueblar.modules.logEntry;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "tipo_operacion")
public class OperationTypeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_operacion")
    private Long operationTypeId;

    @Column(name = "nombre_operacion")
    private String operationTypeName;

    @OneToMany(mappedBy = "operationTypeEntity", fetch = FetchType.LAZY)
    private List<LogsEntity> logsEntityList;
}
