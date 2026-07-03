package project.backendmueblar.modules.auth.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import project.backendmueblar.modules.users.entities.UserEntity;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "token_recuperacion")
public class RecoveryTokenEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_token")
    private Long tokenId;

    @Column(name = "token_", unique = true, nullable = false)
    private String token;

    @Column(name = "creado_at", nullable = false)
    private OffsetDateTime createdAt;

    @JoinColumn(name = "id_usuario", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private UserEntity userEntity;
}
