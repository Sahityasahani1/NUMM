import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { parseExcelOrCSVFile, downloadSampleCSVTemplate, ParsedMaterialRecord } from '../../utils/fileParser';

export const DataUploadModal: React.FC = () => {
  const { uploadModalOpen, uploadTargetCpse, closeUploadModal, importParsedRecords, cpseList, addToast } = useApp();
  
  const [selectedCpse, setSelectedCpse] = useState<string>(uploadTargetCpse || 'ONGC');
  const [destination, setDestination] = useState<'review' | 'master'>('review');
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsedRecords, setParsedRecords] = useState<ParsedMaterialRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!uploadModalOpen) return null;

  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);

  const handleFileProcess = async (selectedFile: File) => {
    setSelectedFileObj(selectedFile);
    setFile(selectedFile);
    setErrorMessage(null);
    setIsParsing(true);

    try {
      const records = await parseExcelOrCSVFile(selectedFile, selectedCpse);
      if (records.length === 0) {
        setErrorMessage('No valid records found. Ensure headers like material_code, description, and uom exist.');
        setParsedRecords([]);
      } else {
        setParsedRecords(records);
        addToast('success', `Parsed ${records.length} records from ${selectedFile.name}`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error parsing spreadsheet file.');
      setParsedRecords([]);
    } finally {
      setIsParsing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRecords.length === 0) return;
    importParsedRecords(parsedRecords, selectedCpse, destination, selectedFileObj || undefined);
    addToast('success', `Successfully imported ${parsedRecords.length} records into ${destination === 'review' ? 'Review Queue' : 'Master Catalog'}`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 transition-opacity duration-200"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={closeUploadModal}
    >
      <div 
        className="rounded-2xl max-w-2xl w-full overflow-hidden shadow-elevated transition-all animate-fade-in"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-hover)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'var(--blue-dim)', color: 'var(--blue)', border: '1px solid rgba(59,130,246,0.3)' }}
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Ingest Material Master Dataset
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Upload XLS, XLSX, or CSV spreadsheets to parse and synchronize catalog data
              </p>
            </div>
          </div>
          <button
            onClick={closeUploadModal}
            className="p-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Target Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase mb-1.5 block font-bold" style={{ color: 'var(--text-muted)' }}>
                Origin CPSE Entity
              </label>
              <select
                value={selectedCpse}
                onChange={(e) => setSelectedCpse(e.target.value)}
                className="w-full text-xs rounded-lg px-3 py-2 outline-none font-mono"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                {cpseList.map(c => (
                  <option key={c.id} value={c.name}>{c.name} - {c.fullName.split(' ')[0]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase mb-1.5 block font-bold" style={{ color: 'var(--text-muted)' }}>
                Target Ingestion Destination
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value as 'review' | 'master')}
                className="w-full text-xs rounded-lg px-3 py-2 outline-none font-mono"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="review">Review Queue (Automated AI Matching)</option>
                <option value="master">National Master Catalogue (Direct Commit)</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center"
            style={{
              borderColor: isDragging ? 'var(--blue)' : 'var(--border)',
              background: isDragging ? 'var(--blue-dim)' : 'var(--bg-hover)',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={onFileInputChange}
              className="hidden"
            />

            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--blue)' }}
            >
              <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
            </div>

            <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {file ? file.name : 'Click to browse or drag & drop spreadsheet'}
            </p>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              Supports <span className="font-bold" style={{ color: 'var(--blue)' }}>.CSV</span>, <span className="font-bold" style={{ color: 'var(--blue)' }}>.XLSX</span>, and <span className="font-bold" style={{ color: 'var(--blue)' }}>.XLS</span> files (up to 50MB)
            </p>

            {isParsing && (
              <div className="mt-3 flex items-center gap-2 font-mono text-xs" style={{ color: 'var(--blue)' }}>
                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                Parsing and normalizing columns...
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div 
              className="p-3 rounded-lg text-xs flex items-center gap-2 font-mono"
              style={{ background: 'var(--error-dim)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--error)' }}
            >
              <span className="material-symbols-outlined text-[18px]">error</span>
              {errorMessage}
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRecords.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
                  <span className="material-symbols-outlined text-sm" style={{ color: 'var(--success)' }}>check_circle</span>
                  Ready to Ingest: <strong className="font-mono" style={{ color: 'var(--blue)' }}>{parsedRecords.length} records parsed</strong>
                </span>
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Previewing first 3 rows</span>
              </div>

              <div className="rounded-xl overflow-hidden max-h-40 overflow-y-auto" style={{ border: '1px solid var(--border)' }}>
                <table className="w-full text-left text-xs">
                  <thead style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border)' }}>
                    <tr>
                      <th className="p-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Code</th>
                      <th className="p-2 font-semibold" style={{ color: 'var(--text-muted)' }}>CPSE</th>
                      <th className="p-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Description</th>
                      <th className="p-2 font-semibold" style={{ color: 'var(--text-muted)' }}>UOM</th>
                      <th className="p-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Proposed CNMC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                    {parsedRecords.slice(0, 3).map((r, i) => (
                      <tr key={i} className="hover:opacity-90">
                        <td className="p-2 font-bold" style={{ color: 'var(--blue)' }}>{r.localCode}</td>
                        <td className="p-2" style={{ color: 'var(--text-primary)' }}>{r.cpse}</td>
                        <td className="p-2 truncate max-w-[150px]" style={{ color: 'var(--text-secondary)' }}>{r.description}</td>
                        <td className="p-2" style={{ color: 'var(--text-primary)' }}>{r.uom}</td>
                        <td className="p-2 font-semibold" style={{ color: 'var(--indigo)' }}>{r.candidateCnmc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sample Template Download */}
          <div 
            className="p-3 rounded-xl flex items-center justify-between text-xs"
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <span className="material-symbols-outlined text-sm" style={{ color: 'var(--blue)' }}>description</span>
              <span>Need the standard CSV structure?</span>
            </div>
            <button
              type="button"
              onClick={downloadSampleCSVTemplate}
              className="font-mono text-xs hover:underline font-semibold flex items-center gap-1"
              style={{ color: 'var(--blue)' }}
            >
              <span className="material-symbols-outlined text-[14px]">download</span>
              Download Sample CSV
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div 
          className="p-4 flex justify-end gap-3"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-hover)' }}
        >
          <button
            type="button"
            onClick={closeUploadModal}
            className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-80 transition-colors"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRecords.length === 0 || isParsing}
            onClick={handleConfirmImport}
            className="px-5 py-2 font-semibold text-xs rounded-lg hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
            style={{ background: 'var(--blue)', color: '#fff' }}
          >
            <span className="material-symbols-outlined text-sm">add_task</span>
            Import {parsedRecords.length > 0 ? `${parsedRecords.length} Records` : 'Dataset'}
          </button>
        </div>
      </div>
    </div>
  );
};
