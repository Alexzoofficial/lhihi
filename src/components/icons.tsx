import type { SVGProps } from "react";

export function LhihiLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1.2em"
      height="1.2em"
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="currentColor"
        d="M168 40h-8a96 96 0 0 0-96 96v80a8 8 0 0 0 16 0v-80a80 80 0 0 1 80-80h8a8 8 0 0 0 0-16Z"
      />
    </svg>
  );
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
