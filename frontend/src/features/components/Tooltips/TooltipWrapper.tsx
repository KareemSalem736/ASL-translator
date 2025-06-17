// TooltipWrapper is a component that wraps its children with a Bootstrap tooltip.
// It initializes the tooltip on mount and cleans it up on unmount.
// It accepts props to customize the tooltip message, placement, trigger type, and container.
// It uses a ref to attach the tooltip to the child element.

import { cloneElement, useEffect, useRef, type ReactElement } from "react";
import { Tooltip } from "bootstrap"; // Import Bootstrap's Tooltip class

export interface TooltipWrapperProps {
  // The child element to which the tooltip will be attached
  // The children prop is expected to be a single React element, which will receive the tooltip functionality
  // The ref will be used to attach the tooltip to the child element
  children: ReactElement<any & { ref?: React.Ref<any> }>;

  message: string;
  placement?: "top" | "bottom" | "left" | "right";
  trigger?: "hover" | "click" | "focus" | "manual"; // Trigger type for the tooltip
  container?: string | false;
}

const TooltipWrapper = ({
  children,
  message,
  placement = "top",
  trigger = "hover",
  container = false,
}: TooltipWrapperProps) => {
  // Create a ref to attach the tooltip to the child element
  // Initialize the tooltip when the component mounts and clean it up on unmount
  // The ref will be used to attach the tooltip to the child element
  // The tooltip will be initialized with the provided message, placement, trigger type, and container
  // The tooltip will be disposed of when the component unmounts to prevent memory leaks
  // The children prop is expected to be a single React element, which will receive the tooltip functionality

  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) {
      const tooltip = new Tooltip(ref.current, {
        title: message,
        delay: { hide: 50, show: 260 },
        animation: true,
        placement,
        trigger,
        container,
      });

      return () => tooltip.dispose();
    }
  }, [message, placement, trigger, container]);

  return (
    // Clone the child element and pass the ref and tooltip attributes
    // The ref will be used to attach the tooltip to the child element
    // The cloned element will have the necessary attributes for the tooltip functionality
    <>
      {cloneElement(children, {
        ref,
        "data-bs-toggle": "tooltip",
        "data-bs-placement": placement,
        "data-bs-trigger": trigger,
        title: message,
      })}
    </>
  );
};

export default TooltipWrapper;

// Usage example:
// <TooltipWrapper message="This is a tooltip" placement="top">
//   <button className="btn btn-primary">Hover me</button>
// </TooltipWrapper>
// This component can be used to wrap any element and provide it with a Bootstrap tooltip.
