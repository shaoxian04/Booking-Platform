package com.booking.service.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupabaseStorageService {

    private final RestTemplate restTemplate = new RestTemplate();
    @Value("${supabase.url}")
    private String supabaseUrl;
    @Value("${supabase.key}")
    private String supabaseKey;

    public String uploadFile(MultipartFile file, String bucketName) {
        try {
            log.info("Starting upload for: {}", file.getOriginalFilename());
            // 1. Generate unique filename (uuid + original extension)
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String newFileName = UUID.randomUUID() + extension;

            // 2. Prepare URL: POST /storage/v1/object/{bucket}/{filename}
            String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + newFileName;

            // 3. Set Headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.setContentType(MediaType.valueOf(file.getContentType())); // e.g. image/jpeg

            // 4. Send Request
            HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                // 5. Construct Public URL
                // Format: {supabaseUrl}/storage/v1/object/public/{bucket}/{filename}
                log.info("Supabase response: {}", response);

                return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + newFileName;
            } else {
                throw new RuntimeException("Failed to upload to Supabase: " + response.getStatusCode());
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to read file content", e);
        }
    }
}
