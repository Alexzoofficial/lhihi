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

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="1.2em"
      height="1.2em"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691c-1.346 2.527-2.106 5.43-2.106 8.529c0 3.099.76 5.999 2.106 8.525l-5.657 5.657C1.049 34.332 0 29.352 0 24c0-5.352 1.049-10.332 2.952-14.309l5.658 5.657z"
      />
      <path
        fill="#4CAF50"
        d="M24 48c5.166 0 9.86-1.977 13.409-5.192l-5.657-5.657C30.049 38.046 27.218 39 24 39c-5.223 0-9.641-3.343-11.303-7.961l-5.657 5.657C9.353 43.161 16.075 48 24 48z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.16-4.087 5.571l5.657 5.657C42.422 35.801 44 30.026 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
