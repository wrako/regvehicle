package sk.zzs.vehicle.management.entity;

import jakarta.persistence.*;
import lombok.Data;
import sk.zzs.vehicle.management.enumer.NetworkPointType;
import sk.zzs.vehicle.management.enumer.OperationType;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "network_point_log")
public class NetworkPointLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long networkPointId;

    private String code;
    private String name;

    @Enumerated(EnumType.STRING)
    private NetworkPointType type;

    private LocalDate validFrom;
    private LocalDate validTo;

    // Provider information at time of operation
    private Long providerId;
    private String providerName;

    private Boolean archived;

    // audit info
    private String author;
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private OperationType operation;

}
