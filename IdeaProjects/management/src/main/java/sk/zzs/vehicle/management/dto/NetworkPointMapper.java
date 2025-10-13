package sk.zzs.vehicle.management.dto;

import org.springframework.stereotype.Component;
import sk.zzs.vehicle.management.entity.NetworkPoint;
import sk.zzs.vehicle.management.entity.Provider;
import sk.zzs.vehicle.management.entity.ProviderNetworkPointRegistration;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class NetworkPointMapper {

    public NetworkPointDto toDto(NetworkPoint networkPoint) {
        if (networkPoint == null) return null;

        Long ownerId = null;
        String ownerName = null;

        try {
            if (networkPoint.getOwner() != null) {
                ownerId = networkPoint.getOwner().getId();
                ownerName = networkPoint.getOwner().getName();
            }
        } catch (Exception e) {
            ownerId = null;
            ownerName = null;
        }

        // Map current provider from queue
        Provider currentProvider = networkPoint.getCurrentProvider();
        Long currentProviderId = null;
        String currentProviderName = null;

        if (currentProvider != null) {
            try {
                currentProviderId = currentProvider.getId();
                currentProviderName = currentProvider.getName();
            } catch (Exception e) {
                currentProviderId = null;
                currentProviderName = null;
            }
        }

        // Map queue
        List<ProviderNetworkPointRegistrationDto> queueDtos = null;
        try {
            if (networkPoint.getProviderQueue() != null) {
                queueDtos = networkPoint.getProviderQueue().stream()
                        .map(this::toRegistrationDto)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            queueDtos = null;
        }

        return NetworkPointDto.builder()
                .id(networkPoint.getId())
                .code(networkPoint.getCode())
                .name(networkPoint.getName())
                .type(networkPoint.getType())
                .validFrom(networkPoint.getValidFrom())
                .validTo(networkPoint.getValidTo())
                .providerId(ownerId)
                .providerName(ownerName)
                .currentProviderId(currentProviderId)
                .currentProviderName(currentProviderName)
                .providerQueue(queueDtos)
                .build();
    }

    private ProviderNetworkPointRegistrationDto toRegistrationDto(ProviderNetworkPointRegistration reg) {
        if (reg == null) return null;

        String providerName = null;
        try {
            if (reg.getProvider() != null) {
                providerName = reg.getProvider().getName();
            }
        } catch (Exception e) {
            providerName = null;
        }

        return ProviderNetworkPointRegistrationDto.builder()
                .id(reg.getId())
                .networkPointId(reg.getNetworkPoint() != null ? reg.getNetworkPoint().getId() : null)
                .providerId(reg.getProvider() != null ? reg.getProvider().getId() : null)
                .providerName(providerName)
                .registrationStartDate(reg.getRegistrationStartDate())
                .registrationEndDate(reg.getRegistrationEndDate())
                .queuePosition(reg.getQueuePosition())
                .current(reg.isCurrent())
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