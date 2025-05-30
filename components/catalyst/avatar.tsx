"use client";

import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import Image from "next/image";

type AvatarProps = {
  src?: string | null;
  square?: boolean;
  initials?: string;
  alt?: string;
  className?: string;
};

export function Avatar({
  src = null,
  square = false,
  initials,
  alt = "",
  className,
  ...props
}: AvatarProps & ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="avatar"
      className={clsx(
        className,

        // Basic layout
        "inline-grid size-8 align-middle *:col-start-1 *:row-start-1",

        // Add the correct border radius
        square ? "rounded-[20%] *:rounded-[20%]" : "rounded-full *:rounded-full"
      )}
      {...props}
    >
      {initials && (
        <svg
          className="fill-current text-[48px] font-medium uppercase select-none"
          viewBox="0 0 100 100"
          aria-hidden={alt ? undefined : "true"}
        >
          {alt && <title>{alt}</title>}
          <text
            x="50%"
            y="50%"
            alignmentBaseline="middle"
            dominantBaseline="middle"
            textAnchor="middle"
            dy=".125em"
          >
            {initials}
          </text>
        </svg>
      )}
      {src && (
        <Image
          src={src}
          alt={alt}
          width={100}
          height={100}
          className="h-auto w-full"
          unoptimized
        />
      )}
      {/* Add an inset border that sits on top of the image */}
      <span
        className="ring-1 ring-black/5 ring-inset dark:ring-white/5 forced-colors:outline"
        aria-hidden="true"
      />
    </div>
  );
}

// const AvatarButton = React.forwardRef(function AvatarButton(
//   {
//     src,
//     square = false,
//     initials,
//     alt,
//     className,
//     ...props
//   }: AvatarProps &
//     (HeadlessButtonProps | React.ComponentPropsWithoutRef<typeof Link>),
//   ref: React.ForwardedRef<HTMLElement>
// ) {
//   const classes = clsx(
//     className,
//     square ? "rounded-lg" : "rounded-full",
//     "relative focus:outline-hidden data-focus:outline data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500"
//   );

//   return "href" in props ? (
//     <Link
//       {...props}
//       className={classes}
//       ref={ref as React.ForwardedRef<HTMLAnchorElement>}
//     >
//       <TouchTarget>
//         <Avatar src={src} square={square} initials={initials} alt={alt} />
//       </TouchTarget>
//     </Link>
//   ) : (
//     <HeadlessButton {...props} className={classes} ref={ref}>
//       <TouchTarget>
//         <Avatar src={src} square={square} initials={initials} alt={alt} />
//       </TouchTarget>
//     </HeadlessButton>
//   );
// });
