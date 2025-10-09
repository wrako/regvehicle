package sk.zzs.vehicle.management.service;

import jakarta.persistence.NoResultException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import sk.zzs.vehicle.management.dto.VehicleDto;
import sk.zzs.vehicle.management.dto.VehicleFilter;
import sk.zzs.vehicle.management.dto.VehicleMapper;
import sk.zzs.vehicle.management.entity.Provider;
import sk.zzs.vehicle.management.entity.Vehicle;
import sk.zzs.vehicle.management.enumer.VehicleStatus;
import sk.zzs.vehicle.management.repository.VehicleRepository;
import sk.zzs.vehicle.management.repository.VehicleSpecifications;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Transactional
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleMapper vehicleMapper;

    // Base folder where files will be stored (adjust for your OS/env)
    private static final Path BASE_UPLOAD_DIR = Paths.get("C:/uploads/vehicles");

    @Transactional(readOnly = true)
    public List<VehicleDto> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream()
                .map(vehicleMapper::toDto)
                .toList();
    }

    public Page<VehicleDto> search(VehicleFilter filter, Pageable pageable) {
        return vehicleRepository
                .findAll(VehicleSpecifications.withFilter(filter), pageable)
                .map(vehicleMapper::toDto);
    }

    public VehicleDto registerVehicle(VehicleDto dto) {
        // Validate: Provider and endDate are MANDATORY on create
        if (dto.getProviderId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provider is required when creating a vehicle");
        }
        if (dto.getProviderAssignmentEndDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provider assignment end date is required");
        }

        // Auto-set startDate to today
        dto.setProviderAssignmentStartDate(java.time.LocalDate.now());

        Vehicle entity = vehicleMapper.toEntity(dto);

        // NEW: archive previous active vehicle with same VIN and mark new as PREREGISTERED
        if (dto.getVinNum() != null && !dto.getVinNum().isBlank()) {
            Optional<Vehicle> existingOpt = vehicleRepository.findByVinNum(dto.getVinNum());
            if (existingOpt.isPresent()) {
                Vehicle existing = existingOpt.get();
                // archive existing active vehicle (keep your audit parameters)
                existing.setStatus(VehicleStatus.DEREGISTERED);
                vehicleRepository.archiveById(existing.getId(), "system", "VIN replaced by new registration");
                entity.setStatus(VehicleStatus.PREREGISTERED);
            }
        }

        Vehicle saved = vehicleRepository.save(entity);
        return vehicleMapper.toDto(saved);
    }

    public VehicleDto editVehicle(VehicleDto dto, Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Vehicle id is required for edit");
        }

        Vehicle entity = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle with id " + id + " not found"));

        // Check if provider is being removed (manual unassign)
        boolean hadProvider = entity.getProvider() != null;
        boolean removingProvider = hadProvider && (dto.getProviderId() == null || dto.getProviderId() == 0);

        // If provider is being removed → automatically archive the vehicle
        if (removingProvider) {
            entity.setProvider(null);
            entity.setProviderAssignmentStartDate(null);
            entity.setProviderAssignmentEndDate(null);
            entity.setArchived(true);
            entity.setStatus(VehicleStatus.DEREGISTERED);
            Vehicle saved = vehicleRepository.save(entity);
            return vehicleMapper.toDto(saved);
        }

        // If assigning/changing provider, validate endDate is present
        if (dto.getProviderId() != null && dto.getProviderAssignmentEndDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Provider assignment end date is required when assigning a provider");
        }

        // Validate endDate is not in the past
        if (dto.getProviderAssignmentEndDate() != null &&
            dto.getProviderAssignmentEndDate().isBefore(java.time.LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Provider assignment end date cannot be in the past");
        }

        vehicleMapper.copyToEntity(dto, entity);
        Vehicle saved = vehicleRepository.save(entity);
        return vehicleMapper.toDto(saved);
    }

    public void delete(Long id) {
        if (!vehicleRepository.existsById(id)) throw CrudUtils.notFound("Vehicle", id);
        vehicleRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public VehicleDto getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .map(vehicleMapper::toDto)
                .orElse(null);
    }

    // ======= SAVE & ATTACH FILES =======
    public VehicleDto uploadFilesAndAttach(Long vehicleId, MultipartFile[] files) throws IOException {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle with id " + vehicleId + " not found"));

        // Ensure base directory exists
        Files.createDirectories(BASE_UPLOAD_DIR);

        // Prefer VIN folder; fallback to license plate; fallback to id
        String key = (vehicle.getVinNum() != null && !vehicle.getVinNum().isBlank())
                ? vehicle.getVinNum()
                : ((vehicle.getLicensePlate() != null && !vehicle.getLicensePlate().isBlank())
                ? vehicle.getLicensePlate()
                : ("veh_" + vehicleId));

        Path vehicleDir = BASE_UPLOAD_DIR.resolve(sanitize(key));
        Files.createDirectories(vehicleDir);

        List<String> savedPaths = new ArrayList<>();
        if (files != null) {
            for (MultipartFile f : files) {
                if (f == null || f.isEmpty()) continue;

                String original = (f.getOriginalFilename() == null) ? "file" : f.getOriginalFilename();
                String safeName = UUID.randomUUID() + "_" + original.replaceAll("\\s+", "_");
                Path target = vehicleDir.resolve(safeName);

                // write file
                Files.write(target, f.getBytes(), StandardOpenOption.CREATE_NEW);

                savedPaths.add(target.toString());
            }
        }

        // Attach to entity (ElementCollection list)
        if (!savedPaths.isEmpty()) {
            vehicle.getFilePaths().addAll(savedPaths);

            // Optionally: also set the first file as certificateFilePath (if you want)
            // if (vehicle.getCertificateFilePath() == null) {
            //     vehicle.setCertificateFilePath(savedPaths.get(0));
            // }
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        return vehicleMapper.toDto(saved);
    }

    private String sanitize(String s) {
        return (s == null) ? "unknown" : s.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    public VehicleDto archiveVehicle(Long id, String reason, VehicleStatus status) {
        Vehicle existing = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Vehicle not found: " + id));

//        vehicleRepository.archiveById(id, "system", reason);

        // Because of @Where, the managed entity may still read archived=false until cleared/refresh.
        // Return a DTO based on known state:
        existing.setProvider(null);
        existing.setStatus(status);
        existing.setArchived(true);
//        existing.setArchivedReason(reason);
        return vehicleMapper.toDto(existing);
    }

    public VehicleDto unarchiveVehicle(Long id, VehicleStatus status, Long newProviderId, java.time.LocalDate newEndDate) {

        // Validate: endDate must be in the future (not today or past)
        if (!newEndDate.isAfter(java.time.LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Provider assignment end date must be in the future (after today)");
        }

        // Prevent unarchive if another active vehicle with same VIN exists
        Vehicle archivedRef = vehicleRepository.findArchivedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Archived vehicle not found: " + id));
        if (vehicleRepository.existsByVinNum(archivedRef.getVinNum())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot unarchive: active vehicle with same VIN exists (" + archivedRef.getVinNum() + ")");
        }

        int updated = vehicleRepository.unarchiveById(id);
        if (updated == 0) throw new ResponseStatusException(NOT_FOUND, "Vehicle not found: " + id);


        // Reload (optional) if you need full data; @Where will show it now since archived=false.
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Vehicle not found after unarchive: " + id));
        v.setArchived(false);
        // Set new provider assignment with today as start date
        Provider newProvider = new Provider();
        newProvider.setId(newProviderId);
        v.setProvider(newProvider);
        v.setProviderAssignmentStartDate(java.time.LocalDate.now());
        v.setProviderAssignmentEndDate(newEndDate);
        v.setStatus(status);

        vehicleRepository.save(v);
        return vehicleMapper.toDto(v);
    }

    public Page<VehicleDto> getArchived(Pageable pageable) {
        return vehicleRepository.findArchivedNative(pageable).map(vehicleMapper::toDto);
    }

    public VehicleDto getArchivedById(Long id) {
        return vehicleRepository.findArchivedById(id)
                .map(vehicleMapper::toDto)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Archived vehicle not found: " + id));
    }


    @Transactional
    public Map<String, Object> checkAndArchiveExpiredVehicles() {
        java.time.LocalDate today = java.time.LocalDate.now();
        List<Vehicle> expiredVehicles = vehicleRepository.findExpiredAssignments(today);

        List<Long> archivedIds = new ArrayList<>();
        int count = 0;

        for (Vehicle vehicle : expiredVehicles) {
            try {
                archiveVehicle(vehicle.getId(), "Expired assignment", VehicleStatus.DEREGISTERED);
                archivedIds.add(vehicle.getId());
                count++;
            } catch (Exception e) {
                System.err.println("Failed to archive vehicle " + vehicle.getId() + ": " + e.getMessage());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("checked", today.toString());
        result.put("found", expiredVehicles.size());
        result.put("archived", count);
        result.put("archivedIds", archivedIds);

        return result;
    }

}
