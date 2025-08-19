import React from "react";

export function GoogleButton({
  onClick,
  label = "Sign in with Google",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12   s5.373-12,12-12c3.059,0,5.842,1.156,7.938,3.062l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20   s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.156,7.938,3.062l5.657-5.657   C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.197l-6.199-5.18C29.189,35.091,26.715,36,24,36c-5.202,0-9.623-3.317-11.283-7.953   l-6.51,5.024C9.514,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.236-2.231,4.166-3.999,5.622c0.001-0.001,0.002-0.001,0.002-0.002   l6.199,5.18C40.74,36.692,44,30.755,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
      </svg>
      {label}
    </button>
  );
}
