import React, { memo } from "react";
import urls from "configs/urls";
import TitleAction from "components/titleAction/titleAction";

interface FullPageProps {
  title: string;
  to?: string;
  isChildrenTitle: boolean;
  titleChildren: string;
  className?: string;
  children: React.ReactNode;
  callback?: () => void;
}

function FullPage(props: FullPageProps) {
  const { title, to, isChildrenTitle, titleChildren, className, children, callback } = props;
  return (
    <div className="page-content page-common">
      <TitleAction title={title} to={urls[to]} isChildrenTitle={isChildrenTitle} titleChildren={titleChildren} callback={callback} />
      <div className={`card-box${className ? ` ${className}` : ""}`}>{children}</div>
    </div>
  );
}

export default memo(FullPage);
