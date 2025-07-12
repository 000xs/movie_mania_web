import React from 'react';
import InputField from './InputField';

const SubtitleInput = ({ subtitles, setSubtitles }) => {
  const handleAddSubtitle = () => {
    setSubtitles([...subtitles, { language: '', url: '' }]);
  };

  const handleRemoveSubtitle = (index) => {
    const newSubtitles = subtitles.filter((_, i) => i !== index);
    setSubtitles(newSubtitles);
  };

  const handleChange = (index, field, value) => {
    const newSubtitles = subtitles.map((subtitle, i) =>
      i === index ? { ...subtitle, [field]: value } : subtitle
    );
    setSubtitles(newSubtitles);
  };

  return (
    <div className="border border-gray-600 p-4 rounded-md">
      <label className="block text-sm font-medium text-gray-300 mb-2">Subtitles</label>
      {subtitles.map((subtitle, index) => (
        <div key={index} className="mb-4 p-3 border border-gray-700 rounded-md bg-gray-800">
          <InputField
            label={`Language ${index + 1}`}
            id={`subtitle-language-${index}`}
            value={subtitle.language}
            onChange={(e) => handleChange(index, 'language', e.target.value)}
            placeholder="e.g., English, Sinhala"
          />
          <InputField
            label={`URL ${index + 1}`}
            id={`subtitle-url-${index}`}
            value={subtitle.url}
            onChange={(e) => handleChange(index, 'url', e.target.value)}
            placeholder="https://example.com/subtitle.srt"
          />
          <button
            type="button"
            onClick={() => handleRemoveSubtitle(index)}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Remove Subtitle
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddSubtitle}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
      >
        Add Subtitle
      </button>
    </div>
  );
};

export default SubtitleInput;
