import type { CSSProperties, ReactNode } from "react";

interface CardProp {
  title?: ReactNode;
  children?: ReactNode;
  contanierstyles?: string;
  titlestyles?: string;
  childrenstyles?: string;
  style?: CSSProperties; // inline style prop
}

export const Card = ({
  title,
  children,
  contanierstyles,
  titlestyles,
  childrenstyles,
  style,
}: CardProp) => {
  return (
    <div className="" style={style}>
      {/* {title && <p className={`fw-bold mb-2 ${titlestyles}`}>{title}</p>} */}
      <div
        className={` p-0 shadow rounded-3 m-0 ${contanierstyles}`}
        style={style}
      >
        <div className={childrenstyles}>{children}</div>
      </div>
    </div>
  );
};
