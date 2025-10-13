package sk.zzs.vehicle.management.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProviderNetworkPointRegistrationDto {
    private Long id;
    private Long networkPointId;
    private Long providerId;
    private String providerName;
    private LocalDate registrationStartDate;
    private LocalDate registrationEndDate;
    private Integer queuePosition;
    private boolean current;
}
