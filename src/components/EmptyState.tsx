import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-slate-300 rounded-xl bg-white shadow-sm">
      <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-[#08152F] mb-2">{title}</h3>
      <p className="text-sm text-[#667085] max-w-md mb-6">{description}</p>
      {actionText && (actionLink || onAction) && (
        actionLink ? (
          <a
            href={actionLink}
            className="px-4 py-2 bg-[#2563EB] text-white font-bold text-xs rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-sm inline-block"
          >
            {actionText}
          </a>
        ) : (
          <button
            onClick={onAction}
            className="px-4 py-2 bg-[#2563EB] text-white font-bold text-xs rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-sm"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
};
