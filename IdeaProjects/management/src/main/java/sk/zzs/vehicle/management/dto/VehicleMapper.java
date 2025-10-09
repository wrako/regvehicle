package sk.zzs.vehicle.management.dto;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Component;
import sk.zzs.vehicle.management.entity.*;
import sk.zzs.vehicle.management.repository.ProviderRepository;
import sk.zzs.vehicle.management.service.ProviderService;

@Component
public class VehicleMapper {

    private final ProviderService providerService;
    private final ProviderRepository providerRepository;

    @PersistenceContext
    private EntityManager em;

    public VehicleMapper(ProviderService providerService, ProviderRepository providerRepository) {
        this.providerService = providerService;
        this.providerRepository = providerRepository;
    }

    public VehicleDto toDto(Vehicle v) {
        if (v == null) return null;

        // When vehicle is archived, resolve provider from archived source (bypassing @Where filter)
        Provider provider = null;
        Long providerId = null;
        String providerName = null;

        if (v.isArchived()) {
            // For archived vehicles, query provider_id directly to avoid Hibernate proxy issues
            Object providerIdObj = em.createNativeQuery("SELECT provider_id FROM vehicle WHERE id = :id")
                    .setParameter("id", v.getId())
                    .getSingleResult();
            if (providerIdObj != null) {
                providerId = ((Number) providerIdObj).longValue();
                provider = providerRepository.findByIdIncludingArchived(providerId).orElse(null);
                providerName = provider != null ? provider.getName() : null;
            }
        } else {
            // For active vehicles, use the standard relationship (already filtered by @Where)
            provider = v.getProvider();
            providerId = provider != null ? provider.getId() : null;
            providerName = provider != null ? provider.getName() : null;
        }

        return VehicleDto.builder()
                .id(v.getId())
                .licensePlate(v.getLicensePlate())
                .vinNum(v.getVinNum())
                .brand(v.getBrand())
                .model(v.getModel())
                .firstRegistrationDate(v.getFirstRegistrationDate())
                .lastTechnicalCheckDate(v.getLastTechnicalCheckDate())
                .technicalCheckValidUntil(v.getTechnicalCheckValidUntil())
                .status(v.getStatus())
                .providerId(providerId)
                .providerName(providerName)
                .providerAssignmentStartDate(v.getProviderAssignmentStartDate())
                .providerAssignmentEndDate(v.getProviderAssignmentEndDate())
//                .avlDeviceId(v.getAvlDevice() != null ? v.getAvlDevice().getId() : null)
//                .rdstDeviceId(v.getRdstDevice() != null ? v.getRdstDevice().getId() : null)

                .filePaths(v.getFilePaths())
                .build();
    }

    public Vehicle toEntity(VehicleDto d) {
        if (d == null) return null;

        Vehicle v = new Vehicle();
        v.setId(d.getId());
        v.setLicensePlate(d.getLicensePlate());
        v.setVinNum(d.getVinNum());
        v.setBrand(d.getBrand());
        v.setModel(d.getModel());
        v.setFirstRegistrationDate(d.getFirstRegistrationDate());
        v.setLastTechnicalCheckDate(d.getLastTechnicalCheckDate());
        v.setTechnicalCheckValidUntil(d.getTechnicalCheckValidUntil());
        v.setStatus(d.getStatus());
        v.setFilePaths(d.getFilePaths());

        v.setProvider(d.getProviderId() != null
                ? providerService.findById(d.getProviderId())
                : null);
        v.setProviderAssignmentStartDate(d.getProviderAssignmentStartDate());
        v.setProviderAssignmentEndDate(d.getProviderAssignmentEndDate());

        System.out.println("==========================================");
        System.out.println(d.getProviderId());
        System.out.println("==========================================");


//        if (d.getAvlDeviceId() != null) {
//            AvlDevice avl = new AvlDevice();
//            avl.setId(d.getAvlDeviceId());
//            v.setAvlDevice(avl);
//        }
//
//        if (d.getRdstDeviceId() != null) {
//            RdstDevice rdst = new RdstDevice();
//            rdst.setId(d.getRdstDeviceId());
//            v.setRdstDevice(rdst);
//        }

        return v;
    }

    public void copyToEntity(VehicleDto d, Vehicle v) {
        v.setLicensePlate(d.getLicensePlate());
        v.setVinNum(d.getVinNum());
        v.setBrand(d.getBrand());
        v.setModel(d.getModel());
        v.setFirstRegistrationDate(d.getFirstRegistrationDate());
        v.setLastTechnicalCheckDate(d.getLastTechnicalCheckDate());
        v.setTechnicalCheckValidUntil(d.getTechnicalCheckValidUntil());
        v.setStatus(d.getStatus());
        v.setFilePaths(d.getFilePaths());

        v.setProvider    (d.getProviderId()     != null ? em.getReference(Provider.class,     d.getProviderId())     : null);
        v.setProviderAssignmentStartDate(d.getProviderAssignmentStartDate());
        v.setProviderAssignmentEndDate(d.getProviderAssignmentEndDate());
//        v.setAvlDevice   (d.getAvlDeviceId()    != null ? em.getReference(AvlDevice.class,    d.getAvlDeviceId())    : null);
//        v.setRdstDevice  (d.getRdstDeviceId()   != null ? em.getReference(RdstDevice.class,   d.getRdstDeviceId())   : null);
    }
}
