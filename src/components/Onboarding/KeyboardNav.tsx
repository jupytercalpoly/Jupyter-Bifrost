/** @jsx jsx */
import { jsx } from '@emotion/react';
import { withFocus, withNavigation } from 'react-keyboard-navigation';

interface FocusableComponent {
  (props: {
    id: string;
    parentId: string;
    [other: string]: any;
  }): jsx.JSX.Element;
}

export const Focusable: FocusableComponent = withFocus(
  ({ forwardedRef, children, ...props }: any) => {
    return (
      <div ref={forwardedRef} {...props}>
        {children}
      </div>
    );
  }
);

export const NavArea = withNavigation(
  ({ forwardedRef, children, ...props }: any) => {
    return (
      <div ref={forwardedRef} {...props}>
        {children}
      </div>
    );
  }
);
