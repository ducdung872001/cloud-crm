import React from 'react'; 
import './reportShared.scss'; 
 
export interface IReportKpiItem { 
  label: React.ReactNode; 
  value: React.ReactNode; 
  note?: React.ReactNode; 
  icon?: React.ReactNode; 
  style?: React.CSSProperties; 
  cardClassName?: string; 
  labelClassName?: string; 
  valueClassName?: string; 
  noteClassName?: string; 
  iconClassName?: string; 
} 
 
interface ReportKpiGridProps { 
  items: IReportKpiItem[]; 
  className?: string; 
  cardClassName?: string; 
} 
 
export default function ReportKpiGrid({ items, className = '', cardClassName = '' }: ReportKpiGridProps) { 
  return ( 
    <div className={`report-shared-kpi-grid ${className}`.trim()}> 
      {items.map((item, index) => ( 
        <div key={index} className={`report-shared-kpi-card ${cardClassName} ${item.cardClassName || ''}`.trim()} style={item.style}> 
          {item.icon ? <div className={`report-shared-kpi-card__icon ${item.iconClassName || ''}`.trim()}>{item.icon}</div> : null} 
          <div className='report-shared-kpi-card__body'> 
            <div className={`report-shared-kpi-card__label ${item.labelClassName || ''}`.trim()}>{item.label}</div> 
            <div className={`report-shared-kpi-card__value ${item.valueClassName || ''}`.trim()}>{item.value}</div> 
            {item.note ? <div className={`report-shared-kpi-card__note ${item.noteClassName || ''}`.trim()}>{item.note}</div> : null} 
          </div> 
        </div> 
      ))} 
    </div> 
  ); 
}
