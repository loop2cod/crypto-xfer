'use client'
import AppRouter from "@/components/AppRouter";
import ToastContainer from "@/components/ui/toast-container";
import useToast from "@/hooks/useToast";

export default function Home() {
  const { showToast, toasts, hideToast } = useToast()
  return (
   <>
   <AppRouter />
         <ToastContainer toasts={toasts} onHideToast={hideToast} /></>
  );
}
