interface LinkActionProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

const LinkAction = ({ text, onClick, className = "" }: LinkActionProps) => {
  return (
    <div
      className={`link-primary ${className}`}
      style={{ cursor: "pointer" }}
      onClick={onClick}
    >
      {text}
    </div>
  );
};

export default LinkAction;
