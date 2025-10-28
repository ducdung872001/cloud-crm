import React, { Fragment, useEffect, useState } from "react";
import { Link } from "../Link";
import { Image } from "../Image";
import { Video } from "../Video";
import { Table } from "../Table";
import { TableCell } from "../TableCell";

const Element = ({ attributes, children, element }) => {
  const style = { textAlign: element.align };
  const props = { attributes, children, element };

  switch (element.type) {
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case "heading-one":
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case "heading-three":
      return (
        <h3 style={style} {...attributes}>
          {children}
        </h3>
      );
    case "bulleted-list":
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case "numbered-list":
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case "link":
      // return (
      //     <a {...attributes} href={element.href}>
      //         <img src={'https://cloud-cdn.reborn.vn/reborn/2024/09/25/ec15f625-e418-4741-962d-241ddd7f52ea-1727279856.png'}></img>
      //     </a>
      // );
      return <Link {...props} />;
    case "image":
      return (
        <Fragment>
          {element.longdesc ? (
            <a href={element.longdesc} target="_blank" rel="noopener noreferrer">
              <Image {...props} />
            </a>
          ) : (
            <Image {...props} />
          )}
        </Fragment>
      );
    case "video":
      return <Video {...props} />;
    case "table":
      return <Table {...props} />;
    case "table-row":
      return <tr {...attributes}>{children}</tr>;
    case "table-cell":
      return <TableCell {...props} />;
    case "cta":
      return (
        <button type="button" {...attributes}>
          {children}
        </button>
      );
    default:
      return (
        <p style={style} {...attributes} className={element?.class || ""}>
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

export { Element, Leaf };
