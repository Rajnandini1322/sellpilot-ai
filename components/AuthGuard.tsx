"use client";

import { useEffect, useState } from "react";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("sellpilot-user");

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="auth-loading">
        <div className="loading-orb" />
        <p>Loading SellPilot AI...</p>
      </div>
    );
  }

  return <>{children}</>;
}
