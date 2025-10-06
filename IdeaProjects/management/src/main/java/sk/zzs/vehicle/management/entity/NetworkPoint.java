package sk.zzs.vehicle.management.entity;

// NetworkPoint.java
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Where;
import sk.zzs.vehicle.management.enumer.NetworkPointType;

import java.time.LocalDate;

@Entity
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Where(clause = "archived = false")
public class NetworkPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Stabilný kód/názov podľa vyhlášky (unikátny) */
    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NetworkPointType type;

    /** Platnosť bodu v číselníku (voliteľné) */
    private LocalDate validFrom;
    private LocalDate validTo;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "provider_id", nullable = true)
    private Provider provider;

    @Column(nullable = false)
    private boolean archived = false;

    // getters/setters...
}
