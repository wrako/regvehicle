#!/bin/bash
# Update API client to add auth headers

FILE="src/lib/api.ts"

# Replace headers: { "Content-Type": "application/json" } with headers: getAuthHeaders()
sed -i 's/headers: { "Content-Type": "application\/json" }/headers: getAuthHeaders()/g' "$FILE"

# Add headers to GET/DELETE/POST requests that don't have headers yet
# This pattern finds fetch calls with credentials but no headers and adds getAuthHeaders()
sed -i '/credentials: "include",$/a\        headers: getAuthHeaders(),' "$FILE"

# Remove duplicate headers lines (in case some got added twice)
awk '!seen[$0]++' "$FILE" > "${FILE}.tmp" && mv "${FILE}.tmp" "$FILE"

echo "Updated API client with auth headers"
