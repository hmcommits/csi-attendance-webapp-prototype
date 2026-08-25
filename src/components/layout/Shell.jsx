import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Shell({ title, subtitle, actions, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={title}
          subtitle={subtitle}
          actions={actions}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
