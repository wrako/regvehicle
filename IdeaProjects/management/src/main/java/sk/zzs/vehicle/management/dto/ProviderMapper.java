package sk.zzs.vehicle.management.dto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import sk.zzs.vehicle.management.entity.Provider;

import java.util.stream.Collectors;

@Component
public class ProviderMapper {

    @Autowired
    private NetworkPointMapper networkPointMapper;

    public ProviderDto toDto(Provider provider) {
        if (provider == null) return null;

        return ProviderDto.builder()
                .id(provider.getId())
                .providerId(provider.getProviderId())
                .name(provider.getName())
                .address(provider.getAddress())
                .networkPoints(provider.getNetworkPoints() != null
                    ? provider.getNetworkPoints().stream()
                        .map(networkPointMapper::toDtoWithoutProvider)
                        .collect(Collectors.toList())
                    : null)
                .build();
    }

    public ProviderDto toDtoWithoutNetworkPoints(Provider provider) {
        if (provider == null) return null;

        return ProviderDto.builder()
                .id(provider.getId())
                .providerId(provider.getProviderId())
                .name(provider.getName())
                .address(provider.getAddress())
                .build();
    }

    public Provider toEntity(ProviderDto dto) {
        if (dto == null) return null;

        Provider provider = new Provider();
        provider.setId(dto.getId());
        provider.setProviderId(dto.getProviderId());
        provider.setName(dto.getName());
        provider.setAddress(dto.getAddress());

        return provider;
    }

    public void copyToEntity(ProviderDto dto, Provider provider) {
        provider.setProviderId(dto.getProviderId());
        provider.setName(dto.getName());
        provider.setAddress(dto.getAddress());
    }
}