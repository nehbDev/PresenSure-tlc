import React from "react";
import { Link } from "react-router-dom";

interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  crumbs: Crumb[];
}

const Breadcrumbs: React.FC<Props> = ({ crumbs }) => {
  return (
    <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
      <ol className="list-reset flex space-x-2">
        {crumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index !== 0 && <li>/</li>}
            <li>
              {crumb.to ? (
                <Link to={crumb.to} className="text-blue-700 hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-500">{crumb.label}</span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;