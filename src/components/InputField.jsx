import React from 'react';

const InputField = ({ label, id, type = 'text', value, onChange, className = '', required = false, rows, step, placeholder }) => {
  const inputClasses = `mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${className}`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          rows={rows}
          className={inputClasses}
          required={required}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          className={inputClasses}
          required={required}
          step={step}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

export default InputField;
