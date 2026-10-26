import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadResume, deleteResume, getResumeDownloadUrl } from '../../api/resumes';
import Button from '../ui/Button';
import {
  UploadCloud,
  Trash2,
  ExternalLink,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

function ResumeSlotCard({ slotNumber, resume, onUploaded, onDeleted }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const onDrop = async (acceptedFiles, fileRejections) => {
    setError('');
    if (fileRejections.length > 0) {
      const rej = fileRejections[0];
      if (rej.errors[0]?.code === 'file-too-large') {
        setError('File exceeds 20 MB limit.');
      } else {
        setError('Only PDF documents are allowed.');
      }
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    try {
      const data = await uploadResume(file, slotNumber);
      if (onUploaded) onUploaded(data.resume);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload resume document.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 20 * 1024 * 1024,
    multiple: false,
    disabled: uploading || deleting,
  });

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!resume) return;
    if (!window.confirm(`Delete Resume ${slotNumber}?`)) return;

    setDeleting(true);
    try {
      await deleteResume(resume.id);
      if (onDeleted) onDeleted(slotNumber);
    } catch {
      setError('Failed to delete resume.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-lg hover:shadow-zinc-950/[0.06] hover:-translate-y-0.5 transition-all duration-200 ease-out">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border dark:border-zinc-800 mb-4">
          <span className="text-sm font-bold text-ink dark:text-white">Resume {slotNumber}</span>
          {resume && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Uploaded
            </span>
          )}
        </div>

        {error && (
          <div className="mb-3 p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dropzone Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
              : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-500/50 dark:hover:border-blue-500/50 bg-zinc-50/50 dark:bg-zinc-850 dark:bg-zinc-800/40'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-8 h-8 text-ink-muted dark:text-zinc-400 mx-auto mb-2 opacity-70" />
          <p className="text-xs font-semibold text-ink dark:text-zinc-100">
            {uploading
              ? 'Uploading PDF...'
              : isDragActive
              ? 'Drop your PDF resume here...'
              : 'Drag & drop or browse'}
          </p>
          <p className="text-[11px] text-ink-muted dark:text-zinc-400 mt-1">PDF format (20 MB max)</p>
          <div className="mt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={uploading}
              className="text-xs pointer-events-none"
            >
              Choose file
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Info / Actions */}
      {resume && (
        <div className="mt-4 pt-3 border-t border-border dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2 text-xs">
            <a
              href={getResumeDownloadUrl(resume.id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px]"
            >
              <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{resume.originalFilename}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="p-1 rounded text-ink-muted dark:text-zinc-400 hover:text-danger hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete resume"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumeUploader({ resumes = [], onResumesChange }) {
  const resume1 = resumes.find((r) => r.slotNumber === 1);
  const resume2 = resumes.find((r) => r.slotNumber === 2);

  const handleUploaded = (newResume) => {
    const updated = resumes.filter((r) => r.slotNumber !== newResume.slotNumber);
    updated.push(newResume);
    if (onResumesChange) onResumesChange(updated);
  };

  const handleDeleted = (slotNumber) => {
    const updated = resumes.filter((r) => r.slotNumber !== slotNumber);
    if (onResumesChange) onResumesChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-bold text-ink dark:text-white">My resumes</h3>
        <p className="text-xs text-ink-muted dark:text-zinc-400 mt-0.5">
          Upload up to two versions for different applications (e.g. Software Engineering vs. Product/Design).
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5">
        <ResumeSlotCard
          slotNumber={1}
          resume={resume1}
          onUploaded={handleUploaded}
          onDeleted={handleDeleted}
        />
        <ResumeSlotCard
          slotNumber={2}
          resume={resume2}
          onUploaded={handleUploaded}
          onDeleted={handleDeleted}
        />
      </div>

      <p className="text-[11px] text-ink-muted dark:text-zinc-400 text-center pt-2">
        * PDF only. 20 MB max per file. Stored securely on Scout servers.
      </p>
    </div>
  );
}
