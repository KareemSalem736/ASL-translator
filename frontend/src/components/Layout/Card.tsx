// This component renders a card-like container with optional title and styles.
// It can be used to display content in a visually distinct manner.

import type { CSSProperties, ReactNode } from "react";

interface CardProp {
  children: ReactNode; // content to be displayed inside the card
  style?: CSSProperties; // inline style prop
}

export const Card = ({ children, style }: CardProp) => {
  return (
    <div className="" style={style}>
      <div className=" p-0 shadow rounded-3 m-0">
        <div>{children}</div>
      </div>
    </div>
  );
};
