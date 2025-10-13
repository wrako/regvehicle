package sk.zzs.vehicle.management.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

/**
 * Represents a provider's registration in a NetworkPoint's queue.
 * This is the queue entry that tracks when a provider is assigned to operate at a network point.
 */
@Entity
@Table(name = "provider_network_point_registration")
@Data
public class ProviderNetworkPointRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "network_point_id", nullable = false)
    private NetworkPoint networkPoint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Column(nullable = false)
    private LocalDate registrationStartDate;

    @Column(nullable = false)
    private LocalDate registrationEndDate;

    /**
     * Queue position - lower number = higher priority.
     * Position 0 = current active provider
     */
    @Column(nullable = false)
    private Integer queuePosition;

    /**
     * Whether this registration is currently active (current provider)
     */
    @Column(nullable = false)
    private boolean current = false;
}
