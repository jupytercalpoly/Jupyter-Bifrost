import { useEffect, useRef, useState } from 'react';
interface KeyboardNavConfig {
  jumpTo?: { [key: string]: string };
  keyEvents?: { [key: string]: (e: KeyboardEvent) => void };
}

/**
 * Data selectors used by useKeyboardNavigation to implement navigation behavior.
 */
const DataSelector = {
  /**
   * All focusable elements will be navigable via the ArrowUp and ArrowDown keys. Setting the attribute equal to a string
   * will allow you to tag the element with an id, which can be used by jumpTo to select an element directly on a keypress.
   */
  FOCUSABLE: '[data-focusable]',
  /**
   * The first child found with immediate focus will be focused when the component first mounts.
   */
  IMMEDIATE_FOCUS: '[data-immediate-focus]',
};

/**
 * Allows users to navigate through the application using ArrowUp and ArrowDown.
 * @param jumpTo maps key identifiers to data-focusable ids. When the key is pressed the element with the given id is focused.
 * @param keyEvents maps key identifiers to event handlers.
 */
export function useKeyboardNavigation({
  jumpTo = {},
  keyEvents = {},
}: KeyboardNavConfig = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const setFocusIndex = useState(0)[1];

  useEffect(() => {
    const el = containerRef.current?.querySelector(
      DataSelector.IMMEDIATE_FOCUS
    ) as HTMLElement | undefined;
    el?.focus();
  }, []);

  useEffect(() => {
    /**
     * Adjusts focus to a new element based on the step.
     * @param step delta between the current value and the new focus index.
     */
    function incrementElement(step: number) {
      setFocusIndex((i) => {
        if (!containerRef.current) {
          return i;
        }
        const focusEls = containerRef.current.querySelectorAll(
          DataSelector.FOCUSABLE
        ) as NodeListOf<HTMLElement>;
        if (!focusEls.length) {
          return i;
        }
        focusEls.forEach((el) => {
          el.classList.remove('focused');
          el.blur();
        });
        const newI = Math.max(Math.min(focusEls.length - 1, i + step), 0);
        focusEls[newI].focus();
        focusEls[newI].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        focusEls[newI].classList.add('focused');
        return newI;
      });
    }

    /**
     * Focuses an element with the given id.
     * @param id The string value of data-focusable to find in the DOM.
     */
    function jumpToElement(id: string) {
      if (!containerRef.current) {
        return;
      }
      const focusEls = Array.from(
        containerRef.current.querySelectorAll(DataSelector.FOCUSABLE)
      ) as HTMLElement[];
      if (!focusEls.length) {
        return;
      }
      focusEls.forEach((el) => {
        el.classList.remove('focused');
        el.blur();
      });
      const i = focusEls.findIndex((el) => el.dataset.focusable === id);
      if (i < 0) {
        return;
      }
      focusEls[i].focus();
      focusEls[i].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      focusEls[i].classList.add('focused');
      setFocusIndex(i);
    }

    function handleKeypress(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          incrementElement(-1);
          break;

        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          incrementElement(1);
          break;

        default:
          break;
      }
      if (e.key in jumpTo) {
        jumpToElement(jumpTo[e.key]);
      }
      e.key in keyEvents && keyEvents[e.key](e);
    }

    containerRef.current?.addEventListener('keydown', handleKeypress);
    return () =>
      void containerRef.current?.removeEventListener('keydown', handleKeypress);
  }, [containerRef.current]);

  return containerRef;
}
