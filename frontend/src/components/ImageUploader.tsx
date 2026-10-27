import React from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  imagePreviewUrl: string | null;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

 const ImageUploader: React.FC<ImageUploaderProps> = ({ imagePreviewUrl, onFileSelect, disabled }) => {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unit Image File</label>
      <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center flex flex-col items-center justify-center cursor-pointer bg-slate-950/50 transition-colors relative">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="Unit Preview" className="h-48 object-contain rounded-lg shadow" />
        ) : (
          <div className="flex flex-col items-center space-y-2 py-6">
            <Upload className="w-10 h-10 text-slate-500" />
            <p className="text-sm text-slate-300 font-medium">Click to upload or drag unit image</p>
            <p className="text-xs text-slate-500">Supports JPEG, PNG, WebP up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default ImageUploader;