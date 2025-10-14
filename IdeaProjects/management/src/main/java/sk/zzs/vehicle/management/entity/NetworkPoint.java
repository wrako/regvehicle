package sk.zzs.vehicle.management.entity;

// NetworkPoint.java
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Where;
import sk.zzs.vehicle.management.enumer.NetworkPointType;
import sk.zzs.vehicle.management.listener.NetworkPointListener;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@EntityListeners(NetworkPointListener.class)
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

    /** NetworkPoint's own validity dates - REQUIRED */
    private LocalDate validFrom;

    @Column(nullable = false)
    private LocalDate validTo;

    /**
     * Simple ownership - metadata only, does NOT make provider "current"
     * A Provider may own many NetworkPoints (one-to-many)
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "provider_id", nullable = true)
    private Provider owner;

    /**
     * Provider queue for operational assignment
     * Ordered by queuePosition (0 = current)
     */
    @OneToMany(mappedBy = "networkPoint", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("queuePosition ASC")
    private List<ProviderNetworkPointRegistration> providerQueue = new ArrayList<>();

    @Column(nullable = false)
    private boolean archived = false;

    /**
     * Get the current active provider from the queue (position 0)
     */
    @Transient
    public Provider getCurrentProvider() {
        return providerQueue.stream()
                .filter(reg -> reg.getQueuePosition() == 0 && reg.isCurrent())
                .findFirst()
                .map(ProviderNetworkPointRegistration::getProvider)
                .orElse(null);
    }
}
