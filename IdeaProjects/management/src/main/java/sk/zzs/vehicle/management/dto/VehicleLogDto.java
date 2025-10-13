package sk.zzs.vehicle.management.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VehicleLogDto {
    private Long id;
    private Long vehicleId;
    private String licensePlate;
    private String vinNum;
    private String brand;
    private String model;
    private LocalDate firstRegistrationDate;
    private LocalDate lastTechnicalCheckDate;
    private LocalDate technicalCheckValidUntil;
    private Long providerId;
    private String providerName;
    private String author;
    private LocalDateTime timestamp;
    private String timestampFormatted;
    private String operation;
}
