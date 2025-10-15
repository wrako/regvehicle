package sk.zzs.vehicle.management.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sk.zzs.vehicle.management.dto.ImportResultSummary;
import sk.zzs.vehicle.management.dto.NetworkPointDto;
import sk.zzs.vehicle.management.dto.ProviderDto;
import sk.zzs.vehicle.management.dto.VehicleDto;
import sk.zzs.vehicle.management.enumer.NetworkPointType;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DataImportService {

    private final ProviderService providerService;
    private final VehicleService vehicleService;
    private final NetworkPointService networkPointService;

    private final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("[yyyy-MM-dd][M/d/yyyy]");

    public ImportResultSummary importAllEntities(MultipartFile file) {
        ImportResultSummary summary = new ImportResultSummary();

        try {
            System.out.println("!!!!!!!!!!! START READ SECTIONS !!!!!!!!!!!!");

            // Read raw content with encoding fallbacks and normalize line endings
            String content = readContentWithFallbacks(file)
                    .replace("\r\n", "\n")
                    .replace("\r", "\n");

            // Ensure section markers are on their own lines (handles markers followed by commas/content)
            content = normalizeSectionMarkers(content);

            // Split to lines
            List<String> lines = Arrays.asList(content.split("\n", -1));

            // Split into sections
            Map<String, List<String>> sections = splitSections(lines);

            System.out.println("==========================================");
            System.out.println(lines);
            System.out.println("==========================================");
            System.out.println(sections);
            System.out.println("==========================================");

            if (sections.containsKey("Providers")) {
                System.out.println("!!!!!!!!!!! START READ Providers !!!!!!!!!!!!");
                processProviders(sections.get("Providers"), summary);
            }
            if (sections.containsKey("Vehicles")) {
                System.out.println("!!!!!!!!!!! START READ Vehicles !!!!!!!!!!!!");
                processVehicles(sections.get("Vehicles"), summary);
            }
            if (sections.containsKey("NetworkPoints")) {
                System.out.println("!!!!!!!!!!! START READ NetworkPoints !!!!!!!!!!!!");
                processNetworkPoints(sections.get("NetworkPoints"), summary);
            }

        } catch (IOException e) {
            summary.addError("Failed to read CSV: " + e.getMessage());
        }

        return summary;
    }

    // ---------- helpers: reading, normalization, splitting ----------

    private String readContentWithFallbacks(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();

        List<Charset> tryCharsets = List.of(
                StandardCharsets.UTF_8,
                Charset.forName("windows-1250"),
                Charset.forName("ISO-8859-2"),
                StandardCharsets.ISO_8859_1
        );

        for (Charset cs : tryCharsets) {
            try {
                return new String(bytes, cs);
            } catch (Exception ignored) {}
        }
        return new String(bytes, StandardCharsets.ISO_8859_1);
    }

    private String normalizeSectionMarkers(String content) {
        // Put a newline BEFORE any marker that isn’t already at line start
        content = content.replaceAll("(?<!^)\\s*\\[(Providers|Vehicles|NetworkPoints)]", "\n[$1]");
        // Put a newline AFTER marker (and drop trailing commas on that same line)
        content = content.replaceAll("\\[(Providers|Vehicles|NetworkPoints)]\\s*,*", "[$1]\n");
        // Collapse multiple blank lines
        content = content.replaceAll("\\n{2,}", "\n");
        return content.trim();
    }

    private Map<String, List<String>> splitSections(List<String> lines) {
        Map<String, List<String>> result = new LinkedHashMap<>();
        String current = null;
        List<String> buffer = new ArrayList<>();

        for (String raw : lines) {
            if (raw == null) continue;
            String line = raw.trim();
            if (line.isEmpty()) continue;

            // Detect a marker even if original line had extra commas after it
            String firstToken = line.split(",", 2)[0].trim();
            boolean marker = firstToken.startsWith("[") && firstToken.endsWith("]");
            if (marker) {
                // flush previous
                if (current != null && !buffer.isEmpty()) {
                    List<String> cleaned = dropCommaOnlyLines(buffer);
                    if (!cleaned.isEmpty()) {
                        result.put(current, cleaned);
                    }
                    buffer.clear();
                }
                current = firstToken.substring(1, firstToken.length() - 1);
                continue;
            }

            if (current != null) {
                buffer.add(raw);
            }
        }

        if (current != null && !buffer.isEmpty()) {
            List<String> cleaned = dropCommaOnlyLines(buffer);
            if (!cleaned.isEmpty()) {
                result.put(current, cleaned);
            }
        }

        return result;
    }

    private List<String> dropCommaOnlyLines(List<String> rows) {
        List<String> out = new ArrayList<>();
        for (String s : rows) {
            String t = s.trim();
            if (!t.isEmpty() && !t.replace(",", "").trim().isEmpty()) {
                out.add(s);
            }
        }
        return out;
    }

    // ---------- robust CSV parser for a section (header cleaned) ----------

    /**
     * Build a CSVParser for one section, cleaning the header by removing trailing empty columns.
     * This avoids "A header name is missing" when the header has extra commas.
     */
    private CSVParser buildParserForSection(List<String> lines) throws IOException {
        if (lines == null || lines.isEmpty()) {
            // empty section → create parser with no rows
            return CSVParser.parse("", CSVFormat.DEFAULT.withHeader().withSkipHeaderRecord());
        }

        // 1) Take raw header line
        String headerLine = lines.get(0);

        // 2) Parse that single line to get header fields honoring quotes
        List<String> headerFields = new ArrayList<>();
        try (CSVParser headerParser = CSVParser.parse(headerLine, CSVFormat.DEFAULT)) {
            for (CSVRecord rec : headerParser) {
                for (String v : rec) headerFields.add(v == null ? "" : v.trim());
            }
        }

        // 3) Remove trailing empty header names (caused by extra commas)
        while (!headerFields.isEmpty() && (headerFields.get(headerFields.size() - 1).isBlank())) {
            headerFields.remove(headerFields.size() - 1);
        }

        if (headerFields.isEmpty()) {
            throw new IllegalArgumentException("Section header is empty or invalid: '" + headerLine + "'");
        }

        // 4) Re-join the section content and parse with explicit header, skipping the first row
        String sectionBody = String.join("\n", lines);
        CSVFormat fmt = CSVFormat.DEFAULT
                .withHeader(headerFields.toArray(new String[0]))
                .withSkipHeaderRecord(true)
                .withTrim();

        return CSVParser.parse(sectionBody, fmt);
    }

    // ---------- per-section processors ----------

    private void processProviders(List<String> lines, ImportResultSummary summary) {
        try (CSVParser parser = buildParserForSection(lines)) {
            for (CSVRecord r : parser) {
                try {
                    ProviderDto dto = new ProviderDto();
                    dto.setProviderId(get(r, "providerId"));
                    dto.setName(get(r, "name"));
                    dto.setEmail(get(r, "email"));
                    dto.setAddress(get(r, "address")); // keep if ProviderDto supports it

                    providerService.createProvider(dto);
                    summary.incImported("providers");
                } catch (Exception e) {
                    summary.addError("Provider row " + r.getRecordNumber() + ": " + e.getMessage());
                    summary.incSkipped("providers");
                }
            }
        } catch (Exception e) {
            summary.addError("Provider section failed: " + e.getMessage());
        }
    }

    private void processVehicles(List<String> lines, ImportResultSummary summary) {
        try (CSVParser parser = buildParserForSection(lines)) {
            for (CSVRecord r : parser) {
                try {
                    VehicleDto dto = new VehicleDto();
                    dto.setVinNum(get(r, "vin_num"));
                    dto.setBrand(get(r, "brand"));
                    dto.setModel(get(r, "model"));
                    dto.setLicensePlate(get(r, "license_plate"));
                    dto.setFirstRegistrationDate(parseDateSafe(get(r, "first_registration_date")));
                    dto.setTechnicalCheckValidUntil(parseDateSafe(get(r, "technical_check_valid_until")));

                    // Parse provider_id as number (never use Long.getLong)
                    Long provId = providerService.getByProviderID(get(r, "provider_id")).getId();
                    dto.setProviderId(provId);
                    dto.setProviderAssignmentEndDate(parseDateSafe(get(r, "provider_assignment_end_date")));

                    vehicleService.registerVehicle(dto);
                    summary.incImported("vehicles");
                } catch (Exception e) {
                    summary.addError("Vehicle row " + r.getRecordNumber() + ": " + e.getMessage());
                    summary.incSkipped("vehicles");
                }
            }
        } catch (Exception e) {
            summary.addError("Vehicle section failed: " + e.getMessage());
        }
    }

    private void processNetworkPoints(List<String> lines, ImportResultSummary summary) {
        try (CSVParser parser = buildParserForSection(lines)) {
            for (CSVRecord r : parser) {
                try {
                    NetworkPointDto dto = new NetworkPointDto();
                    dto.setCode(get(r, "code"));
                    dto.setName(get(r, "name"));
                    dto.setType(NetworkPointType.valueOf(get(r, "type")));

                    dto.setValidTo(parseDateSafe(get(r, "valid_to")));

                    Long provId = providerService.getByProviderID(get(r, "provider_id")).getId();
                    dto.setQueueProviderId(provId);

                    dto.setProviderRegistrationEndDate(parseDateSafe(get(r, "provider_end_date")));


                    // For bulk imports we bypass capacity checks; set false if you want enforcement.
                    networkPointService.createNetworkPoint(dto, true);
                    summary.incImported("networkPoints");
                } catch (Exception e) {
                    summary.addError("NetworkPoint row " + r.getRecordNumber() + ": " + e.getMessage());
                    summary.incSkipped("networkPoints");
                }
            }
        } catch (Exception e) {
            summary.addError("NetworkPoints section failed: " + e.getMessage());
        }
    }

    // ---------- small utils ----------

    private LocalDate parseDateSafe(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return LocalDate.parse(s.trim(), DATE_FMT);
        } catch (Exception e) {
            return null;
        }
    }

    private Long parseLongSafe(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return Long.parseLong(s.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static String get(CSVRecord r, String col) {
        return r.isMapped(col) ? safeTrim(r.get(col)) : null;
    }

    private static String safeTrim(String s) {
        return s == null ? null : s.trim();
    }
}
