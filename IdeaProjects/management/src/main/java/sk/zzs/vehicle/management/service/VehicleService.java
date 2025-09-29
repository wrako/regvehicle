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
import sk.zzs.vehicle.management.entity.Vehicle;
import sk.zzs.vehicle.management.enumer.VehicleStatus;
import sk.zzs.vehicle.management.repository.VehicleRepository;
import sk.zzs.vehicle.management.repository.VehicleSpecifications;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
        Vehicle entity = vehicleMapper.toEntity(dto);
        Vehicle saved = vehicleRepository.save(entity);
        return vehicleMapper.toDto(saved);
    }

    public VehicleDto editVehicle(VehicleDto dto, Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Vehicle id is required for edit");
        }
        Vehicle entity = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle with id " + id + " not found"));
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
        existing.setStatus(status);
        existing.setArchived(true);
//        existing.setArchivedReason(reason);
        return vehicleMapper.toDto(existing);
    }

    public VehicleDto unarchiveVehicle(Long id, VehicleStatus status) {
        int updated = vehicleRepository.unarchiveById(id);
        if (updated == 0) throw new ResponseStatusException(NOT_FOUND, "Vehicle not found: " + id);

        // Reload (optional) if you need full data; @Where will show it now since archived=false.
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Vehicle not found after unarchive: " + id));
        v.setStatus(status);
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




}
