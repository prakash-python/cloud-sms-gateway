import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { InputField } from './InputField';

export const PasswordInput = ({ label, error, isValid, ...props }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative group">
      <InputField
        label={label}
        type={show ? 'text' : 'password'}
        icon={Lock}
        error={error}
        isValid={isValid}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className={`
          absolute right-3.5 top-[35px] transition-colors p-1.5 rounded-lg hover:bg-white/5
          ${error ? 'text-red-500' : isValid ? 'text-emerald-500' : 'text-slate-500 hover:text-white'}
        `}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};
