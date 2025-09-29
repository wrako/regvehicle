package sk.zzs.vehicle.management.entity;

import jakarta.persistence.*;
import lombok.Data;
import sk.zzs.vehicle.management.enumer.OperationType;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
public class VehicleLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long vehicleId;

    private String licensePlate;
    private String vinNum;

    private String brand;
    private String model;

    private LocalDate firstRegistrationDate;
    private LocalDate lastTechnicalCheckDate;
    private LocalDate technicalCheckValidUntil;
    private String status;

    private String certificateFilePath;

    // audit info
    private String author;
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private OperationType operation;

}

