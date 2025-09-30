package sk.zzs.vehicle.management.dto;

import org.springframework.stereotype.Component;
import sk.zzs.vehicle.management.entity.NetworkPoint;
import sk.zzs.vehicle.management.entity.Provider;

@Component
public class NetworkPointMapper {

    public NetworkPointDto toDto(NetworkPoint networkPoint) {
        if (networkPoint == null) return null;

        Long providerId = null;
        String providerName = null;

        try {
            if (networkPoint.getProvider() != null) {
                providerId = networkPoint.getProvider().getId();
                providerName = networkPoint.getProvider().getName();
            }
        } catch (Exception e) {
            // Handle cases where provider proxy cannot be initialized
            providerId = null;
            providerName = null;
        }

        return NetworkPointDto.builder()
                .id(networkPoint.getId())
                .code(networkPoint.getCode())
                .name(networkPoint.getName())
                .type(networkPoint.getType())
                .validFrom(networkPoint.getValidFrom())
                .validTo(networkPoint.getValidTo())
                .providerId(providerId)
                .providerName(providerName)
                .build();
    }

    public NetworkPointDto toDtoWithoutProvider(NetworkPoint networkPoint) {
        if (networkPoint == null) return null;

        return NetworkPointDto.builder()
                .id(networkPoint.getId())
                .code(networkPoint.getCode())
                .name(networkPoint.getName())
                .type(networkPoint.getType())
                .validFrom(networkPoint.getValidFrom())
                .validTo(networkPoint.getValidTo())
                .build();
    }

    public NetworkPoint toEntity(NetworkPointDto dto) {
        if (dto == null) return null;

        NetworkPoint networkPoint = new NetworkPoint();
        networkPoint.setId(dto.getId());
        networkPoint.setCode(dto.getCode());
        networkPoint.setName(dto.getName());
        networkPoint.setType(dto.getType());
        networkPoint.setValidFrom(dto.getValidFrom());
        networkPoint.setValidTo(dto.getValidTo());

        // Provider will be set by the service layer
        return networkPoint;
    }

    public void copyToEntity(NetworkPointDto dto, NetworkPoint networkPoint) {
        networkPoint.setCode(dto.getCode());
        networkPoint.setName(dto.getName());
        networkPoint.setType(dto.getType());
        networkPoint.setValidFrom(dto.getValidFrom());
        networkPoint.setValidTo(dto.getValidTo());
        // Provider will be set by the service layer
    }
}