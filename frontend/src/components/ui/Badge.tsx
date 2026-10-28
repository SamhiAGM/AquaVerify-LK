import React from 'react';
import { ComplaintCategory, ComplaintStatus, Role, VerificationStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    default: 'bg-teal-50 text-teal-800 border-teal-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ComplaintStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="warning" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
          Pending Review
        </Badge>
      );
    case 'UNDER_INVESTIGATION':
      return (
        <Badge variant="info" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1.5" />
          Under Investigation
        </Badge>
      );
    case 'TESTING_REQUESTED':
      return (
        <Badge variant="purple" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5" />
          Testing Requested
        </Badge>
      );
    case 'RESOLVED':
      return (
        <Badge variant="success" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
          Resolved
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="danger" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const VerificationBadge: React.FC<{
  status: VerificationStatus;
  size?: 'sm' | 'md';
}> = ({ status, size = 'md' }) => {
  switch (status) {
    case 'VERIFIED':
      return (
        <Badge variant="success" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
          SLS Verified
        </Badge>
      );
    case 'PENDING_VERIFICATION':
      return (
        <Badge variant="warning" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
          Pending Verification
        </Badge>
      );
    case 'DRAFT':
      return (
        <Badge variant="neutral" size={size}>
          Draft
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="danger" size={size}>
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const RoleBadge: React.FC<{ role: Role; size?: 'sm' | 'md' }> = ({
  role,
  size = 'md',
}) => {
  switch (role) {
    case 'ADMIN':
      return (
        <Badge variant="purple" size={size}>
          Administrator
        </Badge>
      );
    case 'OFFICER':
      return (
        <Badge variant="info" size={size}>
          Quality Officer
        </Badge>
      );
    case 'LAB_TECHNICIAN':
      return (
        <Badge variant="default" size={size}>
          Lab Technician
        </Badge>
      );
    case 'CITIZEN':
    default:
      return (
        <Badge variant="neutral" size={size}>
          Citizen
        </Badge>
      );
  }
};

export const CategoryBadge: React.FC<{ category: ComplaintCategory }> = ({ category }) => {
  const formatLabel = (cat: string) => {
    return cat
      .split('_')
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
      {formatLabel(category)}
    </span>
  );
};
