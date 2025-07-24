// src/components/activity/enhanced-activity-log.tsx

import React, { useState } from 'react';
import { ActivityLog } from '@/lib/types';
import { formatDateTime, getRelativeTime, cn } from '@/lib/utils';
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  AlertTriangle, 
  Activity,
  CheckCircle,
  XCircle,
  Upload,
  MessageSquare,
  Eye
} from 'lucide-react';

interface DetailedActivityLog extends ActivityLog {
  fieldChanges?: Array<{
    field: string;
    oldValue: string;
    newValue: string;
  }>;
  documentSnapshot?: {
    documentId: string;
    fileName: string;
    version: number;
  };
  riskScoreChange?: {
    oldScore: number;
    newScore: number;
    factors: string[];
  };
  relatedActivities?: string[];
}

interface EnhancedActivityLogProps {
  activities: DetailedActivityLog[];
  darkMode: boolean;
}

export const EnhancedActivityLog: React.FC<EnhancedActivityLogProps> = ({ 
  activities, 
  darkMode 
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };
  
  const getActionIcon = (actionType: string) => {
    const iconProps = { size: 16 };
    switch (actionType) {
      case 'Upload': return <Upload {...iconProps} />;
      case 'Approve': return <CheckCircle {...iconProps} className="text-green-600" />;
      case 'Reject': return <XCircle {...iconProps} className="text-red-600" />;
      case 'Comment': return <MessageSquare {...iconProps} className="text-blue-600" />;
      case 'View': return <Eye {...iconProps} className="text-gray-600" />;
      case 'Create': return <FileText {...iconProps} className="text-purple-600" />;
      default: return <Activity {...iconProps} />;
    }
  };
  
  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'Approve': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'Reject': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'Submit': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'Upload': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };
  
  return (
    <div className={cn(
      'p-6 rounded-lg border',
      darkMode 
        ? 'bg-slate-800/50 border-slate-700' 
        : 'bg-slate-50 border-slate-200'
    )}>
      <h3 className={cn(
        'text-xl font-semibold mb-4',
        darkMode ? 'text-slate-100' : 'text-slate-800'
      )}>
        Activity Timeline
      </h3>
      
      <div className="space-y-4">
        {[...activities].reverse().map((activity, index) => {
          const isExpanded = expandedItems.has(activity.id);
          const hasDetails = activity.fieldChanges || 
                           activity.documentSnapshot || 
                           activity.riskScoreChange;
          
          return (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {index < activities.length - 1 && (
                <div className={cn(
                  'absolute left-4 top-8 bottom-0 w-0.5',
                  darkMode ? 'bg-slate-600' : 'bg-slate-300'
                )} />
              )}
              
              {/* Activity item */}
              <div className="flex gap-4">
                <div className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
                  getActionColor(activity.actionType),
                  darkMode ? 'border-slate-600' : 'border-slate-300',
                  'border-2'
                )}>
                  {getActionIcon(activity.actionType)}
                </div>
                
                <div className="flex-1 pb-4">
                  <div 
                    className={cn(
                      'rounded-lg p-3',
                      darkMode ? 'bg-slate-800' : 'bg-white',
                      'border',
                      darkMode ? 'border-slate-700' : 'border-slate-200',
                      hasDetails && 'cursor-pointer'
                    )}
                    onClick={() => hasDetails && toggleExpanded(activity.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={cn(
                          'font-medium',
                          darkMode ? 'text-white' : 'text-slate-900'
                        )}>
                          {hasDetails && (
                            <span className="inline-block mr-2">
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </span>
                          )}
                          <span className="font-semibold">{activity.actor}</span>
                          <span className="mx-2">{activity.action}</span>
                        </p>
                        <p className={cn(
                          'text-xs mt-1',
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        )}>
                          {getRelativeTime(activity.timestamp)} • {formatDateTime(activity.timestamp)}
                        </p>
                      </div>
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        darkMode 
                          ? 'bg-slate-700 text-slate-300' 
                          : 'bg-slate-100 text-slate-600'
                      )}>
                        {activity.actorRole}
                      </span>
                    </div>
                    
                    {/* Expanded details */}
                    {isExpanded && hasDetails && (
                      <div className={cn(
                        'mt-3 p-3 rounded-md',
                        darkMode ? 'bg-slate-700/50' : 'bg-slate-100'
                      )}>
                        {activity.fieldChanges && activity.fieldChanges.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
                              Field Changes
                            </p>
                            <div className="space-y-1">
                              {activity.fieldChanges.map((change, i) => (
                                <div key={i} className="text-sm flex items-center gap-2">
                                  <span className="font-medium">{change.field}:</span>
                                  <span className="text-red-600 dark:text-red-400 line-through">
                                    {change.oldValue}
                                  </span>
                                  <span>→</span>
                                  <span className="text-green-600 dark:text-green-400">
                                    {change.newValue}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {activity.riskScoreChange && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
                              Risk Assessment
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle size={16} className="text-orange-500" />
                              <span className="text-sm">
                                Risk score: {activity.riskScoreChange.oldScore} → {activity.riskScoreChange.newScore}
                              </span>
                            </div>
                            {activity.riskScoreChange.factors.length > 0 && (
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Contributing factors:</p>
                                <ul className="list-disc list-inside text-xs space-y-1">
                                  {activity.riskScoreChange.factors.map((factor, i) => (
                                    <li key={i}>{factor}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {activity.documentSnapshot && (
                          <div>
                            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
                              Document Details
                            </p>
                            <div className="text-sm space-y-1">
                              <p>File: {activity.documentSnapshot.fileName}</p>
                              <p>Version: {activity.documentSnapshot.version}</p>
                            </div>
                          </div>
                        )}
                        
                        {activity.details && (
                          <div>
                            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                              Additional Details
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {activity.details}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};