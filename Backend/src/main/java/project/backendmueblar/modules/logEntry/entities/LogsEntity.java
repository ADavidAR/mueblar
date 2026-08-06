package project.backendmueblar.modules.logEntry.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import project.backendmueblar.modules.users.entities.UserEntity;

import java.time.OffsetDateTime;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "bitacora")
public class LogsEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bitacora", nullable = false)
    private Long logId;

    @Column(name = "tabla_nombre", nullable = false)
    private String tableName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "valor_anterior", columnDefinition = "jsonb")
    private Map<String, Object> previousValues;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "valor_nuevo", columnDefinition = "jsonb")
    private Map<String, Object> newValues;

    @Column(name = "creado_at", nullable = false)
    private OffsetDateTime creationDate;

    @JoinColumn(name = "id_usuario", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private UserEntity userEntity;

    @JoinColumn(name = "id_operacion", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private OperationTypeEntity operationTypeEntity;
}
