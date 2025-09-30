import * as React from "react";

type Props = {
    label: string;
    value: string | React.ReactNode;
    changed?: boolean;
};

export function LogDetailItem({ label, value, changed }: Props) {
    return (
        <div
            className={
                changed
                    ? "bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-md ring-1 ring-yellow-200 dark:ring-yellow-800/60"
                    : "p-2"
            }
        >
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-base font-semibold">
                {value === undefined || value === null || value === "" ? "N/A" : value}
            </p>
        </div>
    );
}