import toast, { Toast } from 'react-hot-toast';

// Extender las funciones de toast
const customToast = {
  ...toast,
  warning: (message: string, opts?: Partial<Toast>) => 
    toast(message, { 
      ...opts, 
      icon: '⚠️',
      style: { 
        background: '#FFF3CD', 
        color: '#856404',
        ...opts?.style 
      } 
    })
};

export default customToast; 