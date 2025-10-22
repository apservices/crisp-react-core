
import React from 'react';
import { AudioManagementDashboard } from '@/components/AudioManagementDashboard';
import { RoleAuthProvider } from '@/hooks/useRoleAuth';

export default function AudioDashboard() {
  return (
    <RoleAuthProvider>
      <AudioManagementDashboard />
    </RoleAuthProvider>
  );
}
