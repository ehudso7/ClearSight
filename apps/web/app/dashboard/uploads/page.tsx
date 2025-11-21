"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { format } from 'date-fns';

export default function UploadsPage() {
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<string>('mixed');

  useEffect(() => {
    fetchUploads();
  }, []);

  async function fetchUploads() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('csv_uploads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching uploads:', error);
    } else {
      setUploads(data || []);
    }
    setLoading(false);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('dataType', dataType);

      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.ok) {
        setError(result.error || 'Upload failed');
        setUploading(false);
        return;
      }

      setSuccess(`File uploaded successfully! ${result.rowCount} rows processed.`);
      setSelectedFile(null);
      setUploading(false);
      
      // Refresh uploads list
      fetchUploads();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-50 mb-2">Upload Data</h1>
          <p className="text-slate-400">Upload CSV files with your operational data</p>
        </div>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-neo-turquoise transition">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Upload Form */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-slate-50 mb-4">Upload New File</h2>
        
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-sm text-emerald-400">{success}</p>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Data Type
            </label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-neo-turquoise focus:border-transparent"
            >
              <option value="mixed">Mixed (all data in one file)</option>
              <option value="sales">Sales Data</option>
              <option value="warehouse">Warehouse Data</option>
              <option value="staff">Staff/Headcount Data</option>
              <option value="support">Support/Tickets Data</option>
              <option value="finance">Finance Data</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Select the type of data in your CSV file
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              CSV File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelect}
                className="w-full px-4 py-3 bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-neo-turquoise file:text-slate-950 hover:border-neo-turquoise transition cursor-pointer"
              />
            </div>
            {selectedFile && (
              <p className="mt-2 text-sm text-slate-400">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="w-full py-3 rounded-lg bg-neo-turquoise text-slate-950 font-medium hover:bg-neo-turquoise/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">CSV Format Guidelines</h3>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• File must be in CSV format (.csv extension)</li>
            <li>• First row should contain column headers</li>
            <li>• Maximum file size: 50MB</li>
            <li>• Required columns depend on data type selected</li>
            <li>• Use "Mixed" type if your CSV contains all operational metrics</li>
          </ul>
        </div>
      </div>

      {/* Upload History */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-slate-50 mb-4">Upload History</h2>
        
        {loading ? (
          <p className="text-center py-8 text-slate-400">Loading...</p>
        ) : uploads.length === 0 ? (
          <p className="text-center py-8 text-slate-400">No uploads yet</p>
        ) : (
          <div className="space-y-3">
            {uploads.map((upload) => (
              <div key={upload.id} className="p-4 rounded-lg border border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-100">{upload.file_name}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                      <span>{format(new Date(upload.created_at), 'MMM d, yyyy h:mm a')}</span>
                      <span>•</span>
                      <span className="capitalize">{upload.data_type}</span>
                      <span>•</span>
                      <span>{upload.row_count} rows</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    upload.status === 'processed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    upload.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {upload.status}
                  </span>
                </div>
                {upload.error_message && (
                  <p className="mt-2 text-sm text-red-400">{upload.error_message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
