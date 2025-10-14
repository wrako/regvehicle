package sk.zzs.vehicle.management.entity;

import jakarta.persistence.*;
import lombok.Data;
import sk.zzs.vehicle.management.enumer.OperationType;

import java.time.LocalDateTime;

@Entity
@Data
public class ProviderLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long providerId;

    private String name;
    private String email;
    private String providerIdField;
    private String address;
    private String state;
    private Boolean archived;

    // audit info
    private String author;
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private OperationType operation;

}
