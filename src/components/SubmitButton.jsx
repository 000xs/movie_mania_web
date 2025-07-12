import React from 'react';

const SubmitButton = ({ children, loading, className = '' }) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 ${className}`}
    >
      {loading ? "Processing..." : children}
    </button>
  );
};

export default SubmitButton;
