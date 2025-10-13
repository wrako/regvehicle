package sk.zzs.vehicle.management.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VehicleLogBlockDto {
    private Long providerId;
    private String providerName;
    private List<VehicleLogDto> logs;
}
