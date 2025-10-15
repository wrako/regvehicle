"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { uploadCsvFile } from '@/lib/api';

interface SectionResult {
  imported: number;
  skipped: number;
}

interface ImportResultSummary {
  providers: SectionResult;
  vehicles: SectionResult;
  networkPoints: SectionResult;
  errors: string[];
}

export default function ImportDataPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImportResultSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a CSV file');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const result = await uploadCsvFile(selectedFile);
      setUploadResult(result);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    }
  };

  const getTotalImported = (result: ImportResultSummary) => {
    return result.providers.imported + result.vehicles.imported + result.networkPoints.imported;
  };

  const getTotalSkipped = (result: ImportResultSummary) => {
    return result.providers.skipped + result.vehicles.skipped + result.networkPoints.skipped;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Data</h1>
        <p className="text-muted-foreground mt-2">Upload a CSV file to import providers, vehicles, and network points</p>
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-6">
        {/* File Upload Area */}
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-muted-foreground">
              CSV files only
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 rounded-md font-medium transition-colors"
        >
          {isUploading ? 'Uploading...' : 'Upload CSV File'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-destructive">Upload Failed</p>
              <p className="text-sm text-destructive/90">{error}</p>
            </div>
          </div>
        )}

        {/* Success Display */}
        {uploadResult && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-green-900 dark:text-green-100">Upload Successful</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {getTotalImported(uploadResult)} records imported, {getTotalSkipped(uploadResult)} skipped
                </p>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Providers */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Providers</h3>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">Imported:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {uploadResult.providers.imported}
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">Skipped:</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {uploadResult.providers.skipped}
                    </span>
                  </p>
                </div>
              </div>

              {/* Vehicles */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Vehicles</h3>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">Imported:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {uploadResult.vehicles.imported}
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">Skipped:</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {uploadResult.vehicles.skipped}
                    </span>
                  </p>
                </div>
              </div>

              {/* Network Points */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Network Points</h3>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">Imported:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {uploadResult.networkPoints.imported}
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">Skipped:</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {uploadResult.networkPoints.skipped}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Errors */}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <p className="font-medium text-amber-900 dark:text-amber-100">Import Warnings</p>
                    <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
                      {uploadResult.errors.map((error, index) => (
                        <li key={index} className="list-disc list-inside">{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">CSV File Format</h2>
        </div>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>The CSV file should contain data for providers, vehicles, and network points.</p>
          <p>Make sure your CSV file is properly formatted before uploading.</p>
          <p className="font-medium text-foreground mt-4">Note: This operation requires admin privileges.</p>
        </div>
      </div>
    </div>
  );
}
