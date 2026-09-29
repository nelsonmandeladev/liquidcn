import type { ReactNode } from "react";
import type { ApiEntry } from "@/examples/types";
import { Inline } from "@/www/docs/prose";

/** Wide tables scroll inside a focusable region instead of widening the page. */
function TableFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="table-frame" role="region" aria-label={label} tabIndex={0}>
      <table className="doc-table">{children}</table>
    </div>
  );
}

export function PropsTable({ entry }: { entry: ApiEntry }) {
  return (
    <TableFrame label={`${entry.component} props`}>
      <thead>
        <tr>
          <th scope="col">Prop</th>
          <th scope="col">Type</th>
          <th scope="col">Default</th>
        </tr>
      </thead>
      <tbody>
        {entry.props.map((prop) => (
          <tr key={prop.name}>
            <td>
              <code className="prop-name">{prop.name}</code>
              <p>
                <Inline text={prop.description} />
              </p>
            </td>
            <td>
              <code>{prop.type}</code>
            </td>
            <td className="prop-default">
              {prop.default ? (
                <code>{prop.default}</code>
              ) : (
                <>
                  <span aria-hidden="true">–</span>
                  <span className="sr-only">None</span>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </TableFrame>
  );
}

/** A table of short strings, where `backticks` become code. */
export function ValueTable({
  label,
  rows,
  headings = ["Parameter", "Value"],
}: {
  label: string;
  rows: string[][];
  headings?: string[];
}) {
  return (
    <TableFrame label={label}>
      <thead>
        <tr>
          {headings.map((heading) => (
            <th key={heading} scope="col">
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row[0]}>
            {row.map((cell, index) => (
              <td key={index}>
                <Inline text={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </TableFrame>
  );
}
