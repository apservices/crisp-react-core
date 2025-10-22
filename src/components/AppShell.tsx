import React from "react";

type Props = { children?: React.ReactNode };

/** AppShell placeholder — troque depois pelo layout real (sidebar/topbar). */
const AppShell: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur p-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="h-6 w-6 rounded bg-white/10" />
          <span className="font-semibold">RemiXense</span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
    </div>
  );
};

export default AppShell;
export { AppShell };