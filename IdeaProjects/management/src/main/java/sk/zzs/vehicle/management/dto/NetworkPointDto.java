package sk.zzs.vehicle.management.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import sk.zzs.vehicle.management.enumer.NetworkPointType;

import java.time.LocalDate;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NetworkPointDto {
    private Long id;
    private String code;
    private String name;
    private NetworkPointType type;
    private LocalDate validFrom;
    private LocalDate validTo;

    // Owner (metadata only, not operational)
    private Long providerId;
    private String providerName;

    // Queue fields for CREATE/EDIT
    private Long queueProviderId;  // For adding provider to queue on create
    private LocalDate providerRegistrationEndDate;  // End date for queue entry

    // Current provider from queue (position 0)
    private Long currentProviderId;
    private String currentProviderName;

    // Full queue for display
    private List<ProviderNetworkPointRegistrationDto> providerQueue;
}