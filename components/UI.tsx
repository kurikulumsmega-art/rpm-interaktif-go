import React, { useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, className = '', ...props }) => {
  const baseStyles = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border";
  const variants = {
    primary: "bg-blue-600 text-white border-transparent hover:bg-blue-700 focus:ring-2 focus:ring-blue-300",
    secondary: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 focus:ring-2 focus:ring-indigo-200",
    danger: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 focus:ring-2 focus:ring-red-200",
    ghost: "bg-transparent text-gray-600 border-transparent hover:bg-gray-100"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`} {...props}>
      {icon}
      <span>{children}</span>
    </button>
  );
};

// --- Input & Textarea ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>}
    <input 
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all ${className}`} 
      {...props} 
    />
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
    props.onInput?.(e);
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>}
      <textarea 
        ref={ref}
        className={`w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all resize-none overflow-hidden ${className}`} 
        onInput={handleInput}
        {...props} 
      />
    </div>
  );
};

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all scale-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Loading Overlay ---
export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
    <p className="text-lg font-medium text-gray-700">{message}</p>
  </div>
);

// --- Toast ---
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-[70] animate-in slide-in-from-bottom-4 fade-in`}>
      <span>{message}</span>
    </div>
  );
};
