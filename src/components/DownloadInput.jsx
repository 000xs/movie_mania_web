import React, { useState } from 'react';
import InputField from './InputField';
import { X, Plus } from '@phosphor-icons/react';

const DOWNLOAD_TYPES = ['DIRECT', 'TELEGRAM', 'DRIVE'];
const QUALITY_OPTIONS = ['1080p', '720p', '540p', '480p'];
const videoTypes = [
  "WEB_DL",
  "WEB_RIP",
  "HD_RIP",
  "BLU_RAY",
  "DVD_RIP",
  "HD_CAM",
  "HD_TS",
  "TS",
  "CAM",
  "TV_RIP",
  "NETFLIX_WEB",
  "AMAZON_WEB",
  "HDR"
];


const DownloadInput = ({ downloads, setDownloads }) => {
  const handleAddDownload = () => {
    setDownloads([
      ...downloads,
      { downloadType: '', videoType: '', quality: '', link: '' }
    ]);
    console.log(downloads);
  };

  const handleRemoveDownload = (downloadIndex) => {
    setDownloads(downloads.filter((_, index) => index !== downloadIndex));
  };

  const handleChange = (downloadIndex, field, value) => {
    setDownloads(downloads.map((download, index) =>
      index === downloadIndex ? { ...download, [field]: value } : download
    ));
  };
 

  return (
    <div className="border border-gray-600 p-4 rounded-md">
      <label className="block text-sm font-medium text-gray-300 mb-2">Downloads</label>
      {downloads.map((download, downloadIndex) => (
        <div key={downloadIndex} className="mb-4 p-3 border border-gray-700 rounded-md bg-gray-800">
          <div className="flex flex-wrap gap-4 mb-3">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-semibold text-gray-400 mb-1">Download Type</label>
              <select
                value={download.downloadType}
                onChange={(e) => handleChange(downloadIndex, 'downloadType', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                <option value="">Select type</option>
                {DOWNLOAD_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-semibold text-gray-400 mb-1">Video Type</label>

              <select
                value={download.videoType}
                onChange={(e) => handleChange(downloadIndex, 'videoType', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                <option value="">Select quality</option>
                {videoTypes.map((vType) => (
                  <option key={vType} value={vType}>{vType}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-semibold text-gray-400 mb-1">Quality</label>
              <select
                value={download.quality}
                onChange={(e) => handleChange(downloadIndex, 'quality', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                <option value="">Select quality</option>
                {QUALITY_OPTIONS.map((quality) => (
                  <option key={quality} value={quality}>{quality}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">

            <div className="flex items-center space-x-2">
              <InputField
                label="Link URL"
                onChange={(e) => handleChange(downloadIndex, 'link', e.target.value)}
                placeholder="https://example.com/download"
                className="flex-grow"
              />
            </div>


          </div>
          <button
            type="button"
            onClick={() => handleRemoveDownload(downloadIndex)}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Remove Download
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddDownload}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded mt-4 w-full flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Download
      </button>
    </div>
  );
};

export default DownloadInput;
