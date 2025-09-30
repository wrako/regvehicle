package sk.zzs.vehicle.management.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import sk.zzs.vehicle.management.enumer.NetworkPointType;

import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NetworkPointDto {
    private Long id;
    private String code;
    private String name;
    private NetworkPointType type;
    private LocalDate validFrom;
    private LocalDate validTo;
    private Long providerId;
    private String providerName;
}