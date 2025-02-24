type ToastProps = {
  description: string
  variant: "default" | "destructive"
}

type Toast = (props: ToastProps) => void

type UseToastReturn = {
  toast: Toast
}

export function useToast(): UseToastReturn {
  const toast: Toast = ({ description, variant }) => {
    alert(`${variant}: ${description}`)
  }

  return { toast }
}

