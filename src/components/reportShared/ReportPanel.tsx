import React from 'react'; 
 
interface ReportPanelProps { 
  className?: string; 
  headerClassName?: string; 
  bodyClassName?: string; 
  footerClassName?: string; 
  titleClassName?: string; 
  subtitleClassName?: string; 
  title?: React.ReactNode; 
  subtitle?: React.ReactNode; 
  headerRight?: React.ReactNode; 
  footer?: React.ReactNode; 
  children: React.ReactNode; 
} 
 
export default function ReportPanel(props: ReportPanelProps) { 
  const { className = '', headerClassName = '', bodyClassName = '', footerClassName = '', titleClassName = '', subtitleClassName = '', title, subtitle, headerRight, footer, children } = props; 
 
  return ( 
    <div className={className}> 
      {title || subtitle || headerRight ? ( 
        <div className={headerClassName}> 
          <div> 
            {title ? <div className={titleClassName}>{title}</div> : null} 
            {subtitle ? <div className={subtitleClassName}>{subtitle}</div> : null} 
          </div> 
          {headerRight ? <div>{headerRight}</div> : null} 
        </div> 
      ) : null} 
      <div className={bodyClassName}>{children}</div> 
      {footer ? <div className={footerClassName}>{footer}</div> : null} 
    </div> 
  ); 
}
