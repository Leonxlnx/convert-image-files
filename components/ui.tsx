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
  const baseStyle = "px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 tracking-tight";
  
  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-black shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)]",
    secondary: "bg-white text-zinc-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)]",
    outline: "border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 bg-transparent",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 shadow-sm",
    ghost: "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/60"
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
        w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-300
        ${checked ? 'bg-zinc-900 border-zinc-900 shadow-sm' : 'bg-white border-zinc-200 hover:border-zinc-300'}
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
  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-100 text-zinc-500 uppercase tracking-wider">
    {children}
  </span>
);