package sk.zzs.vehicle.management.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sk.zzs.vehicle.management.dto.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class DataImportService {

    private final ProviderService providerService;
    private final VehicleService vehicleService;
    private final NetworkPointService networkPointService;

    private final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("[yyyy-MM-dd][M/d/yyyy]");

    public ImportResultSummary importAllEntities(MultipartFile file) {
        ImportResultSummary summary = new ImportResultSummary();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            CSVParser parser = new CSVParser(reader,
                    CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreEmptyLines().withTrim());

            for (CSVRecord record : parser) {
                String type = get(record, "entityType");
                if (type == null || type.isBlank()) {
                    summary.addError("Row " + record.getRecordNumber() + ": missing entityType");
                    continue;
                }

                try {
                    switch (type.trim().toUpperCase()) {
                        case "PROVIDER" -> handleProvider(record, summary);
                        case "VEHICLE" -> handleVehicle(record, summary);
                        case "NETWORK_POINT" -> handleNetworkPoint(record, summary);
                        default -> summary.addError("Row " + record.getRecordNumber() + ": unknown entityType '" + type + "'");
                    }
                } catch (Exception e) {
                    summary.addError("Row " + record.getRecordNumber() + " failed: " + e.getMessage());
                }
            }

        } catch (IOException e) {
            summary.addError("Error reading CSV: " + e.getMessage());
        }

        return summary;
    }

    private void handleProvider(CSVRecord r, ImportResultSummary summary) {
        try {
            ProviderDto dto = new ProviderDto();
            dto.setProviderId(get(r, "providerId"));
            dto.setName(get(r, "name"));
            dto.setEmail(get(r, "email"));
            dto.setAddress(get(r, "address"));

            providerService.createProvider(dto);
            summary.incImported("providers");
        } catch (Exception e) {
            summary.addError("Provider row " + r.getRecordNumber() + ": " + e.getMessage());
            summary.incSkipped("providers");
        }
    }

    private void handleVehicle(CSVRecord r, ImportResultSummary summary) {
        try {
            VehicleDto dto = new VehicleDto();
            dto.setVinNum(get(r, "vin_num"));
            dto.setBrand(get(r, "brand"));
            dto.setModel(get(r, "model"));
            dto.setLicensePlate(get(r, "license_plate"));
            dto.setFirstRegistrationDate(parseDateSafe(get(r, "first_registration_date")));
            dto.setTechnicalCheckValidUntil(parseDateSafe(get(r, "technical_check_valid_until")));
            dto.setProviderId(Long.getLong(get(r, "provider_id")));
            dto.setProviderAssignmentEndDate(parseDateSafe(get(r, "provider_assignment_end_date")));

            vehicleService.registerVehicle(dto);
            summary.incImported("vehicles");
        } catch (Exception e) {
            summary.addError("Vehicle row " + r.getRecordNumber() + ": " + e.getMessage());
            summary.incSkipped("vehicles");
        }
    }

    private void handleNetworkPoint(CSVRecord r, ImportResultSummary summary) {
        try {
            NetworkPointDto dto = new NetworkPointDto();
            dto.setCode(get(r, "code"));
            dto.setName(get(r, "name"));
            dto.setValidTo(parseDateSafe(get(r, "valid_to")));
            dto.setQueueProviderId(Long.getLong(get(r, "provider_id")));
            dto.setProviderRegistrationEndDate(parseDateSafe(get(r, "provider_end_date")));

            networkPointService.createNetworkPoint(dto, true); // bypass capacity check for import
            summary.incImported("networkPoints");
        } catch (Exception e) {
            summary.addError("NetworkPoint row " + r.getRecordNumber() + ": " + e.getMessage());
            summary.incSkipped("networkPoints");
        }
    }


    private LocalDate parseDateSafe(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return LocalDate.parse(s.trim(), DATE_FMT);
        } catch (Exception e) {
            return null;
        }
    }

    private static String get(CSVRecord r, String col) {
        return r.isMapped(col) ? r.get(col).trim() : null;
    }
}
