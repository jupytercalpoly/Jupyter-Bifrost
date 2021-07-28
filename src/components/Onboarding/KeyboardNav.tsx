import { useEffect, useRef, useState } from 'react';
interface KeyboardNavConfig {
  jumpTo?: { [key: string]: string };
  keyEvents?: { [key: string]: (e: KeyboardEvent) => void };
}

export function useKeyboardNavigation({
  jumpTo = {},
  keyEvents = {},
}: KeyboardNavConfig = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const setFocusIndex = useState(0)[1];

  useEffect(() => {
    const el = containerRef.current?.querySelector('[data-immediate-focus]') as
      | HTMLElement
      | undefined;
    el?.focus();
  }, []);

  useEffect(() => {
    function incrementElement(amount: number) {
      setFocusIndex((i) => {
        if (!containerRef.current) {
          return i;
        }
        const focusEls = containerRef.current.querySelectorAll(
          '[data-focusable]'
        ) as NodeListOf<HTMLElement>;
        if (!focusEls.length) {
          return i;
        }
        focusEls.forEach((el) => {
          el.classList.remove('focused');
          el.blur();
        });
        const newI = Math.max(Math.min(focusEls.length - 1, i + amount), 0);
        focusEls[newI].focus();
        focusEls[newI].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        focusEls[newI].classList.add('focused');
        return newI;
      });
    }

    function jumpToElement(id: string) {
      if (!containerRef.current) {
        return;
      }
      const focusEls = Array.from(
        containerRef.current.querySelectorAll('[data-focusable]')
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

    window.addEventListener('keydown', handleKeypress);
    return () => void window.removeEventListener('keydown', handleKeypress);
  }, [containerRef.current]);

  return containerRef;
}
