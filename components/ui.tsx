import React from 'react';

// Refined Button with pill shape and creative hover states
export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = "",
  disabled = false
}: { 
  children?: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost',
  className?: string,
  disabled?: boolean
}) => {
  const baseStyle = "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-black text-white hover:bg-zinc-800 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
    outline: "border border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 bg-white",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Minimalist Checkbox
export const Checkbox = ({ 
  checked, 
  onChange,
  className = ""
}: { 
  checked: boolean, 
  onChange: (checked: boolean) => void,
  className?: string
}) => {
  return (
    <div 
      onClick={() => onChange(!checked)}
      className={`
        w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-200
        ${checked ? 'bg-black border-black' : 'bg-white border-zinc-300 hover:border-zinc-400'}
        ${className}
      `}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
};

export const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-600 uppercase tracking-wider">
    {children}
  </span>
);